<!--
	UJL Crafter - Main Component
	
	This is the root component for the Crafter visual editor.
	It creates the CrafterStore and provides it via Svelte context.
	
	Architecture:
	- Single Source of Truth: All state managed by CrafterStore
	- Dependency Injection: Store receives all dependencies via factory
	- Unidirectional Data Flow: State flows down, actions flow up
	- Context-based API: Child components access store via context
-->
<script lang="ts">
	import { App, AppLogo, AppHeader, AppSidebar, AppCanvas, AppPanel } from '../ui/app/index.js';
	import { Badge, UJLTheme } from '@ujl-framework/ui';
	import { setContext } from 'svelte';
	import { toast } from 'svelte-sonner';
	import type { UJLCDocument, UJLTDocument } from '@ujl-framework/types';
	import { validateUJLCDocument, validateUJLTDocument } from '@ujl-framework/types';
	import { Composer } from '@ujl-framework/core';

	import {
		createCrafterStore,
		createMediaServiceFactory,
		type CrafterStore,
		type CrafterStoreDeps
	} from '$lib/stores/index.js';

	import { CRAFTER_CONTEXT, COMPOSER_CONTEXT, SHADOW_ROOT_CONTEXT } from './context.js';

	import Header from './header/header.svelte';
	import Editor from './sidebar/editor.svelte';
	import Preview from './canvas/preview.svelte';
	import PropertiesPanel from './panel/properties-panel.svelte';
	import DesignerPanel from './panel/designer-panel.svelte';
	import CrafterEffects from './crafter-effects.svelte';

	import showcaseDocument from '@ujl-framework/examples/documents/showcase' with { type: 'json' };
	import defaultTheme from '@ujl-framework/examples/themes/default' with { type: 'json' };

	import { downloadJsonFile, readJsonFile } from '$lib/utils/files.js';
	import { logger } from '$lib/utils/logger.js';

	// ============================================
	// PROPS
	// ============================================

	interface Props {
		/** External store (from UJLCrafter class) */
		store?: CrafterStore;
		/** External composer (from UJLCrafter class, only if store is provided) */
		composer?: Composer;
		/** Initial content document (optional, defaults to showcase, only if no external store) */
		initialContent?: UJLCDocument;
		/** Initial theme document (optional, defaults to default theme, only if no external store) */
		initialTheme?: UJLTDocument;
		/** Editor theme document (optional, defaults to default theme) - used for Crafter UI styling */
		editorTheme?: UJLTDocument;
		/** Shadow Root reference for scoped DOM queries (from UJLCrafter class) */
		shadowRoot?: ShadowRoot;
	}

	const {
		store: externalStore,
		composer: externalComposer,
		initialContent,
		initialTheme,
		editorTheme,
		shadowRoot
	}: Props = $props();

	// ============================================
	// STORE CREATION
	// ============================================

	const { store, composer } = (() => {
		if (externalStore) {
			return {
				store: externalStore,
				composer: externalComposer ?? new Composer()
			};
		} else {
			// Capture initial props in a closure - we intentionally don't react to prop changes
			const { validatedContent, validatedTheme } = (() => {
				const content = initialContent;
				const theme = initialTheme;
				return {
					validatedContent: validateUJLCDocument(
						(content ?? showcaseDocument) as unknown as UJLCDocument
					),
					validatedTheme: validateUJLTDocument((theme ?? defaultTheme) as unknown as UJLTDocument)
				};
			})();

			const composer = new Composer();

			const mediaServiceFactory = createMediaServiceFactory({
				showToasts: true,
				onConnectionError: (error, endpoint) => {
					logger.error('Media backend connection error:', error, endpoint);
				}
			});

			const storeDeps: CrafterStoreDeps = {
				initialUjlcDocument: validatedContent,
				initialUjltDocument: validatedTheme,
				composer,
				createMediaService: mediaServiceFactory
			};

			const store = createCrafterStore(storeDeps);

			return { store, composer };
		}
	})();

	setContext(CRAFTER_CONTEXT, store);
	setContext(COMPOSER_CONTEXT, composer);
	// Use getter to avoid Svelte warning about capturing initial value
	setContext(SHADOW_ROOT_CONTEXT, {
		get value() {
			return shadowRoot;
		}
	});

	// ============================================
	// PORTAL CONTAINER
	// ============================================

	// Portal container for overlay components (dropdowns, dialogs, etc.)
	// This ensures overlays render inside Shadow DOM and inherit styles
	let portalContainerRef: HTMLDivElement | undefined = $state();

	// ============================================
	// EDITOR THEME
	// ============================================

	const editorTokenSet = $derived(
		(editorTheme
			? validateUJLTDocument(editorTheme)
			: validateUJLTDocument(defaultTheme as unknown as UJLTDocument)
		).ujlt.tokens
	);

	// ============================================
	// IMPORT / EXPORT HANDLERS
	// ============================================

	function handleExportTheme() {
		downloadJsonFile(store.ujltDocument, 'theme.ujlt.json');
	}

	function handleExportContent() {
		downloadJsonFile(store.ujlcDocument, 'content.ujlc.json');
	}

	async function handleImportTheme(file: File) {
		const data = await readJsonFile(file);
		if (!data) {
			toast.error('Failed to read or parse the theme file.');
			return;
		}
		try {
			const validatedDocument = validateUJLTDocument(data as unknown as UJLTDocument);
			store.setUjltDocument(validatedDocument);
			toast.success('Theme imported successfully.');
		} catch (error) {
			logger.error('Theme validation failed:', error);
			toast.error('Invalid theme file', {
				description: 'The imported theme file is invalid. Please check the file format.'
			});
		}
	}

	async function handleImportContent(file: File) {
		const data = await readJsonFile(file);
		if (!data) {
			toast.error('Failed to read or parse the content file.');
			return;
		}
		try {
			const validatedDocument = validateUJLCDocument(data as unknown as UJLCDocument);
			store.setUjlcDocument(validatedDocument);
			toast.success('Content imported successfully.');
		} catch (error) {
			logger.error('Content validation failed:', error);
			toast.error('Invalid content file', {
				description: 'The imported content file is invalid. Please check the file format.'
			});
		}
	}

	function handleSave() {
		toast.info('Save functionality coming soon!');
	}

	// ============================================
	// MODE CHANGE HANDLER
	// ============================================

	function handleModeChange(newMode: string | undefined) {
		if (newMode === 'editor' || newMode === 'designer') {
			store.setMode(newMode);
		}
	}

	// ============================================
	// VIEWPORT CHANGE HANDLER
	// ============================================

	function handleViewportTypeChange(type: string | undefined) {
		store.setViewportType(type);
	}
