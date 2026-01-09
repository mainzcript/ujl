<script lang="ts">
	import {
		SidebarProvider,
		SidebarInset,
		Sidebar,
		SidebarHeader,
		SidebarContent,
		SidebarRail,
		Sheet,
		SheetContent,
		SheetHeader,
		SheetTitle,
		Text,
		Link
	} from '@ujl-framework/ui';
	import { setContext } from 'svelte';
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

	// Existing components for content
	import Editor from './sidebar-left/editor/editor.svelte';
	import Designer from './sidebar-left/designer/designer.svelte';
	import SidebarRightContent from './sidebar-right/sidebar-right.svelte';
	import Preview from './body/preview.svelte';
	import Header from './header/header.svelte';
	import { type CrafterMode, type ViewportSize } from './types.js';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	// ============================================================================
	// UI STATE
	// ============================================================================

	const RIGHT_SIDEBAR_BREAKPOINT = 1280;

	let containerRef: HTMLElement | null = $state(null);
	let containerWidth = $state(0);
	let rightSheetOpen = $state(false);

	// ToggleGroup uses strings, so we store as string and convert to number
	let viewportSizeString = $state<string | undefined>(undefined);

	let viewportSize = $derived<ViewportSize>(
		viewportSizeString ? (Number.parseInt(viewportSizeString) as ViewportSize) : null
	);

	let showRightSidebar = $derived(containerWidth >= RIGHT_SIDEBAR_BREAKPOINT);

	$effect(() => {
		if (!containerRef) return;

		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				containerWidth = entry.contentRect.width;
			}
		});

		observer.observe(containerRef);

		return () => {
			observer.disconnect();
		};
	});

	// ============================================================================
	// CRAFTER STATE (existing functionality)
	// ============================================================================

	/**
	 * Single Source of Truth: Load and validate documents
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

	function handleModeChange(newMode: string | undefined) {
		if (newMode === 'editor' || newMode === 'designer') {
			mode = newMode;
		}
	}

	/**
	 * Expanded node IDs in the navigation tree
	 */
	let expandedNodeIds = $state<Set<string>>(new Set());

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

	function setSelectedNodeId(nodeId: string | null): void {
		const url = new URL(page.url);
		if (nodeId) {
			url.searchParams.set('selected', nodeId);
		} else {
			url.searchParams.delete('selected');
		}
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(url, {
			replaceState: true,
			noScroll: true,
			keepFocus: true
		});
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
			alert('Failed to read or parse the theme file.');
			return;
		}
		try {
			const validatedDocument = validateUJLTDocument(data as unknown as UJLTDocument);
			ujltDocument = validatedDocument;
		} catch (error) {
			logger.error('Theme validation failed:', error);
			alert('The imported theme file is invalid. Please check the file format.');
		}
	}

	async function handleImportContent(file: File) {
		const data = await readJsonFile(file);
		if (!data) {
			alert('Failed to read or parse the content file.');
			return;
		}
		try {
			const validatedDocument = validateUJLCDocument(data as unknown as UJLCDocument);
			ujlcDocument = validatedDocument;
		} catch (error) {
			logger.error('Content validation failed:', error);
			alert('The imported content file is invalid. Please check the file format.');
		}
	}

	// ============================================================================
	// CONTEXT
	// ============================================================================

	const composer = new Composer();
	const operations = createOperations(() => ujlcDocument.ujlc.root, updateRootSlot, composer);

	const crafterContext: CrafterContext = {
		updateTokenSet,
		updateRootSlot,
		getRootSlot: () => ujlcDocument.ujlc.root,
		setSelectedNodeId,
		getExpandedNodeIds: () => expandedNodeIds,
		setNodeExpanded,
		expandToNode,
		operations
	};

	setContext(CRAFTER_CONTEXT, crafterContext);
	setContext(COMPOSER_CONTEXT, composer);
</script>

<div bind:this={containerRef} class="relative mx-auto flex w-full flex-1">
	<SidebarProvider>
		<!-- LEFT SIDEBAR -->
		<Sidebar variant="inset" side="left">
			<SidebarHeader>
				<div class="flex items-center gap-2 px-2 py-1">
					<span class="text-sm font-semibold">
						{mode === 'editor' ? 'Document' : 'Theme'}
					</span>
				</div>
			</SidebarHeader>
			<SidebarContent>
				{#if mode === 'editor'}
					<Editor slot={ujlcDocument.ujlc.root} />
				{:else}
					<Designer tokens={ujltDocument.ujlt.tokens} />
				{/if}
			</SidebarContent>
			<SidebarRail />
		</Sidebar>

		<!-- MAIN CONTENT AREA -->
		<SidebarInset
			class="overflow-hidden border border-border"
			style="height: calc(100svh - var(--spacing) * 4);"
		>
			<Header
				{mode}
				onModeChange={handleModeChange}
				{viewportSizeString}
				onViewportSizeChange={(size) => (viewportSizeString = size)}
				{showRightSidebar}
				onOpenRightSheet={() => (rightSheetOpen = true)}
				onSave={() => alert('Save functionality coming soon!')}
				onImportTheme={handleImportTheme}
				onImportContent={handleImportContent}
				onExportTheme={handleExportTheme}
				onExportContent={handleExportContent}
			/>

			<div class="flex h-0 flex-1 justify-center">
				<div
					class="mx-2 overflow-auto rounded border border-border/50 bg-muted/10 transition-all duration-300"
					style={viewportSize
						? `width: ${viewportSize}px; max-width: calc(100% - var(--spacing) * 4);`
						: 'width: 100%;'}
				>
					<div
						class="transition-all duration-300"
						style={viewportSize ? `width: ${viewportSize}px;` : 'width: 100%;'}
					>
						<Preview {ujlcDocument} {ujltDocument} />
					</div>
				</div>
			</div>

			<div class="flex shrink-0 items-center justify-center gap-4 p-2">
				<Text size="xs" intensity="muted">
					UJL Crafter ·
					<Link
						href="https://ujl-framework.org/"
						external={true}
						active={false}
						currentUrl={undefined}
						title="Info"
					>
						Landing Page
					</Link>
					·
					<Link
						href="https://ujl-framework.org/legal/imprint.html"
						external={true}
						active={false}
						currentUrl={undefined}
						title="Imprint"
					>
						Imprint
					</Link>
					·
					<Link
						href="https://ujl-framework.org/legal/privacy.html"
						external={true}
						active={false}
						currentUrl={undefined}
						title="Privacy"
					>
						Privacy
					</Link>
				</Text>
			</div>
		</SidebarInset>

		{#if showRightSidebar}
			<Sidebar variant="inset" side="right">
				<SidebarHeader>
					<div class="flex items-center gap-2 px-2 py-1">
						<span class="text-sm font-semibold">Properties</span>
					</div>
				</SidebarHeader>
				<SidebarContent>
					<SidebarRightContent />
				</SidebarContent>
			</Sidebar>
		{/if}
	</SidebarProvider>
</div>

<!-- Sheet for right panel when container is too narrow - outside Provider to avoid context issues -->
<Sheet bind:open={rightSheetOpen}>
	<SheetContent side="right" class="w-80">
		<SheetHeader>
			<SheetTitle>Properties</SheetTitle>
		</SheetHeader>
		<SidebarRightContent />
	</SheetContent>
</Sheet>
