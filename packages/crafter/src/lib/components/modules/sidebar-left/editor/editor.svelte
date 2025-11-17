<!--
	Temporary navigation tree editor component for visualizing the document structure.

	This is a temporary solution that converts UJLCSlotObject (array of root modules) into
	a simple tree structure for display. It will be replaced with a proper UJLCSlotObject renderer
	that supports drag & drop, module selection, and direct editing.

	UJLCSlotObject is expected to be an array of root-level modules in the document.
	Each module can have nested slots, which are mapped to child nodes in the tree.
-->
<script lang="ts">
	import type { UJLCSlotObject } from '@ujl-framework/types';
	import NavTreeMock from './nav-tree-mock.svelte';
	import type { NavNode } from './types.js';

	let { slot }: { slot: UJLCSlotObject } = $props();

	// Context API is available for future mutations (e.g., module selection, drag & drop)
	// When needed, import: import { getContext } from 'svelte';
	// import { CRAFTER_CONTEXT, type CrafterContext } from '../../context.js';
	// const crafter = getContext<CrafterContext>(CRAFTER_CONTEXT);

	/**
	 * Converts UJLCSlotObject (array of modules) into a NavNode tree structure.
	 * This is a temporary solution until we have a proper slot renderer.
	 *
	 * The conversion:
	 * - Maps each root module to a top-level NavNode
	 * - Extracts nested modules from module.slots and creates child nodes
	 * - Uses module.meta.id for unique keys when available, falls back to indices
	 */
	const nodes = $derived.by<NavNode[]>(() => {
		if (!slot || slot.length === 0) {
			return [];
		}

		// Simple conversion: map modules to tree nodes
		// This is a temporary solution until we have a proper slot renderer
		return slot.map((module, moduleIndex) => ({
			name: module.type,
			// Use module.meta.id or index to ensure unique keys
			key: module.meta?.id || `module-${moduleIndex}`,
			pages: Object.entries(module.slots || {}).flatMap(([slotName, modules], slotIndex) =>
				modules.map((m, mIndex) => ({
					name: `${slotName}: ${m.type}`,
					// Use module.meta.id or combination of indices to ensure unique keys
					key: m.meta?.id || `${slotName}-${slotIndex}-${mIndex}`,
					pages: []
				}))
			)
		}));
	});
</script>

<div
	data-slot="sidebar-group"
	data-sidebar="group"
	class="relative flex w-full min-w-0 flex-col p-2"
>
	{#if slot && slot.length > 0}
		<NavTreeMock {nodes} />
	{:else}
		<div class="p-4 text-sm text-muted-foreground">No content yet</div>
	{/if}
</div>
