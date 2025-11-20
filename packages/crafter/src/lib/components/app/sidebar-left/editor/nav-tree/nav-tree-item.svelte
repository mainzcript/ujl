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
		hasMultipleSlotsWithChildren,
		getSlotEntriesWithChildren,
		canAcceptDrop,
		canNodeAcceptPaste
	} from './ujlc-tree-utils.js';

	let {
		node,
		level = 0,
		selectedNodeId,
		clipboard,
		draggedNodeId,
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
		onDragOver,
		onDragLeave,
		onDrop,
		onDragEnd,
		onSlotCopy,
		onSlotCut,
		onSlotPaste,
		onSlotDragOver,
		onSlotDrop
	}: {
		node: UJLCModuleObject;
		level?: number;
		selectedNodeId: string | null;
		clipboard:
			| UJLCModuleObject
			| { type: 'slot'; slotName: string; content: UJLCModuleObject[] }
			| null;
		draggedNodeId: string | null;
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
		onDragOver: (event: DragEvent, nodeId: string) => void;
		onDragLeave: () => void;
		onDrop: (event: DragEvent, nodeId: string, slotName?: string) => void;
		onDragEnd: () => void;
		onSlotCopy?: (parentId: string, slotName: string) => void;
		onSlotCut?: (parentId: string, slotName: string) => void;
		onSlotPaste?: (parentId: string, slotName: string) => void;
		onSlotDragOver: (event: DragEvent, parentNodeId: string, slotName: string) => void;
		onSlotDrop: (event: DragEvent, parentNodeId: string, slotName: string) => void;
	} = $props();

	const isDragging = $derived(draggedNodeId === node.meta.id);
	const isDropTarget = $derived(dropTargetId === node.meta.id && !dropTargetSlot);
	const isSelected = $derived(selectedNodeId === node.meta.id);
	const showDropBefore = $derived(isDropTarget && dropPosition === 'before');
	const showDropAfter = $derived(isDropTarget && dropPosition === 'after');
	const showDropInto = $derived(isDropTarget && dropPosition === 'into' && canAcceptDrop(node));
	const hasMultiple = $derived(hasMultipleSlotsWithChildren(node));
	const canPaste = $derived(canNodeAcceptPaste(node, clipboard));
	const canInsert = true;
</script>

