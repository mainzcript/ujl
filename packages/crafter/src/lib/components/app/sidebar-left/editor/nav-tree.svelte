<script lang="ts">
	import type { UJLCModuleObject } from '@ujl-framework/types';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import MoreVerticalIcon from '@lucide/svelte/icons/more-vertical';

	import {
		Collapsible,
		CollapsibleTrigger,
		CollapsibleContent,
		SidebarGroup,
		SidebarGroupLabel,
		SidebarGroupContent,
		SidebarMenu,
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
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import EditorToolbar from './editor-toolbar.svelte';
	import { hasSlots } from './ujlc-tree-utils.js';

	let {
		nodes,
		clipboard,
		onCopy,
		onCut,
		onPaste,
		onDelete,
		onNodeMove,
		onNodeReorder
	}: {
		nodes: UJLCModuleObject[];
		clipboard: UJLCModuleObject | null;
		onCopy: (nodeId: string) => void;
		onCut: (nodeId: string) => void;
		onPaste: (nodeId: string) => void;
		onDelete: (nodeId: string) => void;
		onNodeMove?: (nodeId: string, targetId: string, slotName?: string) => boolean;
		onNodeReorder?: (nodeId: string, targetId: string, position: 'before' | 'after') => boolean;
	} = $props();

	const selectedNodeId = $derived($page.url.searchParams.get('selected'));

	// Helper to check if a node can accept paste
	function canNodeAcceptPaste(node: UJLCModuleObject): boolean {
		return clipboard !== null && hasSlots(node);
	}

	// Drag & Drop State
	let draggedNodeId = $state<string | null>(null);
	let dropTargetId = $state<string | null>(null);
	let dropTargetSlot = $state<string | null>(null);
	let dropPosition = $state<'before' | 'after' | 'into' | null>(null);

	/**
	 * returns a display name for a node
	 */
	function getDisplayName(node: UJLCModuleObject): string {
		const typeName = formatTypeName(node.type);

		// Title/Labels
		if (node.fields.title) return `${typeName}: ${node.fields.title}`;
		if (node.fields.label) return `${typeName}: ${node.fields.label}`;
		if (node.fields.headline) return `${typeName}: ${node.fields.headline}`;

		// Content-Fields (shortened)
		if (node.fields.content && typeof node.fields.content === 'string') {
			const content = node.fields.content.trim();
			const shortContent = content.length > 40 ? content.substring(0, 40) + '...' : content;
			return `${typeName}: ${shortContent}`;
		}

		// Type only
		return typeName;
	}

	/**
	 * formats a type string into a more readable format
	 */
	function formatTypeName(type: string): string {
		return type
			.split('-')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	}

	/**
	 * returns the children of a node
	 */
	function getChildren(node: UJLCModuleObject): UJLCModuleObject[] {
		if (!node.slots) return [];

		// traverse all slots and collect children
		return Object.values(node.slots).flat();
	}

	/**
	 * checks if a node has children
	 */
	function hasChildren(node: UJLCModuleObject): boolean {
		if (!node.slots) return false;
		return Object.values(node.slots).some((slot) => slot.length > 0);
	}

	/**
	 * checks if a node has multiple slots
	 */
	function hasMultipleSlots(node: UJLCModuleObject): boolean {
		if (!node.slots) return false;
		return Object.keys(node.slots).length > 1;
	}

	/**
	 * returns all slot entries [slotName, children[]]
	 */
	function getSlotEntries(node: UJLCModuleObject): [string, UJLCModuleObject[]][] {
		if (!node.slots) return [];
		return Object.entries(node.slots);
	}

	/**
	 * checks if target has slots (can accept children)
	 */
	function canAcceptDrop(targetNode: UJLCModuleObject): boolean {
		return targetNode.slots && Object.keys(targetNode.slots).length > 0;
	}

	async function handleNodeClick(nodeId: string) {
		const url = new URL($page.url);
		url.searchParams.set('selected', nodeId);
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		await goto(url, { replaceState: true, noScroll: true });
		console.log('Node clicked:', selectedNodeId);
	}

	// Drag & Drop Handlers
	function handleDragStart(event: DragEvent, nodeId: string) {
		draggedNodeId = nodeId;
		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = 'move';
			event.dataTransfer.setData('text/plain', nodeId);
		}
		console.log('Drag started:', nodeId);
	}

	function handleDragOver(event: DragEvent, targetNodeId: string) {
		if (!draggedNodeId || draggedNodeId === targetNodeId) return;

		event.preventDefault();
		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = 'move';
		}

		// Calculate drop position based on mouse Y position
		const target = event.currentTarget as HTMLElement;
		const rect = target.getBoundingClientRect();
		const y = event.clientY - rect.top;
		const height = rect.height;

		// Top 25%: before, Bottom 25%: after, Middle 50%: into
		if (y < height * 0.25) {
			dropPosition = 'before';
		} else if (y > height * 0.75) {
			dropPosition = 'after';
		} else {
			dropPosition = 'into';
		}

		dropTargetId = targetNodeId;
	}

	function handleDragLeave() {
		dropTargetId = null;
		dropTargetSlot = null;
		dropPosition = null;
	}

	function handleDrop(event: DragEvent, targetNodeId: string, slotName?: string) {
		event.preventDefault();

		if (!draggedNodeId || draggedNodeId === targetNodeId) {
			resetDragState();
			return;
		}

		console.log('Drop:', draggedNodeId, dropPosition, targetNodeId, 'slot:', slotName);

		let success = false;

		// Handle reordering (before/after) vs moving into
		if (dropPosition === 'before' || dropPosition === 'after') {
			if (onNodeReorder) {
				success = onNodeReorder(draggedNodeId, targetNodeId, dropPosition);
				if (!success) {
					console.log('Reorder rejected - node returned to original position');
				}
			}
		} else {
			// Drop into node (or into specific slot)
			if (onNodeMove) {
				success = onNodeMove(draggedNodeId, targetNodeId, slotName);
				if (!success) {
					console.log('Drop rejected - node returned to original position');
				}
			}
		}

		resetDragState();
	}

	function handleDragEnd() {
		resetDragState();
	}

	function resetDragState() {
		draggedNodeId = null;
		dropTargetId = null;
		dropTargetSlot = null;
		dropPosition = null;
	}

	// Handler for slot group drops
	function handleSlotDragOver(event: DragEvent, parentNodeId: string, slotName: string) {
		if (!draggedNodeId) return;

		event.preventDefault();
		event.stopPropagation();

		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = 'move';
		}

		dropTargetId = parentNodeId;
		dropTargetSlot = slotName;
		dropPosition = 'into';
	}

	function handleSlotDrop(event: DragEvent, parentNodeId: string, slotName: string) {
		event.preventDefault();
		event.stopPropagation();

		if (!draggedNodeId || draggedNodeId === parentNodeId) {
			resetDragState();
			return;
		}

		console.log('Drop into slot:', draggedNodeId, 'into', parentNodeId, 'slot:', slotName);

		if (onNodeMove) {
			const success = onNodeMove(draggedNodeId, parentNodeId, slotName);
			if (!success) {
				console.log('Drop into slot rejected');
			}
		}

		resetDragState();
	}
