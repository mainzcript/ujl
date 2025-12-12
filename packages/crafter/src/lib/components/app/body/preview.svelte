<!-- Preview that composes the UJLC document and renders it with UJLT tokens via AdapterRoot. -->
<script lang="ts">
	import type { UJLCDocument, UJLTDocument } from '@ujl-framework/types';
	import { Composer } from '@ujl-framework/core';
	import { AdapterRoot } from '@ujl-framework/adapter-svelte';
	import '@ujl-framework/adapter-svelte/styles';
	import { getContext } from 'svelte';
	import { page } from '$app/stores';
	import { CRAFTER_CONTEXT, type CrafterContext } from '../context.js';

	let {
		ujlcDocument,
		ujltDocument,
		mode = 'system'
	}: {
		ujlcDocument: UJLCDocument;
		ujltDocument: UJLTDocument;
		mode?: 'light' | 'dark' | 'system';
	} = $props();

	// Crafter Context für Zugriff auf setSelectedNodeId
	const crafter = getContext<CrafterContext>(CRAFTER_CONTEXT);

	// Get selected node ID from URL
	const selectedNodeId = $derived($page.url.searchParams.get('selected'));

	// Compose document to AST (reactive)
	const composer = new Composer();
	const ast = $derived.by(() => composer.compose(ujlcDocument));

	// Extract token set (reactive)
	const tokenSet = $derived(ujltDocument.ujlt.tokens);

	// Handler für Module-Clicks im Preview
	function handleModuleClick(moduleId: string) {
		console.log('[Preview] Module clicked:', moduleId);

		// 1. Expand tree to show the clicked node
		crafter.expandToNode(moduleId);

		// 2. Set selected node (triggers URL update and re-render)
		crafter.setSelectedNodeId(moduleId);

		// 3. Scroll to selected node in nav tree
		scrollToNodeInTree(moduleId);
	}

	// Helper: Scroll to node in navigation tree
	function scrollToNodeInTree(nodeId: string) {
		// Wait for tree to expand and DOM to update
		// Increased timeout to allow for expansion animation
		setTimeout(() => {
			const treeItem = document.querySelector(`[data-tree-node-id="${nodeId}"]`);
			if (treeItem) {
				treeItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
			} else {
				console.warn('[Preview] Tree item not found after expansion:', nodeId);
			}
		}, 300);
	}

	/**
	 * Check if element is mostly out of view (>60% outside its scroll container)
	 */
	function isElementMostlyOutOfView(element: Element, container: Element): boolean {
		const elementRect = element.getBoundingClientRect();
		const containerRect = container.getBoundingClientRect();

		// Calculate visible portion within container
		const visibleTop = Math.max(elementRect.top, containerRect.top);
		const visibleBottom = Math.min(elementRect.bottom, containerRect.bottom);
		const visibleHeight = Math.max(0, visibleBottom - visibleTop);
		const elementHeight = elementRect.height;

		// If element height is 0, consider it out of view
		if (elementHeight === 0) return true;

		const visiblePercentage = (visibleHeight / elementHeight) * 100;

		// Return true if less than 60% is visible (= more than 40% is out of view)
		return visiblePercentage < 60;
	}

	// Store reference to our scroll container
	let scrollContainerRef: HTMLDivElement;

	/**
	 * Scroll to component in preview (only if >40% out of view)
	 */
	function scrollToComponentInPreview(moduleId: string) {
		const element = document.querySelector(`[data-ujl-module-id="${moduleId}"]`);

		if (!element) {
			// console.warn(`[Preview] Component with ID ${moduleId} not found in preview`);
			return;
		}

		if (!scrollContainerRef) {
			// console.warn('[Preview] Scroll container ref not available');
			return;
		}

		// Only scroll if element is mostly out of view
		if (isElementMostlyOutOfView(element, scrollContainerRef)) {
			// Calculate the scroll position manually for smooth scrolling within the container
			const elementRect = element.getBoundingClientRect();
			const containerRect = scrollContainerRef.getBoundingClientRect();

			// Calculate target scroll position (center the element)
			const targetScroll =
				scrollContainerRef.scrollTop +
				(elementRect.top - containerRect.top) -
				containerRect.height / 2 +
				elementRect.height / 2;

			// Smooth scroll to position
			scrollContainerRef.scrollTo({
				top: targetScroll,
				behavior: 'smooth'
			});
		}
	}

	// Reactive effect: Update visual highlight and scroll when selected node changes
	$effect(() => {
		// Remove all previous highlights
		document.querySelectorAll('[data-ujl-module-id].ujl-selected').forEach((el) => {
			el.classList.remove('ujl-selected');
		});

		// Add highlight to newly selected node and scroll to it
		if (selectedNodeId) {
			const element = document.querySelector(`[data-ujl-module-id="${selectedNodeId}"]`);
			if (element) {
				element.classList.add('ujl-selected');

				// Scroll to component in preview if needed
				scrollToComponentInPreview(selectedNodeId);
			}
		}
	});
</script>

<div bind:this={scrollContainerRef} class="h-full w-full overflow-y-auto">
	<AdapterRoot node={ast} {tokenSet} {mode} showMetadata={true} eventCallback={handleModuleClick} />
</div>

<style>
	/* Hover-Effect for clickable component */
	:global([data-ujl-module-id][role='button']:not(.ujl-selected):hover) {
		outline: 2px solid oklch(var(--primary) / 0.7);
		outline-offset: 2px;
		border-radius: var(--radius);
	}

	/* Highlight for selected node */
	:global([data-ujl-module-id].ujl-selected) {
		outline: 2px solid oklch(var(--primary));
		outline-offset: 2px;
		border-radius: var(--radius);
	}

	/* remove hover when children is hovered */
	:global([data-ujl-module-id][role='button']:has([data-ujl-module-id][role='button']:hover)) {
		outline: none !important;
	}
</style>
