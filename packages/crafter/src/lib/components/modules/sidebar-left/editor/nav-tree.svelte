<script lang="ts">
	import type { UJLCModuleObject } from '@ujl-framework/types';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';

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
		SidebarMenuSubButton
	} from '@ujl-framework/ui';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let {
		nodes,
		onNodeMove,
		onNodeReorder
	}: {
		nodes: UJLCModuleObject[];
		onNodeMove?: (nodeId: string, targetId: string) => boolean;
		onNodeReorder?: (nodeId: string, targetId: string, position: 'before' | 'after') => boolean;
	} = $props();

	const selectedNodeId = $derived($page.url.searchParams.get('selected'));

	// Drag & Drop State
	let draggedNodeId = $state<string | null>(null);
	let dropTargetId = $state<string | null>(null);
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
	 * checks if target has slots (can accept children)
	 */
	function canAcceptDrop(targetNode: UJLCModuleObject): boolean {
		return targetNode.slots && Object.keys(targetNode.slots).length > 0;
	}

	function handleNodeClick(nodeId: string) {
		const url = new URL($page.url);
		url.searchParams.set('selected', nodeId);
		goto(url, { replaceState: true, noScroll: true });
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
		dropPosition = null;
	}

	function handleDrop(event: DragEvent, targetNodeId: string) {
		event.preventDefault();

		if (!draggedNodeId || draggedNodeId === targetNodeId) {
			resetDragState();
			return;
		}

		console.log('Drop:', draggedNodeId, dropPosition, targetNodeId);

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
			// Drop into node
			if (onNodeMove) {
				success = onNodeMove(draggedNodeId, targetNodeId);
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
		dropPosition = null;
	}
</script>

{#snippet renderNode(node: UJLCModuleObject, level: number = 0)}
	{@const isDragging = draggedNodeId === node.meta.id}
	{@const isDropTarget = dropTargetId === node.meta.id}
	{@const isSelected = selectedNodeId === node.meta.id}
	{@const showDropBefore = isDropTarget && dropPosition === 'before'}
	{@const showDropAfter = isDropTarget && dropPosition === 'after'}
	{@const showDropInto = isDropTarget && dropPosition === 'into' && canAcceptDrop(node)}

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
										class="flex w-full items-center justify-between gap-1 rounded-md {isSelected
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
									</div>
								{/snippet}
							</SidebarMenuButton>
						{/snippet}
					</CollapsibleTrigger>
					<CollapsibleContent>
						<SidebarMenuSub class="mr-0 pe-0">
							{#each getChildren(node) as childNode (childNode.meta.id)}
								<SidebarMenuSubItem>
									{@render renderNode(childNode, level + 1)}
								</SidebarMenuSubItem>
							{/each}
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
							class="{props.class || ''} {isSelected ? 'selected' : ''} {isDragging
								? 'opacity-50'
								: ''} {showDropInto ? 'drop-target' : ''}"
							onclick={() => handleNodeClick(node.meta.id)}
							draggable="true"
							ondragstart={(e) => handleDragStart(e, node.meta.id)}
							ondragover={(e) => handleDragOver(e, node.meta.id)}
							ondragleave={handleDragLeave}
							ondrop={(e) => handleDrop(e, node.meta.id)}
							ondragend={handleDragEnd}
						>
							<span>{getDisplayName(node)}</span>
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
			<Collapsible>
				<CollapsibleTrigger class="group">
					{#snippet child({ props })}
						<SidebarMenuButton {...props}>
							{#snippet child({ props: buttonProps })}
								<div
									role="button"
									tabindex="0"
									class="flex w-full items-center justify-between rounded-md {isSelected
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
								</div>
							{/snippet}
						</SidebarMenuButton>
					{/snippet}
				</CollapsibleTrigger>
				<CollapsibleContent>
					<SidebarMenuSub class="mr-0 pe-0">
						{#each getChildren(node) as childNode (childNode.meta.id)}
							<SidebarMenuSubItem>
								{@render renderNode(childNode, level + 1)}
							</SidebarMenuSubItem>
						{/each}
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
			<SidebarMenuSubButton class="px-0">
				<div
					role="button"
					tabindex="0"
					class="flex w-full items-center justify-between rounded-md p-2 pe-0 {isSelected
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
						onclick={() => handleNodeClick(node.meta.id)}
						class="h-full w-full overflow-hidden text-left text-nowrap text-ellipsis"
					>
						<span>
							{getDisplayName(node)}
						</span>
					</button>
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
		outline: 2px dashed hsl(var(--primary));
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
