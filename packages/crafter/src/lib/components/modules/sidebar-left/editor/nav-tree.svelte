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

	let { nodes }: { nodes: UJLCModuleObject[] } = $props();

	const selectedNodeId = $derived($page.url.searchParams.get('selected'));

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

	function handleNodeClick(nodeId: string) {
		const url = new URL($page.url);
		url.searchParams.set('selected', nodeId);
		goto(url, { replaceState: true, noScroll: true });
		console.log('Node clicked:', selectedNodeId);
	}
</script>

{#snippet renderNode(node: UJLCModuleObject, level: number = 0)}
	{#if level === 0}
		{#if hasChildren(node)}
			<SidebarMenuItem>
				<Collapsible>
					<CollapsibleTrigger class="group">
						{#snippet child({ props })}
							<SidebarMenuButton {...props}>
								{#snippet child({ props: buttonProps })}
									<div
										class="flex w-full items-center justify-between gap-1 rounded-md {selectedNodeId ===
										node.meta.id
											? 'node-selected'
											: ''}"
									>
										<button
											type="button"
											{...buttonProps}
											class=" {buttonProps.class || ''}  w-auto!"
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
						<SidebarMenuSub>
							{#each getChildren(node) as childNode (childNode.meta.id)}
								<SidebarMenuSubItem>
									{@render renderNode(childNode, level + 1)}
								</SidebarMenuSubItem>
							{/each}
						</SidebarMenuSub>
					</CollapsibleContent>
				</Collapsible>
			</SidebarMenuItem>
		{:else}
			<SidebarMenuItem onclick={() => handleNodeClick(node.meta.id)}>
				<SidebarMenuButton>
					{#snippet child({ props })}
						<button
							type="button"
							{...props}
							class="{props.class || ''} {selectedNodeId === node.meta.id ? 'selected' : ''}"
						>
							<span>{getDisplayName(node)}</span>
						</button>
					{/snippet}
				</SidebarMenuButton>
			</SidebarMenuItem>
		{/if}
	{:else if hasChildren(node)}
		<Collapsible>
			<CollapsibleTrigger class="group" onclick={() => handleNodeClick(node.meta.id)}>
				{#snippet child({ props })}
					<SidebarMenuButton {...props}>
						{#snippet child({ props: buttonProps })}
							<div
								class="flex w-full items-center justify-between rounded-md {selectedNodeId ===
								node.meta.id
									? 'node-selected'
									: ''}"
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
				<SidebarMenuSub>
					{#each getChildren(node) as childNode (childNode.meta.id)}
						<SidebarMenuSubItem>
							{@render renderNode(childNode, level + 1)}
						</SidebarMenuSubItem>
					{/each}
				</SidebarMenuSub>
			</CollapsibleContent>
		</Collapsible>
	{:else}
		<SidebarMenuSubButton class="px-0">
			<div
				class="flex w-full items-center justify-between rounded-md p-2 {selectedNodeId ===
				node.meta.id
					? 'node-selected'
					: ''}"
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
	{/if}
{/snippet}

<SidebarGroup>
	<SidebarGroupLabel>Document</SidebarGroupLabel>
	<SidebarGroupContent>
		<SidebarMenu>
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
</style>
