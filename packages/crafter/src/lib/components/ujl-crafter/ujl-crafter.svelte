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
	import { App, AppLogo, AppHeader, AppSidebar, AppCanvas, AppPanel } from '$lib/components/ui/app';
	import { Badge } from '@ujl-framework/ui';
	import { setContext } from 'svelte';
	import { toast } from 'svelte-sonner';
	import type { UJLCDocument, UJLTDocument } from '@ujl-framework/types';
	import { validateUJLCDocument, validateUJLTDocument } from '@ujl-framework/types';
	import { Composer } from '@ujl-framework/core';

	// Import from stores
	import {
		createCrafterStore,
		createMediaServiceFactory,
		type CrafterStore,
		type CrafterStoreDeps
	} from '$lib/stores/index.js';

	// Context keys (unified namespace)
	import { CRAFTER_CONTEXT, COMPOSER_CONTEXT } from './context.js';

	// Child components
	import Header from './header/header.svelte';
	import Editor from './sidebar/editor.svelte';
	import Preview from './canvas/preview.svelte';
	import PropertiesPanel from './panel/properties-panel.svelte';
	import DesignerPanel from './panel/designer-panel.svelte';
	import CrafterEffects from './crafter-effects.svelte';

	// Default documents
	import showcaseDocument from '@ujl-framework/examples/documents/showcase' with { type: 'json' };
	import defaultTheme from '@ujl-framework/examples/themes/default' with { type: 'json' };

	// Utils
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
	}

	const {
		store: externalStore,
		composer: externalComposer,
		initialContent,
		initialTheme
	}: Props = $props();

	// ============================================
	// STORE CREATION
	// ============================================

	// Store and composer: external (from class) or internal (for direct Svelte usage)
	const { store, composer } = (() => {
		if (externalStore) {
			// External store: use provided store and composer
			return {
				store: externalStore,
				composer: externalComposer ?? new Composer()
			};
		} else {
			// Internal store: create everything new
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
