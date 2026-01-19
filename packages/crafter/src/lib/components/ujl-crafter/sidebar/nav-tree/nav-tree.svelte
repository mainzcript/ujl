<script lang="ts">
	import type { UJLCModuleObject } from '@ujl-framework/types';
	import { getContext } from 'svelte';
	import NavTreeItem from './nav-tree-item.svelte';
	import { createDragHandler } from './nav-tree-drag-handler.svelte.ts';
	import { createVirtualRootNode } from '$lib/utils/ujlc-tree.js';
	import { CRAFTER_CONTEXT, type CrafterContext } from '$lib/components/ujl-crafter/context.js';

	let {
		nodes,
		clipboard,
		onCopy,
		onCut,
		onPaste,
		onDelete,
		onInsert,
		onNodeMove,
		onSlotMove,
		onSlotCopy,
		onSlotCut,
		onSlotPaste,
		onSlotClick
	}: {
		nodes: UJLCModuleObject[];
		clipboard:
			| UJLCModuleObject
			| {
					type: 'slot';
					slotName: string;
					content: UJLCModuleObject[];
			  }
			| null;
		onCopy: (nodeId: string) => void;
		onCut: (nodeId: string) => void;
		onPaste: (nodeId: string) => void;
		onDelete: (nodeId: string) => void;
		onInsert: (nodeId: string) => void;
		onNodeMove?: (
			nodeId: string,
			targetId: string,
			slotName?: string,
			position?: 'before' | 'after' | 'into'
		) => boolean;
		onSlotMove?: (
			sourceParentId: string,
			sourceSlotName: string,
			targetParentId: string,
			targetSlotName: string
		) => boolean;
		onSlotCopy?: (parentId: string, slotName: string) => void;
		onSlotCut?: (parentId: string, slotName: string) => void;
		onSlotPaste?: (parentId: string, slotName: string) => void;
		onSlotClick?: (parentId: string, slotName: string) => void;
	} = $props();

	// Get Crafter Context for selection state
	const crafter = getContext<CrafterContext>(CRAFTER_CONTEXT);

	// Selected node from Context (synchronized with editor.svelte)
	const selectedNodeId = $derived.by(() => {
		return crafter.mode === 'editor' ? crafter.selectedNodeId : null;
	});

	// Create drag handler with slot move support
	const dragHandler = $derived(createDragHandler(onNodeMove, onSlotMove));

	/**
	 * Create virtual root node that represents the document
	 *
	 * `nodes` is the root array (UJLCSlotObject = UJLCModuleObject[])
	 * According to ujl-content.ts: root is UJLCSlotObjectSchema = z.array(UJLCModuleObjectSchema)
	 *
	 * We wrap it in a virtual node with a "root" slot to enable operations
	 * on root-level nodes (which now have a parent: __root__)
	 */
	const virtualRootNode = $derived(createVirtualRootNode(nodes));

	/**
	 * Handle node click - update Context with selected node ID
	 * This ensures synchronization with the rest of the application
	 *
	 * Order: expand first (to make node visible), then select (consistent with preview.svelte)
	 */
	function handleNodeClick(nodeId: string) {
		if (crafter.mode !== 'editor') return;
		// Expand to node first to ensure it's visible in the tree
		crafter.expandToNode(nodeId);
		crafter.setSelectedNodeId(nodeId);
	}
</script>

<div class="relative flex w-full min-w-0 flex-col p-2" data-crafter="nav-tree">
	<div
		class="flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 ring-sidebar-ring outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0"
	>
		Document
	</div>
	<div class="w-full text-sm">
		<ul class="mr-0 flex w-full min-w-0 flex-col gap-1">
			<NavTreeItem
				node={virtualRootNode}
				level={0}
				isRootNode={true}
				{selectedNodeId}
				{clipboard}
				draggedNodeId={dragHandler.draggedNodeId}
				draggedSlotName={dragHandler.draggedSlotName}
				draggedSlotParentId={dragHandler.draggedSlotParentId}
				dragType={dragHandler.dragType}
				dropTargetId={dragHandler.dropTargetId}
				dropTargetSlot={dragHandler.dropTargetSlot}
				dropPosition={dragHandler.dropPosition}
				onNodeClick={handleNodeClick}
				{onCopy}
				{onCut}
				{onPaste}
				{onDelete}
				{onInsert}
				onDragStart={dragHandler.handleDragStart}
				onSlotDragStart={dragHandler.handleSlotDragStart}
				onDragOver={dragHandler.handleDragOver}
				onDragLeave={dragHandler.handleDragLeave}
				onDrop={dragHandler.handleDrop}
				onDragEnd={dragHandler.handleDragEnd}
				{onSlotCopy}
				{onSlotCut}
				{onSlotPaste}
				onSlotDragOver={dragHandler.handleSlotDragOver}
				{onSlotClick}
			/>
		</ul>
	</div>
</div>
