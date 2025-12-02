<script lang="ts">
	import type { UJLCModuleObject } from '@ujl-framework/types';
	import {
		SidebarGroup,
		SidebarGroupLabel,
		SidebarGroupContent,
		SidebarMenu
	} from '@ujl-framework/ui';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import NavTreeItem from './nav-tree-item.svelte';
	import { createDragHandler } from './nav-tree-drag-handler.svelte.ts';
	import { createVirtualRootNode } from '$lib/tools/ujlc-tree.js';

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

	// Selected node from URL
	const selectedNodeId = $derived($page.url.searchParams.get('selected'));

	// Create drag handler with slot move support
	const dragHandler = createDragHandler(onNodeMove, onSlotMove);

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
	 * Handle node click - update URL with selected node ID
	 */
	async function handleNodeClick(nodeId: string) {
		const url = new URL($page.url);
		url.searchParams.set('selected', nodeId);
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		await goto(url, { replaceState: true, noScroll: true });
	}
</script>

<SidebarGroup>
	<SidebarGroupLabel>Document</SidebarGroupLabel>
	<SidebarGroupContent>
		<SidebarMenu class="mr-0">
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
		</SidebarMenu>
	</SidebarGroupContent>
</SidebarGroup>
