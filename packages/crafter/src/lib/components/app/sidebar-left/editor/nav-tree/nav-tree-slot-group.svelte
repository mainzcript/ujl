<script lang="ts">
	import type { UJLCModuleObject } from '@ujl-framework/types';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import MoreVerticalIcon from '@lucide/svelte/icons/more-vertical';
	import {
		Collapsible,
		CollapsibleTrigger,
		CollapsibleContent,
		SidebarMenuSubItem,
		SidebarMenuSubButton,
		SidebarMenuSub,
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuTrigger,
		Button
	} from '@ujl-framework/ui';
	import EditorToolbar from '../editor-toolbar.svelte';
	import NavTreeItem from './nav-tree-item.svelte';
	import { formatSlotName } from './ujlc-tree-utils.js';

	let {
		parentNode,
		slotName,
		slotChildren,
		clipboard,
		dragType,
		draggedSlotParentId,
		draggedSlotName,
		onSlotCopy,
		onSlotCut,
		onSlotPaste,
		onInsert,
		onSlotDragStart,
		dropTargetId,
		dropTargetSlot,
		onSlotDragOver,
		onSlotDragLeave,
		onSlotDrop,
		selectedNodeId,
		draggedNodeId,
		dropPosition,
		onNodeClick,
		onCopy,
		onCut,
		onPaste,
		onDelete,
		onDragStart,
		onDragOver,
		onDragLeave,
		onDrop,
		onDragEnd
	}: {
		parentNode: UJLCModuleObject;
		slotName: string;
		slotChildren: UJLCModuleObject[];
		clipboard:
			| UJLCModuleObject
			| { type: 'slot'; slotName: string; content: UJLCModuleObject[] }
			| null;
		dragType: 'node' | 'slot' | null;
		draggedSlotParentId: string | null;
		draggedSlotName: string | null;
		onSlotCopy?: (parentId: string, slotName: string) => void;
		onSlotCut?: (parentId: string, slotName: string) => void;
		onSlotPaste?: (parentId: string, slotName: string) => void;
		onInsert: (nodeId: string) => void;
		onSlotDragStart: (event: DragEvent, parentId: string, slotName: string) => void;
		dropTargetId: string | null;
		dropTargetSlot: string | null;
		onSlotDragOver: (event: DragEvent, parentNodeId: string, slotName: string) => void;
		onSlotDragLeave: () => void;
		onSlotDrop: (event: DragEvent, parentNodeId: string, slotName: string) => void;
		selectedNodeId: string | null;
		draggedNodeId: string | null;
		dropPosition: 'before' | 'after' | 'into' | null;
		onNodeClick: (nodeId: string) => void;
		onCopy: (nodeId: string) => void;
		onCut: (nodeId: string) => void;
		onPaste: (nodeId: string) => void;
		onDelete: (nodeId: string) => void;
		onDragStart: (event: DragEvent, nodeId: string) => void;
		onDragOver: (event: DragEvent, nodeId: string) => void;
		onDragLeave: () => void;
		onDrop: (event: DragEvent, nodeId: string, slotName?: string) => void;
		onDragEnd: () => void;
	} = $props();

	const isDropTarget = $derived(dropTargetId === parentNode.meta.id && dropTargetSlot === slotName);
	const isDragging = $derived(
		dragType === 'slot' &&
			draggedSlotParentId === parentNode.meta.id &&
			draggedSlotName === slotName
	);
</script>

<SidebarMenuSubItem>
	<Collapsible>
		<CollapsibleTrigger class="group">
			{#snippet child({ props })}
				<SidebarMenuSubButton {...props}>
					{#snippet child({ props: buttonProps })}
						<div
							role="button"
							tabindex="0"
							class="group/slot flex w-full items-center justify-between gap-1 rounded-md {isDropTarget
								? 'drop-target-slot'
								: ''} {isDragging ? 'opacity-50' : ''}"
							draggable="true"
							ondragstart={(e) => {
								onSlotDragStart(e, parentNode.meta.id, slotName);
							}}
							ondragover={(e) => {
								onSlotDragOver(e, parentNode.meta.id, slotName);
							}}
							ondragleave={() => {
								onSlotDragLeave();
							}}
							ondrop={(e) => {
								onSlotDrop(e, parentNode.meta.id, slotName);
							}}
							ondragend={onDragEnd}
						>
							<button type="button" {...buttonProps} class="{buttonProps.class || ''} w-auto!">
								<ChevronRightIcon
									class="size-4 transition-transform group-data-[state=open]:rotate-90"
								/>
							</button>
							<span class="flex-1 text-xs font-medium text-muted-foreground uppercase">
								{formatSlotName(slotName)}
							</span>
							<DropdownMenu>
								<DropdownMenuTrigger>
									{#snippet child({ props })}
										<Button
											{...props}
											variant="ghost"
											size="icon"
											class="mr-2 h-6 w-6 opacity-0 group-hover/slot:opacity-100"
											onclick={(e) => e.stopPropagation()}
										>
											<MoreVerticalIcon class="size-4" />
										</Button>
									{/snippet}
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<EditorToolbar
										nodeId={parentNode.meta.id}
										onCopy={() => onSlotCopy?.(parentNode.meta.id, slotName)}
										onCut={() => onSlotCut?.(parentNode.meta.id, slotName)}
										onPaste={() => onSlotPaste?.(parentNode.meta.id, slotName)}
										onDelete={() => {}}
										onInsert={() => onInsert(parentNode.meta.id)}
										canCopy={slotChildren.length > 0}
										canCut={slotChildren.length > 0}
										canPaste={clipboard !== null}
										canInsert={true}
									/>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					{/snippet}
				</SidebarMenuSubButton>
			{/snippet}
		</CollapsibleTrigger>
		<CollapsibleContent>
			<SidebarMenuSub class="mr-0 pe-0">
				{#each slotChildren as childNode (childNode.meta.id)}
					<SidebarMenuSubItem>
						<NavTreeItem
							node={childNode}
							level={1}
							{selectedNodeId}
							{clipboard}
							{draggedNodeId}
							{draggedSlotName}
							{draggedSlotParentId}
							{dragType}
							{dropTargetId}
							{dropTargetSlot}
							{dropPosition}
							{onNodeClick}
							{onCopy}
							{onCut}
							{onPaste}
							{onDelete}
							{onInsert}
							{onDragStart}
							{onSlotDragStart}
							{onDragOver}
							{onDragLeave}
							{onDrop}
							{onDragEnd}
							{onSlotCopy}
							{onSlotCut}
							{onSlotPaste}
							{onSlotDragOver}
							{onSlotDrop}
						/>
					</SidebarMenuSubItem>
				{/each}
			</SidebarMenuSub>
		</CollapsibleContent>
	</Collapsible>
</SidebarMenuSubItem>

<style>
	.drop-target-slot {
		background-color: color-mix(in srgb, hsl(var(--primary)) 15%, transparent 85%);
		outline: 1px dashed oklch(var(--flavor-foreground));
		outline-offset: -2px;
	}

	.drag-handle {
		display: flex;
		align-items: center;
	}
</style>