{#if level === 0}
	{#if hasChildren(node)}
		<!-- Root level node with children -->
		<SidebarMenuItem class="relative">
			{#if showDropBefore}
				<div class="drop-indicator drop-indicator-before"></div>
			{/if}
			<Collapsible>
				<CollapsibleTrigger class="group">
					{#snippet child({ props })}
						<SidebarMenuButton {...props}>
							{#snippet child({ props: buttonProps })}
								<div
									role="button"
									tabindex="0"
									class="group/node-root flex h-full w-full items-center justify-between gap-2 rounded-md {isSelected
										? 'node-selected'
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
										<span>{getDisplayName(node)}</span>
									</button>
									<DropdownMenu>
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
											<EditorToolbar
												nodeId={node.meta.id}
												{onCopy}
												{onCut}
												{onPaste}
												{onDelete}
												{onInsert}
												canCopy={true}
												canCut={true}
												{canPaste}
												{canInsert}
											/>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							{/snippet}
						</SidebarMenuButton>
					{/snippet}
				</CollapsibleTrigger>
				<CollapsibleContent>
					<SidebarMenuSub class="mr-0 pe-0">
						{#if hasMultiple}
							<!-- Multiple slots with children: show slot names as groups -->
							{#each getSlotEntriesWithChildren(node) as [slotName, slotChildren] (slotName)}
								<NavTreeSlotGroup
									parentNode={node}
									{slotName}
									{slotChildren}
									{clipboard}
									{onSlotCopy}
									{onSlotCut}
									{onSlotPaste}
									{onInsert}
									{dropTargetId}
									{dropTargetSlot}
									{onSlotDragOver}
									onSlotDragLeave={onDragLeave}
									{onSlotDrop}
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
								/>
							{/each}
						{:else}
							<!-- Single slot or only one slot with children: show children directly -->
							{#each getChildren(node) as childNode (childNode.meta.id)}
								<SidebarMenuSubItem>
									<NavTreeItem
										node={childNode}
										level={level + 1}
										{selectedNodeId}
										{clipboard}
										{draggedNodeId}
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
						{/if}
					</SidebarMenuSub>
				</CollapsibleContent>
			</Collapsible>
			{#if showDropAfter}
				<div class="drop-indicator drop-indicator-after"></div>
			{/if}
		</SidebarMenuItem>
	{:else}
		<!-- Root level node without children -->
		<SidebarMenuItem class="relative">
			{#if showDropBefore}
				<div class="drop-indicator drop-indicator-before"></div>
			{/if}
			<SidebarMenuButton>
				{#snippet child({ props })}
					<button
						type="button"
						{...props}
						tabindex="0"
						class="group/root {props.class || ''} {isSelected ? 'selected' : ''} {isDragging
							? 'opacity-50'
							: ''} {showDropInto
							? 'drop-target'
							: ''} flex h-full w-full items-center justify-between rounded-md"
						onclick={() => onNodeClick(node.meta.id)}
						draggable="true"
						ondragstart={(e) => onDragStart(e, node.meta.id)}
						ondragover={(e) => onDragOver(e, node.meta.id)}
						ondragleave={onDragLeave}
						ondrop={(e) => onDrop(e, node.meta.id)}
						ondragend={onDragEnd}
					>
						<span class="flex-1 overflow-hidden text-ellipsis">{getDisplayName(node)}</span>
						<DropdownMenu>
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
								<EditorToolbar
									nodeId={node.meta.id}
									{onCopy}
									{onCut}
									{onPaste}
									{onDelete}
									{onInsert}
									canCopy={true}
									canCut={true}
									{canPaste}
									{canInsert}
								/>
							</DropdownMenuContent>
						</DropdownMenu>
					</button>
				{/snippet}
			</SidebarMenuButton>
			{#if showDropAfter}
				<div class="drop-indicator drop-indicator-after"></div>
			{/if}
		</SidebarMenuItem>
	{/if}
{:else if hasChildren(node)}
	<!-- Nested level node with children -->
	<div class="relative">
		{#if showDropBefore}
			<div class="drop-indicator drop-indicator-before"></div>
		{/if}
		<Collapsible>
			<CollapsibleTrigger class="group">
				{#snippet child({ props })}
					<SidebarMenuButton {...props}>
						{#snippet child({ props: buttonProps })}
							<div
								role="button"
								tabindex="0"
								class="group/dropdown flex h-full w-full items-center justify-between rounded-md {isSelected
									? 'node-selected'
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
									<span>{getDisplayName(node)}</span>
								</button>
								<DropdownMenu>
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
										<EditorToolbar
											nodeId={node.meta.id}
											{onCopy}
											{onCut}
											{onPaste}
											{onDelete}
											{onInsert}
											canCopy={true}
											canCut={true}
											{canPaste}
											{canInsert}
										/>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						{/snippet}
					</SidebarMenuButton>
				{/snippet}
			</CollapsibleTrigger>
			<CollapsibleContent>
				<SidebarMenuSub class="mr-0 pe-0">
					{#if hasMultiple}
						<!-- Multiple slots with children: show slot names as groups -->
						{#each getSlotEntriesWithChildren(node) as [slotName, slotChildren] (slotName)}
							<NavTreeSlotGroup
								parentNode={node}
								{slotName}
								{slotChildren}
								{clipboard}
								{onSlotCopy}
								{onSlotCut}
								{onSlotPaste}
								{onInsert}
								{dropTargetId}
								{dropTargetSlot}
								{onSlotDragOver}
								onSlotDragLeave={onDragLeave}
								{onSlotDrop}
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
							/>
						{/each}
					{:else}
						<!-- Single slot or only one slot with children: show children directly -->
						{#each getChildren(node) as childNode (childNode.meta.id)}
							<SidebarMenuSubItem>
								<NavTreeItem
									node={childNode}
									level={level + 1}
									{selectedNodeId}
									{clipboard}
									{draggedNodeId}
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
					{/if}
				</SidebarMenuSub>
			</CollapsibleContent>
		</Collapsible>
		{#if showDropAfter}
			<div class="drop-indicator drop-indicator-after"></div>
		{/if}
	</div>
{:else}
	<!-- Nested level node without children (leaf node) -->
	<div class="relative">
		{#if showDropBefore}
			<div class="drop-indicator drop-indicator-before"></div>
		{/if}
		<SidebarMenuSubButton class="p-0">
			<div
				role="button"
				tabindex="0"
				class="group/node flex h-full w-full items-center justify-between rounded-md ps-2 {showDropInto
					? 'drop-target'
					: ''} {isSelected ? 'node-selected' : ''} {isDragging ? 'opacity-50' : ''}"
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
				<DropdownMenu>
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
						<EditorToolbar
							nodeId={node.meta.id}
							{onCopy}
							{onCut}
							{onPaste}
							{onDelete}
							{onInsert}
							canCopy={true}
							canCut={true}
							{canPaste}
							{canInsert}
						/>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</SidebarMenuSubButton>
		{#if showDropAfter}
			<div class="drop-indicator drop-indicator-after"></div>
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
		border-left: 2px solid hsl(var(--primary));
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