</script>

<UJLTheme
	tokens={editorTokenSet}
	class="h-screen"
	data-crafter-instance={store.instanceId}
	portalContainer={portalContainerRef}
>
	<App>
		<!-- Panel-Auto-Open and Close Callback Logic -->
		<CrafterEffects
			mode={store.mode}
			setSelectedNodeId={store.setSelectedNodeId}
			selectedNodeId={store.selectedNodeId}
		/>

		<AppLogo>
			<Badge>UJL</Badge>
		</AppLogo>

		<AppHeader>
			<Header
				mode={store.mode}
				onModeChange={handleModeChange}
				viewportType={store.viewportType}
				onViewportTypeChange={handleViewportTypeChange}
				onSave={handleSave}
				onImportTheme={handleImportTheme}
				onImportContent={handleImportContent}
				onExportTheme={handleExportTheme}
				onExportContent={handleExportContent}
			/>
		</AppHeader>

		<AppSidebar>
			<Editor rootSlot={store.rootSlot} />
		</AppSidebar>

		<AppCanvas>
			<div class="h-full">
				<div
					class="mx-auto min-w-[375px] duration-300"
					style={store.viewportSize ? `width: ${store.viewportSize}px;` : 'width: 100%;'}
				>
					<Preview
						ujlcDocument={store.ujlcDocument}
						ujltDocument={store.ujltDocument}
						crafterMode={store.mode}
						{editorTokenSet}
					/>
				</div>
			</div>
		</AppCanvas>

		<AppPanel>
			{#if store.mode === 'editor'}
				<PropertiesPanel />
			{:else}
				<DesignerPanel tokens={store.tokens} />
			{/if}
		</AppPanel>
	</App>

	<!-- Portal container for overlay components (dropdowns, dialogs, tooltips, etc.) -->
	<!-- Must be inside UJLTheme to inherit theme styles and CSS variables -->
	<div bind:this={portalContainerRef} data-ujl-portal-container class="contents"></div>
</UJLTheme>
