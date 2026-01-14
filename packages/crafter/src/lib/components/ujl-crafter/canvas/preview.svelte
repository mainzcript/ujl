<!-- Preview that composes the UJLC document and renders it with UJLT tokens via AdapterRoot. -->
<script lang="ts">
	import type { UJLCDocument, UJLTDocument, UJLAbstractNode } from '@ujl-framework/types';
	import { Composer } from '@ujl-framework/core';
	import { AdapterRoot } from '@ujl-framework/adapter-svelte';
	import '@ujl-framework/adapter-svelte/styles';
	import { getContext } from 'svelte';
	import { CRAFTER_CONTEXT, type CrafterContext } from '../context.js';
	import { logger } from '$lib/utils/logger.js';

	import type { CrafterMode } from '../types.js';

	let {
		ujlcDocument,
		ujltDocument,
		mode = 'system',
		crafterMode = 'editor'
	}: {
		ujlcDocument: UJLCDocument;
		ujltDocument: UJLTDocument;
		mode?: 'light' | 'dark' | 'system';
		crafterMode?: CrafterMode;
	} = $props();

	const crafter = getContext<CrafterContext>(CRAFTER_CONTEXT);

	const selectedNodeId = $derived.by(() => {
		return crafter.getMode() === 'editor' ? crafter.getSelectedNodeId() : null;
	});

	const composer = new Composer();

	// AST composition with async media resolution
	let ast = $state<UJLAbstractNode | null>(null);

	// Create media resolver from MediaService
	const mediaResolver = {
		async resolve(id: string): Promise<string | null> {
			const mediaService = crafter.getMediaService();
			const entry = await mediaService.get(id);
			return entry?.dataUrl ?? null;
		}
	};

	// Re-compose when document changes
	$effect(() => {
		composer.compose(ujlcDocument, mediaResolver).then((composedAst) => {
			ast = composedAst;
		});
	});

	const tokenSet = $derived(ujltDocument.ujlt.tokens);

	function handleModuleClick(moduleId: string) {
		if (crafterMode !== 'editor' || crafter.getMode() !== 'editor') return;
		crafter.expandToNode(moduleId);
		crafter.setSelectedNodeId(moduleId);
		scrollToNodeInTree(moduleId);
	}

	function scrollToNodeInTree(nodeId: string) {
		// Timeout allows tree expansion animation to complete before scrolling
		setTimeout(() => {
			const treeItem = document.querySelector(`[data-tree-node-id="${nodeId}"]`);
			if (treeItem) {
				treeItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
			} else {
				logger.warn('Tree item not found after expansion:', nodeId);
			}
		}, 300);
	}

	let scrollContainerRef: HTMLDivElement;

	function getScrollContainer(): HTMLDivElement | null {
		return (
			(document.querySelector('[data-ujl-scroll-container="canvas"]') as HTMLDivElement | null) ??
			scrollContainerRef
		);
	}

	/**
	 * Scroll to component in preview; retry if DOM or ref is not ready.
	 */
	function scrollToComponentInPreview(moduleId: string, retries = 3) {
		const element = document.querySelector(`[data-ujl-module-id="${moduleId}"]`);
		const container = getScrollContainer();

		if (!element || !container) {
			if (retries > 0) {
				setTimeout(() => scrollToComponentInPreview(moduleId, retries - 1), 100);
			}
			return;
		}

		const elementRect = element.getBoundingClientRect();
		const containerRect = container.getBoundingClientRect();

		const targetScroll =
			container.scrollTop +
			(elementRect.top - containerRect.top) -
			containerRect.height / 2 +
			elementRect.height / 2;

		container.scrollTo({
			top: Math.max(0, targetScroll),
			behavior: 'smooth'
		});
	}

	$effect(() => {
		// Only show selection in editor mode
		if (crafterMode !== 'editor') {
			document.querySelectorAll('[data-ujl-module-id].ujl-selected').forEach((el) => {
				el.classList.remove('ujl-selected');
			});
			return;
		}

		document.querySelectorAll('[data-ujl-module-id].ujl-selected').forEach((el) => {
			el.classList.remove('ujl-selected');
		});

		if (selectedNodeId) {
			const element = document.querySelector(`[data-ujl-module-id="${selectedNodeId}"]`);
			if (element) {
				element.classList.add('ujl-selected');
				scrollToComponentInPreview(selectedNodeId);
			}
		}
	});
</script>

<div
	bind:this={scrollContainerRef}
	class="h-full w-full"
	class:ujl-editor-mode={crafterMode === 'editor'}
>
	{#if ast}
		<AdapterRoot
			node={ast}
			{tokenSet}
			{mode}
			showMetadata={true}
			eventCallback={crafterMode === 'editor' ? handleModuleClick : undefined}
		/>
	{:else}
		<div class="flex h-full w-full items-center justify-center">
			<div class="text-sm text-muted-foreground">Loading preview...</div>
		</div>
	{/if}
</div>

<style>
	/* Only show hover/selection styles in editor mode */
	:global(.ujl-editor-mode [data-ujl-module-id][role='button']:not(.ujl-selected):hover),
	:global(.ujl-editor-mode button[data-ujl-module-id]:not(.ujl-selected):hover) {
		outline: 2px solid oklch(var(--primary) / 0.7);
		outline-offset: 2px;
		border-radius: var(--radius);
	}

	:global(.ujl-editor-mode [data-ujl-module-id].ujl-selected) {
		outline: 2px solid oklch(var(--primary));
		outline-offset: 2px;
		border-radius: var(--radius);
	}

	:global(
		.ujl-editor-mode
			[data-ujl-module-id][role='button']:not(.ujl-selected):has(
				[data-ujl-module-id][role='button']:hover
			)
	),
	:global(
		.ujl-editor-mode
			[data-ujl-module-id][role='button']:not(.ujl-selected):has(button[data-ujl-module-id]:hover)
	),
	:global(
		.ujl-editor-mode
			button[data-ujl-module-id]:not(.ujl-selected):has([data-ujl-module-id][role='button']:hover)
	),
	:global(
		.ujl-editor-mode
			button[data-ujl-module-id]:not(.ujl-selected):has(button[data-ujl-module-id]:hover)
	) {
		outline: none !important;
	}
</style>
