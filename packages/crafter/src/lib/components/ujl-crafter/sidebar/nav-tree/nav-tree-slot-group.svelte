<script lang="ts">
	import type { UJLCModuleObject } from '@ujl-framework/types';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import MoreVerticalIcon from '@lucide/svelte/icons/more-vertical';
	import {
		Collapsible,
		CollapsibleTrigger,
		CollapsibleContent,
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuTrigger,
		Button
	} from '@ujl-framework/ui';
	import {
		SidebarMenuSubItem,
		SidebarMenuSubButton,
		SidebarMenuSub
	} from '$lib/components/ui/sidebar-menu/index.js';
	import { cn } from '@ujl-framework/ui/utils';
	import EditorToolbar from '../editor-toolbar.svelte';
	import NavTreeItem from './nav-tree-item.svelte';
	import { formatSlotName } from '$lib/utils/ujlc-tree.js';

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
		onDragEnd,
		onSlotClick
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
		onSlotClick?: (parentId: string, slotName: string) => void;
	} = $props();

	let dropdownOpen = $state(false);

	const isDropTarget = $derived(dropTargetId === parentNode.meta.id && dropTargetSlot === slotName);
	const isDragging = $derived(
		dragType === 'slot' &&
			draggedSlotParentId === parentNode.meta.id &&
			draggedSlotName === slotName
	);
	const isEmpty = $derived(slotChildren.length === 0);

	// Check if this slot is selected (format: parentId:slotName)
	const isSelected = $derived(selectedNodeId === `${parentNode.meta.id}:${slotName}`);
</script>

<SidebarMenuSubItem data-crafter="nav-tree-slot-group">
	<Collapsible>
		<CollapsibleTrigger class="group">
			{#snippet child({ props }: { props?: Record<string, unknown> })}
				<SidebarMenuSubButton {...props}>
					{#snippet child({ props: buttonProps }: { props?: Record<string, unknown> })}
						<div
							role="button"
							tabindex="0"
							class={cn(
								'group/slot flex w-full items-center justify-between rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
								isDropTarget &&
									'bg-accent/15 outline-1 -outline-offset-2 outline-flavor-foreground outline-dashed',
								isDragging && 'opacity-50',
								isSelected && 'bg-foreground/5 text-flavor-foreground-accent'
							)}
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
								onDrop(e, parentNode.meta.id, slotName);
							}}
							ondragend={onDragEnd}
							data-crafter="slot-group-button"
						>
							<button
								type="button"
								{...buttonProps ?? {}}
								class="{buttonProps?.class || ''} w-auto!"
							>
								<ChevronRightIcon
									class="size-4 transition-transform group-data-[state=open]:rotate-90"
								/>
							</button>
							<button
								onclick={() => onSlotClick?.(parentNode.meta.id, slotName)}
								class="flex-1 text-left text-xs font-medium uppercase transition-colors"
							>
								{formatSlotName(slotName)}
							</button>
							<DropdownMenu bind:open={dropdownOpen}>
								<DropdownMenuTrigger>
									{#snippet child({ props })}
										<Button
											{...props}
											variant="ghost"
											size="icon"
											class="mr-2 h-6 w-6 opacity-0 group-hover/slot:opacity-100"
											onclick={(e) => e.stopPropagation()}
											data-crafter="slot-context-menu-trigger"
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
										onInsert={() => onInsert(`${parentNode.meta.id}:${slotName}`)}
										onClose={() => (dropdownOpen = false)}
										canCopy={slotChildren.length > 0}
										canCut={slotChildren.length > 0}
										canPaste={clipboard !== null}
										canInsert={true}
										canDelete={false}
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
				{#if isEmpty}
					<!-- Empty slot placeholder -->
					<SidebarMenuSubItem>
						<div
							class="px-4 py-2 text-xs text-muted-foreground italic"
							data-crafter="slot-empty-state"
						>
							Empty slot - drop or add modules here
						</div>
					</SidebarMenuSubItem>
				{:else}
					<!-- Slot children -->
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
								{onSlotClick}
							/>
						</SidebarMenuSubItem>
					{/each}
				{/if}
			</SidebarMenuSub>
		</CollapsibleContent>
	</Collapsible>
</SidebarMenuSubItem>
