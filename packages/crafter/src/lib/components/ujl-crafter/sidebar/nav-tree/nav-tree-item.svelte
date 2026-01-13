<script lang="ts">
	import type { UJLCModuleObject } from '@ujl-framework/types';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import MoreVerticalIcon from '@lucide/svelte/icons/more-vertical';
	import {
		Collapsible,
		CollapsibleTrigger,
		CollapsibleContent,
		SidebarMenuItem,
		SidebarMenuButton,
		SidebarMenuSub,
		SidebarMenuSubItem,
		SidebarMenuSubButton,
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuTrigger,
		Button
	} from '@ujl-framework/ui';
	import EditorToolbar from '../editor-toolbar.svelte';
	import NavTreeSlotGroup from './nav-tree-slot-group.svelte';
	import NavTreeItem from './nav-tree-item.svelte';
	import {
		getDisplayName,
		getChildren,
		hasChildren,
		hasMultipleSlots,
		getAllSlotEntries,
		canAcceptDrop,
		canNodeAcceptPaste
	} from '$lib/utils/ujlc-tree.js';
	import { getContext } from 'svelte';
	import { CRAFTER_CONTEXT, type CrafterContext } from '$lib/components/ujl-crafter/context.js';
	import { test, testId } from '$lib/utils/test-attrs.ts';

	let {
		node,
		level = 0,
		isRootNode = false,
		selectedNodeId,
		clipboard,
		draggedNodeId,
		draggedSlotName,
		draggedSlotParentId,
		dragType,
		dropTargetId,
		dropTargetSlot,
		dropPosition,
		onNodeClick,
		onCopy,
		onCut,
		onPaste,
		onDelete,
		onInsert,
		onDragStart,
		onSlotDragStart,
		onDragOver,
		onDragLeave,
		onSlotClick,
		onDrop,
		onDragEnd,
		onSlotCopy,
		onSlotCut,
		onSlotPaste,
		onSlotDragOver
	}: {
		node: UJLCModuleObject;
		level?: number;
		isRootNode?: boolean;
		selectedNodeId: string | null;
		clipboard:
			| UJLCModuleObject
			| { type: 'slot'; slotName: string; content: UJLCModuleObject[] }
			| null;
		draggedNodeId: string | null;
		draggedSlotName: string | null;
		draggedSlotParentId: string | null;
		dragType: 'node' | 'slot' | null;
		dropTargetId: string | null;
		dropTargetSlot: string | null;
		dropPosition: 'before' | 'after' | 'into' | null;
		onNodeClick: (nodeId: string) => void;
		onCopy: (nodeId: string) => void;
		onCut: (nodeId: string) => void;
		onPaste: (nodeId: string) => void;
		onDelete: (nodeId: string) => void;
		onInsert: (nodeId: string) => void;
		onDragStart: (event: DragEvent, nodeId: string) => void;
		onSlotDragStart: (event: DragEvent, parentId: string, slotName: string) => void;
		onSlotClick?: (parentId: string, slotName: string) => void;
		onDragOver: (event: DragEvent, nodeId: string) => void;
		onDragLeave: () => void;
		onDrop: (event: DragEvent, nodeId: string, slotName?: string) => void;
		onDragEnd: () => void;
		onSlotCopy?: (parentId: string, slotName: string) => void;
		onSlotCut?: (parentId: string, slotName: string) => void;
		onSlotPaste?: (parentId: string, slotName: string) => void;
		onSlotDragOver: (event: DragEvent, parentNodeId: string, slotName: string) => void;
	} = $props();

	let dropdownOpen = $state(false);

	const isDragging = $derived(dragType === 'node' && draggedNodeId === node.meta.id);
	const isDropTarget = $derived(dropTargetId === node.meta.id && !dropTargetSlot);
	const isSelected = $derived(selectedNodeId === node.meta.id);
	const showDropBefore = $derived(isDropTarget && dropPosition === 'before');
	const showDropAfter = $derived(isDropTarget && dropPosition === 'after');
	const showDropInto = $derived(isDropTarget && dropPosition === 'into' && canAcceptDrop(node));
	const hasMultiple = $derived(hasMultipleSlots(node));
	const canPaste = $derived(canNodeAcceptPaste(node, clipboard));
	// Allow add for all nodes (adds after the node, consistent with paste behavior)
	const canInsert = $derived(!isRootNode);

	// Show slots as groups if node has multiple slots OR if it has no children yet
	const showSlotsAsGroups = $derived(hasMultiple);

	// Get Crafter Context for expanded state
	const crafter = getContext<CrafterContext>(CRAFTER_CONTEXT);
	const expandedNodeIds = $derived(crafter.getExpandedNodeIds());

	// Root node is always expanded and not collapsible
	const isExpanded = $derived(isRootNode ? true : expandedNodeIds.has(node.meta.id));

	// Handle expand/collapse toggle (disabled for root node)
	function handleOpenChange(open: boolean) {
		if (!isRootNode) {
			crafter.setNodeExpanded(node.meta.id, open);
		}
	}

	// Root node display name
	const displayName = $derived(isRootNode ? 'Document' : getDisplayName(node));

	// Root node cannot be copied, cut, or deleted
	const canCopyRoot = $derived(!isRootNode);
	const canCutRoot = $derived(!isRootNode);
	const canDeleteRoot = $derived(!isRootNode);

	// Root node can add to its root slot, other nodes can add after themselves
	const canInsertRoot = $derived(isRootNode ? true : canInsert);
