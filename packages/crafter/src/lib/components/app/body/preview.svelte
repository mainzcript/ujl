<!-- Preview that composes the UJLC document and renders it with UJLT tokens via AdapterRoot. -->
<script lang="ts">
	import type { UJLCDocument, UJLTDocument } from '@ujl-framework/types';
	import { Composer } from '@ujl-framework/core';
	import { AdapterRoot } from '@ujl-framework/adapter-svelte';
	import '@ujl-framework/adapter-svelte/styles';
	import { getContext } from 'svelte';
	import { page } from '$app/state';
	import { CRAFTER_CONTEXT, type CrafterContext } from '../context.js';
	import { logger } from '$lib/utils/logger.js';

	let {
		ujlcDocument,
		ujltDocument,
		mode = 'system'
	}: {
		ujlcDocument: UJLCDocument;
		ujltDocument: UJLTDocument;
		mode?: 'light' | 'dark' | 'system';
	} = $props();

	const crafter = getContext<CrafterContext>(CRAFTER_CONTEXT);

	const selectedNodeId = $derived(page.url.searchParams.get('selected'));

	const composer = new Composer();
	const ast = $derived.by(() => composer.compose(ujlcDocument));

	const tokenSet = $derived(ujltDocument.ujlt.tokens);

	function handleModuleClick(moduleId: string) {
		crafter.expandToNode(moduleId);
		crafter.setSelectedNodeId(moduleId);
		scrollToNodeInTree(moduleId);
	}

	function scrollToNodeInTree(nodeId: string) {
		// Wait for tree to expand and DOM to update
		// Increased timeout to allow for expansion animation
		setTimeout(() => {
			const treeItem = document.querySelector(`[data-tree-node-id="${nodeId}"]`);
			if (treeItem) {
				treeItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
			} else {
				logger.warn('Tree item not found after expansion:', nodeId);
			}
		}, 300);
	}

	/**
	 * Check if element is mostly out of view (>60% outside its scroll container)
	 */
	function isElementMostlyOutOfView(element: Element, container: Element): boolean {
		const elementRect = element.getBoundingClientRect();
		const containerRect = container.getBoundingClientRect();

		const visibleTop = Math.max(elementRect.top, containerRect.top);
		const visibleBottom = Math.min(elementRect.bottom, containerRect.bottom);
		const visibleHeight = Math.max(0, visibleBottom - visibleTop);
		const elementHeight = elementRect.height;

		if (elementHeight === 0) return true;

		const visiblePercentage = (visibleHeight / elementHeight) * 100;
		return visiblePercentage < 60;
	}

	let scrollContainerRef: HTMLDivElement;

	/**
	 * Scroll to component in preview (only if >40% out of view)
	 */
	function scrollToComponentInPreview(moduleId: string) {
		const element = document.querySelector(`[data-ujl-module-id="${moduleId}"]`);

		if (!element) {
			return;
		}

		if (!scrollContainerRef) {
			return;
		}

		if (isElementMostlyOutOfView(element, scrollContainerRef)) {
			const elementRect = element.getBoundingClientRect();
			const containerRect = scrollContainerRef.getBoundingClientRect();

			const targetScroll =
				scrollContainerRef.scrollTop +
				(elementRect.top - containerRect.top) -
				containerRect.height / 2 +
				elementRect.height / 2;

			scrollContainerRef.scrollTo({
				top: targetScroll,
				behavior: 'smooth'
			});
		}
	}

	$effect(() => {
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

<div bind:this={scrollContainerRef} class="h-full w-full overflow-y-auto">
	<AdapterRoot node={ast} {tokenSet} {mode} showMetadata={true} eventCallback={handleModuleClick} />
</div>

<style>
	:global([data-ujl-module-id][role='button']:not(.ujl-selected):hover),
	:global(button[data-ujl-module-id]:not(.ujl-selected):hover) {
		outline: 2px solid oklch(var(--primary) / 0.7);
		outline-offset: 2px;
		border-radius: var(--radius);
	}

	:global([data-ujl-module-id].ujl-selected) {
		outline: 2px solid oklch(var(--primary));
		outline-offset: 2px;
		border-radius: var(--radius);
	}

	:global([data-ujl-module-id][role='button']:has([data-ujl-module-id][role='button']:hover)),
	:global([data-ujl-module-id][role='button']:has(button[data-ujl-module-id]:hover)),
	:global(button[data-ujl-module-id]:has([data-ujl-module-id][role='button']:hover)),
	:global(button[data-ujl-module-id]:has(button[data-ujl-module-id]:hover)) {
		outline: none !important;
	}
</style>