</script>

{#snippet renderNode(node: UJLCModuleObject, level: number = 0)}
	{@const isDragging = draggedNodeId === node.meta.id}
	{@const isDropTarget = dropTargetId === node.meta.id && !dropTargetSlot}
	{@const isSelected = selectedNodeId === node.meta.id}
	{@const showDropBefore = isDropTarget && dropPosition === 'before'}
	{@const showDropAfter = isDropTarget && dropPosition === 'after'}
	{@const showDropInto = isDropTarget && dropPosition === 'into' && canAcceptDrop(node)}
	{@const hasMultiple = hasMultipleSlots(node)}
	{@const canPaste = canNodeAcceptPaste(node)}

	{#if level === 0}
		{#if hasChildren(node)}
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
										ondragstart={(e) => handleDragStart(e, node.meta.id)}
										ondragover={(e) => handleDragOver(e, node.meta.id)}
										ondragleave={handleDragLeave}
										ondrop={(e) => handleDrop(e, node.meta.id)}
										ondragend={handleDragEnd}
									>
										<button
											type="button"
											{...buttonProps}
											class="{buttonProps.class || ''} w-auto!"
										>
											<ChevronRightIcon
												class="size-4 transition-transform group-data-[state=open]:rotate-90"
											/>
										</button>
										<button
											onclick={() => handleNodeClick(node.meta.id)}
											class="w-full overflow-hidden text-left text-nowrap text-ellipsis"
										>
											<span>
												{getDisplayName(node)}
											</span>
										</button>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
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
													canCopy={true}
													canCut={true}
													{canPaste}
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
								<!-- Multiple slots: show slot names as groups -->
								{#each getSlotEntries(node) as [slotName, slotChildren] (slotName)}
									{#if slotChildren.length > 0}
										<SidebarMenuSubItem>
											<Collapsible>
												<CollapsibleTrigger class="group">
													{#snippet child({ props })}
														<SidebarMenuSubButton {...props}>
															{#snippet child({ props: buttonProps })}
																<div
																	role="button"
																	tabindex="0"
																	class="flex w-full items-center gap-1 rounded-md {dropTargetId ===
																		node.meta.id && dropTargetSlot === slotName
																		? 'drop-target-slot'
																		: ''}"
																	ondragover={(e) => handleSlotDragOver(e, node.meta.id, slotName)}
																	ondragleave={handleDragLeave}
																	ondrop={(e) => handleSlotDrop(e, node.meta.id, slotName)}
																>
																	<button
																		type="button"
																		{...buttonProps}
																		class="{buttonProps.class || ''} w-auto!"
																	>
																		<ChevronRightIcon
																			class="size-4 transition-transform group-data-[state=open]:rotate-90"
																		/>
																	</button>
																	<span class="text-xs font-medium text-muted-foreground uppercase">
																		{slotName}
																	</span>
																</div>
															{/snippet}
														</SidebarMenuSubButton>
													{/snippet}
												</CollapsibleTrigger>
												<CollapsibleContent>
													<SidebarMenuSub class="mr-0 pe-0">
														{#each slotChildren as childNode (childNode.meta.id)}
															<SidebarMenuSubItem>
																{@render renderNode(childNode, level + 1)}
															</SidebarMenuSubItem>
														{/each}
													</SidebarMenuSub>
												</CollapsibleContent>
											</Collapsible>
										</SidebarMenuSubItem>
									{/if}
								{/each}
							{:else}
								<!-- Single slot: show children directly -->
								{#each getChildren(node) as childNode (childNode.meta.id)}
									<SidebarMenuSubItem>
										{@render renderNode(childNode, level + 1)}
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
							onclick={() => handleNodeClick(node.meta.id)}
							draggable="true"
							ondragstart={(e) => handleDragStart(e, node.meta.id)}
							ondragover={(e) => handleDragOver(e, node.meta.id)}
							ondragleave={handleDragLeave}
							ondrop={(e) => handleDrop(e, node.meta.id)}
							ondragend={handleDragEnd}
						>
							<span class="flex-1 overflow-hidden text-ellipsis">{getDisplayName(node)}</span>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
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
										canCopy={true}
										canCut={true}
										{canPaste}
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
		<div class="relative">
			{#if showDropBefore}
				<div class="drop-indicator drop-indicator-before"></div>
			{/if}
			<Collapsible class="">
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
									ondragstart={(e) => handleDragStart(e, node.meta.id)}
									ondragover={(e) => handleDragOver(e, node.meta.id)}
									ondragleave={handleDragLeave}
									ondrop={(e) => handleDrop(e, node.meta.id)}
									ondragend={handleDragEnd}
								>
									<button type="button" {...buttonProps} class="{buttonProps.class || ''} w-auto!">
										<ChevronRightIcon
											class="size-4 transition-transform group-data-[state=open]:rotate-90"
										/>
									</button>
									<button
										onclick={() => handleNodeClick(node.meta.id)}
										class="w-full overflow-hidden text-left text-nowrap text-ellipsis"
									>
										<span>
											{getDisplayName(node)}
										</span>
									</button>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
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
												canCopy={true}
												canCut={true}
												{canPaste}
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
							<!-- Multiple slots: show slot names as groups -->
							{#each getSlotEntries(node) as [slotName, slotChildren] (slotName)}
								{#if slotChildren.length > 0}
									<SidebarMenuSubItem>
										<Collapsible>
											<CollapsibleTrigger class="group">
												{#snippet child({ props })}
													<SidebarMenuSubButton {...props}>
														{#snippet child({ props: buttonProps })}
															<div
																role="button"
																tabindex="0"
																class="flex w-full items-center gap-1 rounded-md {dropTargetId ===
																	node.meta.id && dropTargetSlot === slotName
																	? 'drop-target-slot'
																	: ''}"
																ondragover={(e) => handleSlotDragOver(e, node.meta.id, slotName)}
																ondragleave={handleDragLeave}
																ondrop={(e) => handleSlotDrop(e, node.meta.id, slotName)}
															>
																<button
																	type="button"
																	{...buttonProps}
																	class="{buttonProps.class || ''} w-auto!"
																>
																	<ChevronRightIcon
																		class="size-4 transition-transform group-data-[state=open]:rotate-90"
																	/>
																</button>
																<span class="text-xs font-medium text-muted-foreground uppercase">
																	{slotName}
																</span>
															</div>
														{/snippet}
													</SidebarMenuSubButton>
												{/snippet}
											</CollapsibleTrigger>
											<CollapsibleContent>
												<SidebarMenuSub class="mr-0 pe-0">
													{#each slotChildren as childNode (childNode.meta.id)}
														<SidebarMenuSubItem>
															{@render renderNode(childNode, level + 1)}
														</SidebarMenuSubItem>
													{/each}
												</SidebarMenuSub>
											</CollapsibleContent>
										</Collapsible>
									</SidebarMenuSubItem>
								{/if}
							{/each}
						{:else}
							<!-- Single slot: show children directly -->
							{#each getChildren(node) as childNode (childNode.meta.id)}
								<SidebarMenuSubItem>
									{@render renderNode(childNode, level + 1)}
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
					ondragstart={(e) => handleDragStart(e, node.meta.id)}
					ondragover={(e) => handleDragOver(e, node.meta.id)}
					ondragleave={handleDragLeave}
					ondrop={(e) => handleDrop(e, node.meta.id)}
					ondragend={handleDragEnd}
				>
					<button
						onclick={() => handleNodeClick(node.meta.id)}
						class="h-full flex-1 overflow-hidden text-left text-nowrap text-ellipsis"
					>
						<span>
							{getDisplayName(node)}
						</span>
					</button>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
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
								canCopy={true}
								canCut={true}
								{canPaste}
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
{/snippet}

<SidebarGroup>
	<SidebarGroupLabel>Document</SidebarGroupLabel>
	<SidebarGroupContent>
		<SidebarMenu class=" mr-0">
			{#each nodes as node (node.meta.id)}
				{@render renderNode(node)}
			{/each}
		</SidebarMenu>
	</SidebarGroupContent>
</SidebarGroup>

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

	.drop-target-slot {
		background-color: color-mix(in srgb, hsl(var(--primary)) 15%, transparent 85%);
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
