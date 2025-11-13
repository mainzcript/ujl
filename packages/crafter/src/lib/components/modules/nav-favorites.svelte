<script lang="ts">
	import {
		DropdownMenu,
		DropdownMenuTrigger,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuSeparator
	} from '@ujl-framework/ui';

	// Namespace object to maintain compatibility with existing component usage patterns.
	// Components from @ujl-framework/ui are exported with full names (e.g., DropdownMenu, DropdownMenuItem)
	// but the codebase uses namespace-style access (e.g., DropdownMenu.Root, DropdownMenu.Item)
	const DropdownMenuNamespace = {
		Root: DropdownMenu,
		Trigger: DropdownMenuTrigger,
		Content: DropdownMenuContent,
		Item: DropdownMenuItem,
		Separator: DropdownMenuSeparator
	};
	import {
		SidebarGroup,
		SidebarGroupLabel,
		SidebarMenu,
		SidebarMenuItem,
		SidebarMenuButton,
		SidebarMenuAction,
		useSidebar
	} from '@ujl-framework/ui';
	import ArrowUpRightIcon from '@lucide/svelte/icons/arrow-up-right';
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import LinkIcon from '@lucide/svelte/icons/link';
	import StarOffIcon from '@lucide/svelte/icons/star-off';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';

	let { favorites }: { favorites: { name: string; url: string; emoji: string }[] } = $props();

	const sidebar = useSidebar();
</script>

<SidebarGroup class="group-data-[collapsible=icon]:hidden">
	<SidebarGroupLabel>Favorites</SidebarGroupLabel>
	<SidebarMenu>
		{#each favorites as item (item.name)}
			<SidebarMenuItem>
				<SidebarMenuButton>
					{#snippet child({ props })}
						<a href={item.url} title={item.name} {...props}>
							<span>{item.emoji}</span>
							<span>{item.name}</span>
						</a>
					{/snippet}
				</SidebarMenuButton>
				<DropdownMenuNamespace.Root>
					<DropdownMenuNamespace.Trigger>
						{#snippet child({ props })}
							<SidebarMenuAction showOnHover {...props}>
								<EllipsisIcon />
								<span class="sr-only">More</span>
							</SidebarMenuAction>
						{/snippet}
					</DropdownMenuNamespace.Trigger>
					<DropdownMenuNamespace.Content
						class="w-56 rounded-lg"
						side={sidebar.isMobile ? 'bottom' : 'right'}
						align={sidebar.isMobile ? 'end' : 'start'}
					>
						<DropdownMenuNamespace.Item>
							<StarOffIcon class="text-muted-foreground" />
							<span>Remove from Favorites</span>
						</DropdownMenuNamespace.Item>
						<DropdownMenuNamespace.Separator />
						<DropdownMenuNamespace.Item>
							<LinkIcon class="text-muted-foreground" />
							<span>Copy Link</span>
						</DropdownMenuNamespace.Item>
						<DropdownMenuNamespace.Item>
							<ArrowUpRightIcon class="text-muted-foreground" />
							<span>Open in New Tab</span>
						</DropdownMenuNamespace.Item>
						<DropdownMenuNamespace.Separator />
						<DropdownMenuNamespace.Item>
							<Trash2Icon class="text-muted-foreground" />
							<span>Delete</span>
						</DropdownMenuNamespace.Item>
					</DropdownMenuNamespace.Content>
				</DropdownMenuNamespace.Root>
			</SidebarMenuItem>
		{/each}
		<SidebarMenuItem>
			<SidebarMenuButton class="text-sidebar-foreground/70">
				<EllipsisIcon />
				<span>More</span>
			</SidebarMenuButton>
		</SidebarMenuItem>
	</SidebarMenu>
</SidebarGroup>
