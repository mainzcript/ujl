<script lang="ts">
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

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let { nodes }: { nodes: any[] } = $props();

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function hasChildren(node: any): boolean {
		return node.pages !== undefined && node.pages.length > 0;
	}
</script>

{#snippet renderNode(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	node: any,
	level: number = 0
)}
	{#if level === 0}
		{#if hasChildren(node)}
			<Collapsible>
				<SidebarMenuItem>
					<CollapsibleTrigger class="group">
						{#snippet child({ props })}
							<SidebarMenuButton {...props}>
								{#snippet child({ props: buttonProps })}
									<button type="button" {...buttonProps}>
										<ChevronRightIcon
											class="size-4 transition-transform group-data-[state=open]:rotate-90"
										/>
										<span>{node.name}</span>
									</button>
								{/snippet}
							</SidebarMenuButton>
						{/snippet}
					</CollapsibleTrigger>
					<CollapsibleContent>
						<SidebarMenuSub>
							{#each node.pages as page (page.name)}
								<SidebarMenuSubItem>
									{@render renderNode(page, level + 1)}
								</SidebarMenuSubItem>
							{/each}
						</SidebarMenuSub>
					</CollapsibleContent>
				</SidebarMenuItem>
			</Collapsible>
		{:else}
			<SidebarMenuItem>
				<SidebarMenuButton>
					{#snippet child({ props })}
						<button type="button" {...props}>
							<span>{node.name}</span>
						</button>
					{/snippet}
				</SidebarMenuButton>
			</SidebarMenuItem>
		{/if}
	{:else if hasChildren(node)}
		<Collapsible>
			<CollapsibleTrigger class="group">
				{#snippet child({ props })}
					<SidebarMenuSubButton {...props}>
						<ChevronRightIcon
							class="size-4 transition-transform group-data-[state=open]:rotate-90"
						/>
						<span>{node.name}</span>
					</SidebarMenuSubButton>
				{/snippet}
			</CollapsibleTrigger>
			<CollapsibleContent>
				<SidebarMenuSub>
					{#each node.pages as page (page.name)}
						<SidebarMenuSubItem>
							{@render renderNode(page, level + 1)}
						</SidebarMenuSubItem>
					{/each}
				</SidebarMenuSub>
			</CollapsibleContent>
		</Collapsible>
	{:else}
		<SidebarMenuSubButton>
			<span>{node.name}</span>
		</SidebarMenuSubButton>
	{/if}
{/snippet}

<SidebarGroup>
	<SidebarGroupLabel>Nodes</SidebarGroupLabel>
	<SidebarGroupContent>
		<SidebarMenu>
			{#each nodes as node (node.name)}
				{@render renderNode(node)}
			{/each}
		</SidebarMenu>
	</SidebarGroupContent>
</SidebarGroup>
