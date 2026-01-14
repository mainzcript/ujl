<script lang="ts">
	import { App, AppLogo, AppHeader, AppSidebar, AppCanvas, AppPanel } from '$lib/components/ui/app';
	import { Badge } from '@ujl-framework/ui';
	import { setContext } from 'svelte';
	import { toast } from 'svelte-sonner';
	import Header from './header/header.svelte';
	import Editor from './sidebar/editor.svelte';
	import Preview from './canvas/preview.svelte';
	import PropertiesPanel from './panel/properties-panel.svelte';
	import DesignerPanel from './panel/designer-panel.svelte';
	import CrafterEffects from './crafter-effects.svelte';
	import type {
		UJLCDocument,
		UJLTDocument,
		UJLTTokenSet,
		UJLCSlotObject
	} from '@ujl-framework/types';
	import { validateUJLCDocument, validateUJLTDocument } from '@ujl-framework/types';
	import showcaseDocument from '@ujl-framework/examples/documents/showcase' with { type: 'json' };
	import defaultTheme from '@ujl-framework/examples/themes/default' with { type: 'json' };
	import {
		CRAFTER_CONTEXT,
		COMPOSER_CONTEXT,
		createOperations,
		findPathToNode,
		type CrafterContext
	} from './context.js';
	import { Composer } from '@ujl-framework/core';
	import { downloadJsonFile, readJsonFile } from '$lib/utils/files.ts';
	import { logger } from '$lib/utils/logger.js';
	import { InlineMediaService, BackendMediaService } from '$lib/services/index.js';
	import { type CrafterMode, type ViewportSize } from './types.js';
	import { isRootNode } from '$lib/utils/ujlc-tree.js';

	// Note: App context is set by the <App> component, we access it via useApp() where needed

	// ============================================================================
	// VIEWPORT SIZE STATE
	// ============================================================================

	// Viewport type for toggle group
	let viewportType = $state<string | undefined>(undefined);

	// Viewport-Size-Map
	const VIEWPORT_SIZES: Record<string, number> = {
		desktop: 1024,
		tablet: 768,
		mobile: 375
	};

	// Derived viewport size (Pixel oder null)
	const viewportSize = $derived<ViewportSize>(
		viewportType ? ((VIEWPORT_SIZES[viewportType] ?? null) as ViewportSize) : null
	);

	// ============================================================================
	// DOCUMENT STATE
	// ============================================================================

	/**
	 * Single Source of Truth: Load and validate documents
	 *
	 * Both validation functions throw ZodError if validation fails.
	 * This ensures only valid documents are used in the application.
	 */
	let ujlcDocument = $state<UJLCDocument>(
		validateUJLCDocument(showcaseDocument as unknown as UJLCDocument)
	);
	let ujltDocument = $state<UJLTDocument>(
		validateUJLTDocument(defaultTheme as unknown as UJLTDocument)
	);

	/**
	 * Global mode state for the Crafter.
	 */
	let mode = $state<CrafterMode>('editor');

	/**
	 * Locally scoped selection state (no URL manipulation).
	 */
	let selectedNodeId = $state<string | null>(null);

	function handleModeChange(newMode: string | undefined) {
		if (newMode === 'editor' || newMode === 'designer') {
			mode = newMode;
			if (newMode === 'designer') {
				setSelectedNodeId(null);
			}
		}
	}

	/**
	 * Expanded node IDs in the navigation tree
	 * This controls which nodes show their children in the tree view
	 */
	let expandedNodeIds = $state<Set<string>>(new Set());

	/**
	 * Media Library View Active State
	 * Controls whether the sidebar shows the full-screen media library view
	 */
	let isMediaLibraryViewActive = $state(false);

	/**
	 * Media Library Context
	 * Stores which field is currently being edited in the media library
	 */
	let mediaLibraryContext = $state<import('./context.js').MediaLibraryContext>(null);

	/**
	 * Toggle a node's expanded state
	 */
	function setNodeExpanded(nodeId: string, expanded: boolean) {
		if (expanded) {
			expandedNodeIds = new Set([...expandedNodeIds, nodeId]);
		} else {
			expandedNodeIds = new Set([...Array.from(expandedNodeIds).filter((id) => id !== nodeId)]);
		}
	}

	function expandToNode(nodeId: string) {
		const path = findPathToNode(ujlcDocument.ujlc.root, nodeId);
		if (!path) {
			logger.warn('Could not find path to node:', nodeId);
			return;
		}
		expandedNodeIds = new Set([...expandedNodeIds, ...path]);
	}

	function updateTokenSet(fn: (t: UJLTTokenSet) => UJLTTokenSet) {
		const newTokenSet = fn(ujltDocument.ujlt.tokens);
		ujltDocument = {
			...ujltDocument,
			ujlt: {
				...ujltDocument.ujlt,
				tokens: newTokenSet
			}
		};
	}

	function updateRootSlot(fn: (s: UJLCSlotObject) => UJLCSlotObject) {
		const currentSlot = ujlcDocument.ujlc.root;
		const newSlot = fn(currentSlot);
		ujlcDocument = {
			...ujlcDocument,
			ujlc: {
				...ujlcDocument.ujlc,
				root: newSlot
			}
		};
	}

	/**
	 * Updates the media library by applying a functional updater to it.
	 * This is the only mutation entrypoint for media library and ensures immutable updates.
	 *
	 * @param fn - Function that receives the current media library and returns a new one
	 *              Must return a new object, not mutate the input
	 */
	function updateMedia(fn: (m: typeof ujlcDocument.ujlc.media) => typeof ujlcDocument.ujlc.media) {
		const currentMedia = ujlcDocument.ujlc.media;
		const newMedia = fn(currentMedia);
		ujlcDocument = {
			...ujlcDocument,
			ujlc: {
				...ujlcDocument.ujlc,
				media: newMedia
			}
		};
	}

	function setSelectedNodeId(nodeId: string | null): void {
		if (nodeId && (mode !== 'editor' || isRootNode(nodeId))) return;
		selectedNodeId = nodeId;
	}

	// ============================================================================
	// IMPORT / EXPORT
	// ============================================================================

	function handleExportTheme() {
		downloadJsonFile(ujltDocument, 'theme.ujlt.json');
	}

	function handleExportContent() {
		downloadJsonFile(ujlcDocument, 'content.ujlc.json');
	}

	async function handleImportTheme(file: File) {
		const data = await readJsonFile(file);
		if (!data) {
			toast.error('Failed to read or parse the theme file.');
			return;
		}
		try {
			const validatedDocument = validateUJLTDocument(data as unknown as UJLTDocument);
			ujltDocument = validatedDocument;
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
			ujlcDocument = validatedDocument;
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

	// ============================================================================
	// CONTEXT SETUP
	// ============================================================================

	const composer = new Composer();
	const operations = createOperations(() => ujlcDocument.ujlc.root, updateRootSlot, composer);

	/**
	 * Cached media service that automatically recreates when configuration changes.
	 * Uses Svelte 5's $derived to track media_library config changes.
	 * This ensures only one service instance exists and avoids repeated connection checks.
	 */
	const mediaService = $derived.by(() => {
		const config = ujlcDocument.ujlc.meta.media_library;

		if (config.storage === 'backend') {
			const apiKey = import.meta.env.PUBLIC_MEDIA_API_KEY;

			if (!apiKey) {
				logger.warn(
					'PUBLIC_MEDIA_API_KEY not found in environment. Backend media service may not work properly.'
				);
			}

			const service = new BackendMediaService(config.endpoint, apiKey);

			// Check connection asynchronously (don't block initialization)
			service.checkConnection().then((status) => {
				if (!status.connected) {
					logger.error('Backend Media Service is not reachable:', status.error);
					toast.error('Media Library Backend Unavailable', {
						description: `${status.error}\n\nPlease check:\n- Is the backend service running?\n- Is the endpoint correct? (${config.endpoint})\n- Is the API key configured in .env.local?`
					});
				}
			});

			return service;
		}

		return new InlineMediaService(() => ujlcDocument.ujlc.media, updateMedia);
	});

	const crafterContext: CrafterContext = {
		isMediaLibraryViewActive: () => isMediaLibraryViewActive,
		setMediaLibraryViewActive: (
			active: boolean,
			context?: import('./context.js').MediaLibraryContext
		) => {
			isMediaLibraryViewActive = active;
			if (context !== undefined) {
				mediaLibraryContext = context;
			}
			if (!active) {
				mediaLibraryContext = null;
			}
		},
		getMediaLibraryContext: () => mediaLibraryContext,
		updateTokenSet,
		updateRootSlot,
		updateMedia,
		getMedia: () => ujlcDocument.ujlc.media,
		getMediaService: () => mediaService,
		getMeta: () => ujlcDocument.ujlc.meta,
		getRootSlot: () => ujlcDocument.ujlc.root,
		setSelectedNodeId,
		getSelectedNodeId: () => selectedNodeId,
		getMode: () => mode,
		getExpandedNodeIds: () => expandedNodeIds,
		setNodeExpanded,
		expandToNode,
		operations
	};

	setContext(CRAFTER_CONTEXT, crafterContext);
	setContext(COMPOSER_CONTEXT, composer);
</script>

<App>
	<!-- Panel-Auto-Open and Close Callback Logic -->
	<CrafterEffects {mode} {setSelectedNodeId} {selectedNodeId} />

	<AppLogo>
		<Badge>UJL</Badge>
	</AppLogo>

	<AppHeader>
		<Header
			{mode}
			onModeChange={handleModeChange}
			{viewportType}
			onViewportTypeChange={(type) => (viewportType = type)}
			onSave={handleSave}
			onImportTheme={handleImportTheme}
			onImportContent={handleImportContent}
			onExportTheme={handleExportTheme}
			onExportContent={handleExportContent}
		/>
	</AppHeader>

	<AppSidebar>
		<Editor rootSlot={ujlcDocument.ujlc.root} />
	</AppSidebar>

	<AppCanvas>
		<div class="h-full">
			<div
				class="mx-auto min-w-[375px] duration-300"
				style={viewportSize ? `width: ${viewportSize}px;` : 'width: 100%;'}
			>
				<Preview {ujlcDocument} {ujltDocument} crafterMode={mode} />
			</div>
		</div>
	</AppCanvas>

	<AppPanel>
		{#if mode === 'editor'}
			<PropertiesPanel />
		{:else}
			<DesignerPanel tokens={ujltDocument.ujlt.tokens} />
		{/if}
	</AppPanel>
</App>