</script>

{#snippet editorToolbar(canCopy: boolean, canCut: boolean, canInsert: boolean, canDelete: boolean)}
	<EditorToolbar
		nodeId={node.meta.id}
		{onCopy}
		{onCut}
		{onPaste}
		{onDelete}
		{onInsert}
		onClose={() => (dropdownOpen = false)}
		{canCopy}
		{canCut}
		{canPaste}
		{canInsert}
		{canDelete}
	/>
{/snippet}

{#snippet slotChildrenContent()}
	<SidebarMenuSub class="mr-0 pe-0" {...test('sub item', { level })}>
		{#if showSlotsAsGroups}
			<!-- Multiple slots or no children: show all slots as groups (including empty) -->
			{#each getAllSlotEntries(node) as [slotName, slotChildren] (slotName)}
				<NavTreeSlotGroup
					parentNode={node}
					{slotName}
					{slotChildren}
					{clipboard}
					{dragType}
					{draggedSlotParentId}
					{draggedSlotName}
					{onSlotCopy}
					{onSlotCut}
					{onSlotPaste}
					{onInsert}
					{onSlotDragStart}
					{dropTargetId}
					{dropTargetSlot}
					{onSlotDragOver}
					onSlotDragLeave={onDragLeave}
					{selectedNodeId}
					{draggedNodeId}
					{dropPosition}
					{onNodeClick}
					{onCopy}
					{onCut}
					{onPaste}
					{onDelete}
					{onDragStart}
					{onDragOver}
					{onDragLeave}
					{onDrop}
					{onDragEnd}
					{onSlotClick}
				/>
			{/each}
		{:else}
			<!-- Single slot: show children directly -->
			{#each getChildren(node) as childNode (childNode.meta.id)}
				<SidebarMenuSubItem>
					<NavTreeItem
						node={childNode}
						level={level + 1}
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
{/snippet}

{#if level === 0}
	{#if hasChildren(node)}
		<!-- Root level node with children or empty slots -->
		<SidebarMenuItem class="relative" {...test('nav-tree-item')}>
			{#if showDropBefore}
				<div
					class="drop-indicator drop-indicator-before"
					{...testId('drop-indicator-before')}
				></div>
			{/if}
			<Collapsible open={isExpanded} onOpenChange={isRootNode ? undefined : handleOpenChange}>
				<CollapsibleTrigger class="group">
					{#snippet child({ props })}
						<SidebarMenuButton {...props}>
							{#snippet child({ props: buttonProps })}
								<div
									role="button"
									tabindex="0"
									data-tree-node-id={node.meta.id}
									class="group/node-root flex h-full w-full items-center justify-between gap-2 rounded-md {isSelected
										? 'node-selected text-primary'
										: ''} {isDragging ? 'opacity-50' : ''} {showDropInto ? 'drop-target' : ''}"
									draggable={!isRootNode}
									ondragstart={isRootNode ? undefined : (e) => onDragStart(e, node.meta.id)}
									ondragover={(e) => onDragOver(e, node.meta.id)}
									ondragleave={onDragLeave}
									ondrop={(e) => onDrop(e, node.meta.id)}
									ondragend={onDragEnd}
								>
									<button type="button" {...buttonProps} class="{buttonProps.class || ''} w-auto!">
										<ChevronRightIcon
											class="size-4 transition-transform group-data-[state=open]:rotate-90"
										/>
									</button>
									<button
										onclick={() => onNodeClick(node.meta.id)}
										class="w-full overflow-hidden text-left text-nowrap text-ellipsis"
									>
										<span>{displayName}</span>
									</button>
									<DropdownMenu bind:open={dropdownOpen}>
										<DropdownMenuTrigger>
											{#snippet child({ props })}
												<Button
													{...props}
													variant="ghost"
													size="icon"
													class="mr-2 h-6 w-6 opacity-0 group-hover/node-root:opacity-100"
												>
													<MoreVerticalIcon class="size-4" />
												</Button>
											{/snippet}
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											{@render editorToolbar(canCopyRoot, canCutRoot, canInsertRoot, canDeleteRoot)}
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							{/snippet}
						</SidebarMenuButton>
					{/snippet}
				</CollapsibleTrigger>
				<CollapsibleContent>
					{@render slotChildrenContent()}
				</CollapsibleContent>
			</Collapsible>
			{#if showDropAfter}
				<div class="drop-indicator drop-indicator-after" {...testId('drop-indicator-after')}></div>
			{/if}
		</SidebarMenuItem>
	{:else}
		<!-- Root level node without children -->
		<SidebarMenuItem class="relative" {...test('nav-tree-item')}>
			{#if showDropBefore}
				<div
					class="drop-indicator drop-indicator-before"
					{...testId('drop-indicator-before')}
				></div>
			{/if}
			<SidebarMenuButton>
				{#snippet child({ props })}
					<button
						type="button"
						{...props}
						tabindex="0"
						data-tree-node-id={node.meta.id}
						class="group/root {props.class || ''} {isSelected
							? 'selected text-primary'
							: ''} {isDragging ? 'opacity-50' : ''} {showDropInto
							? 'drop-target'
							: ''} flex h-full w-full items-center justify-between rounded-md"
						onclick={() => onNodeClick(node.meta.id)}
						draggable={!isRootNode}
						ondragstart={isRootNode ? undefined : (e) => onDragStart(e, node.meta.id)}
						ondragover={(e) => onDragOver(e, node.meta.id)}
						ondragleave={onDragLeave}
						ondrop={(e) => onDrop(e, node.meta.id)}
						ondragend={onDragEnd}
						{...testId('nav-tree-item-button')}
					>
						<span class="flex-1 overflow-hidden text-ellipsis">{displayName}</span>
						<DropdownMenu bind:open={dropdownOpen}>
							<DropdownMenuTrigger>
								{#snippet child({ props: triggerProps })}
									<Button
										{...triggerProps}
										variant="ghost"
										size="icon"
										class="mr-2 h-6 w-6 opacity-0 group-hover/root:opacity-100"
										onclick={(e) => e.stopPropagation()}
									>
										<MoreVerticalIcon class="size-4" />
									</Button>
								{/snippet}
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								{@render editorToolbar(canCopyRoot, canCutRoot, canInsert, canDeleteRoot)}
							</DropdownMenuContent>
						</DropdownMenu>
					</button>
				{/snippet}
			</SidebarMenuButton>
			{#if showDropAfter}
				<div class="drop-indicator drop-indicator-after" {...testId('drop-indicator-after')}></div>
			{/if}
		</SidebarMenuItem>
	{/if}
{:else if hasChildren(node)}
	<!-- Nested level node with children or empty slots -->
	<div class="relative">
		{#if showDropBefore}
			<div class="drop-indicator drop-indicator-before" {...testId('drop-indicator-before')}></div>
		{/if}
		<Collapsible open={isExpanded} onOpenChange={handleOpenChange}>
			<CollapsibleTrigger class="group">
				{#snippet child({ props })}
					<SidebarMenuButton {...props}>
						{#snippet child({ props: buttonProps })}
							<div
								role="button"
								tabindex="0"
								data-tree-node-id={node.meta.id}
								class="group/dropdown flex h-full w-full items-center justify-between rounded-md {isSelected
									? 'node-selected text-primary'
									: ''} {isDragging ? 'opacity-50' : ''} {showDropInto ? 'drop-target' : ''}"
								draggable="true"
								ondragstart={(e) => onDragStart(e, node.meta.id)}
								ondragover={(e) => onDragOver(e, node.meta.id)}
								ondragleave={onDragLeave}
								ondrop={(e) => onDrop(e, node.meta.id)}
								ondragend={onDragEnd}
							>
								<button type="button" {...buttonProps} class="{buttonProps.class || ''} w-auto!">
									<ChevronRightIcon
										class="size-4 transition-transform group-data-[state=open]:rotate-90"
									/>
								</button>
								<button
									onclick={() => onNodeClick(node.meta.id)}
									class="w-full overflow-hidden text-left text-nowrap text-ellipsis"
								>
									<span>{displayName}</span>
								</button>
								<DropdownMenu bind:open={dropdownOpen}>
									<DropdownMenuTrigger>
										{#snippet child({ props })}
											<Button
												{...props}
												variant="ghost"
												size="icon"
												class="mr-2 h-6 w-6 opacity-0 group-hover/dropdown:opacity-100"
											>
												<MoreVerticalIcon class="size-4" />
											</Button>
										{/snippet}
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										{@render editorToolbar(true, true, canInsert, true)}
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						{/snippet}
					</SidebarMenuButton>
				{/snippet}
			</CollapsibleTrigger>
			<CollapsibleContent>
				{@render slotChildrenContent()}
			</CollapsibleContent>
		</Collapsible>
		{#if showDropAfter}
			<div class="drop-indicator drop-indicator-after" {...testId('drop-indicator-after')}></div>
		{/if}
	</div>
{:else}
	<!-- Nested level node without children (leaf node) -->
	<div class="relative">
		{#if showDropBefore}
			<div class="drop-indicator drop-indicator-before" {...testId('drop-indicator-before')}></div>
		{/if}
		<SidebarMenuSubButton class="p-0">
			<div
				role="button"
				tabindex="0"
				data-tree-node-id={node.meta.id}
				class="group/node flex h-full w-full items-center justify-between rounded-md ps-2 {showDropInto
					? 'drop-target'
					: ''} {isSelected ? 'node-selected text-primary' : ''} {isDragging ? 'opacity-50' : ''}"
				draggable="true"
				ondragstart={(e) => onDragStart(e, node.meta.id)}
				ondragover={(e) => onDragOver(e, node.meta.id)}
				ondragleave={onDragLeave}
				ondrop={(e) => onDrop(e, node.meta.id)}
				ondragend={onDragEnd}
			>
				<button
					onclick={() => onNodeClick(node.meta.id)}
					class="h-full flex-1 overflow-hidden text-left text-nowrap text-ellipsis"
				>
					<span>{getDisplayName(node)}</span>
				</button>
				<DropdownMenu bind:open={dropdownOpen}>
					<DropdownMenuTrigger>
						{#snippet child({ props })}
							<Button
								{...props}
								variant="ghost"
								size="icon"
								class="mr-1 h-6 w-6 opacity-0 group-hover/node:opacity-100"
								onclick={(e) => e.stopPropagation()}
							>
								<MoreVerticalIcon class="size-4" />
							</Button>
						{/snippet}
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						{@render editorToolbar(true, true, canInsert, true)}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</SidebarMenuSubButton>
		{#if showDropAfter}
			<div class="drop-indicator drop-indicator-after" {...testId('drop-indicator-after')}></div>
		{/if}
	</div>
{/if}

<style>
	.node-selected {
		background-color: color-mix(
			in srgb,
			oklch(var(--flavor)) 90%,
			oklch(var(--flavor-foreground)) 10%
		);
		color: oklch(var(--primary));
	}

	.drop-target {
		background-color: color-mix(in srgb, hsl(var(--primary)) 20%, transparent 80%);
		outline: 1px dashed oklch(var(--flavor-foreground));
		outline-offset: -2px;
	}

	.drop-indicator {
		position: absolute;
		content: '';
		left: 0;
		right: 0;
		height: 3px;
		background-color: oklch(var(--flavor-foreground));
		border-radius: 2px;
		pointer-events: none;
		z-index: 50;
	}

	.drop-indicator-before {
		top: -2px;
	}

	.drop-indicator-after {
		bottom: -2px;
	}
</style>
