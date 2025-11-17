<script lang="ts">
	import type { UJLCSlotObject } from '@ujl-framework/types';
	import NavTreeMock from './nav-tree-mock.svelte';

	let { slot }: { slot: UJLCSlotObject } = $props();

	// Context API is available for future mutations (e.g., module selection, drag & drop)
	// When needed, import: import { getContext } from 'svelte';
	// import { CRAFTER_CONTEXT, type CrafterContext } from '../../context.js';
	// const crafter = getContext<CrafterContext>(CRAFTER_CONTEXT);

	// For now, convert slot to a simple tree structure for NavTreeMock
	// TODO: Replace NavTreeMock with a proper UJLCSlotObject renderer
	const nodes = $derived.by(() => {
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
