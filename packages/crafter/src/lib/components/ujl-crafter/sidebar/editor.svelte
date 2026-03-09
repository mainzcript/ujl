<script lang="ts">
	import type { UJLCSlotObject } from "@ujl-framework/types";
	import { getContext } from "svelte";
	import NavTree from "./nav-tree/nav-tree.svelte";
	import { CRAFTER_CONTEXT, type CrafterContext } from "$lib/stores/index.js";

	let {
		rootSlot,
	}: {
		rootSlot: UJLCSlotObject;
	} = $props();

	const crafter = getContext<CrafterContext>(CRAFTER_CONTEXT);

	// Direct store access - no wrapper handlers needed (DRY)
	// All operations are centralized in crafter-store.svelte.ts
</script>

<div data-slot="sidebar-group" data-sidebar="group" class="relative flex w-full min-w-0 flex-col">
	<NavTree
		nodes={rootSlot}
		clipboard={crafter.clipboard}
		onCopy={crafter.copyNode}
		onCut={crafter.cutNode}
		onPaste={crafter.pasteNode}
		onDelete={crafter.deleteNode}
		onInsert={crafter.requestInsert}
		onNodeMove={(nodeId, targetId, slotName, position) =>
			crafter.operations.moveNode(nodeId, targetId, slotName, position)}
		onSlotCopy={(parentId, slotName) => {
			const slotData = crafter.operations.copySlot(parentId, slotName);
			if (slotData) crafter.performPaste(slotData, parentId);
		}}
		onSlotCut={(parentId, slotName) => {
			const slotData = crafter.operations.cutSlot(parentId, slotName);
			if (slotData) crafter.performPaste(slotData, parentId);
		}}
		onSlotPaste={(parentId, slotName) => crafter.pasteNode(`${parentId}:${slotName}`)}
		onSlotMove={(sourceParentId, sourceSlotName, targetParentId, targetSlotName) =>
			crafter.operations.moveSlot(sourceParentId, sourceSlotName, targetParentId, targetSlotName)}
		onSlotClick={(parentId, slotName) => {
			if (crafter.mode === "editor") {
				crafter.setSelectedNodeId(`${parentId}:${slotName}`);
			}
		}}
	/>
</div>
