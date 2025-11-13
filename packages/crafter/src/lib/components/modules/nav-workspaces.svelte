<script lang="ts">
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import PlusIcon from '@lucide/svelte/icons/plus';

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
		SidebarMenuAction,
		SidebarMenuSub,
		SidebarMenuSubItem,
		SidebarMenuSubButton
	} from '@ujl-framework/ui';

	let {
		workspaces
	}: { workspaces: { name: string; emoji: string; pages: { name: string; emoji: string }[] }[] } =
		$props();
</script>

<SidebarGroup>
	<SidebarGroupLabel>Workspaces</SidebarGroupLabel>
	<SidebarGroupContent>
		<SidebarMenu>
			{#each workspaces as workspace (workspace.name)}
				<Collapsible>
					<SidebarMenuItem>
						<SidebarMenuButton>
							{#snippet child({ props })}
								<a href="##" {...props}>
									<span>{workspace.emoji}</span>
									<span>{workspace.name}</span>
								</a>
							{/snippet}
						</SidebarMenuButton>
						<CollapsibleTrigger>
							{#snippet child({ props })}
								<SidebarMenuAction
									{...props}
									class="left-2 bg-sidebar-accent text-sidebar-accent-foreground data-[state=open]:rotate-90"
									showOnHover
								>
									<ChevronRightIcon />
								</SidebarMenuAction>
							{/snippet}
						</CollapsibleTrigger>
						<SidebarMenuAction showOnHover>
							<PlusIcon />
						</SidebarMenuAction>
						<CollapsibleContent>
							<SidebarMenuSub>
								{#each workspace.pages as page (page.name)}
									<SidebarMenuSubItem>
										<SidebarMenuSubButton href="##">
											<span>{page.emoji}</span>
											<span>{page.name}</span>
										</SidebarMenuSubButton>
									</SidebarMenuSubItem>
								{/each}
							</SidebarMenuSub>
						</CollapsibleContent>
					</SidebarMenuItem>
				</Collapsible>
			{/each}
			<SidebarMenuItem>
				<SidebarMenuButton class="text-sidebar-foreground/70">
					<EllipsisIcon />
					<span>More</span>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	</SidebarGroupContent>
</SidebarGroup>
