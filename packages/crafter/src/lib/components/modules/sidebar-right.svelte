<script lang="ts">
	import NavUser from './nav-user.svelte';
	import {
		Sidebar,
		SidebarHeader,
		SidebarContent,
		SidebarGroup,
		SidebarGroupLabel,
		SidebarGroupContent,
		SidebarMenu,
		SidebarMenuItem,
		SidebarMenuButton,
		SidebarSeparator,
		SidebarFooter,
		Collapsible,
		CollapsibleTrigger,
		CollapsibleContent
	} from '@ujl-framework/ui';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import CheckIcon from '@lucide/svelte/icons/check';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import type { ComponentProps } from 'svelte';

	// This is sample data.
	const data = {
		user: {
			name: 'shadcn',
			email: 'm@example.com',
			avatar: '/avatars/shadcn.jpg'
		},
		groups: [
			{
				name: 'My Groups',
				items: ['Personal', 'Work', 'Family']
			},
			{
				name: 'Favorites',
				items: ['Important', 'Starred']
			},
			{
				name: 'Other',
				items: ['Archive', 'Trash', 'Spam']
			}
		]
	};

	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar> = $props();
</script>

<Sidebar
	bind:ref
	collapsible="none"
	class="sticky top-0 hidden h-svh border-l lg:flex"
	{...restProps}
>
	<SidebarHeader class="h-16 border-b border-sidebar-border">
		<NavUser user={data.user} />
	</SidebarHeader>
	<SidebarContent>
		{#each data.groups as group, index (group.name)}
			<SidebarGroup class="py-0">
				<Collapsible open={index === 0} class="group/collapsible">
					<SidebarGroupLabel
						class="group/label w-full text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
					>
						{#snippet child({ props })}
							<CollapsibleTrigger {...props}>
								{group.name}
								<ChevronRightIcon
									class="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90"
								/>
							</CollapsibleTrigger>
						{/snippet}
					</SidebarGroupLabel>
					<CollapsibleContent>
						<SidebarGroupContent>
							<SidebarMenu>
								{#each group.items as item, itemIndex (item)}
									<SidebarMenuItem>
										<SidebarMenuButton>
											<div
												data-active={itemIndex < 2}
												class="group/group-item flex aspect-square size-4 shrink-0 items-center justify-center rounded-xs border border-sidebar-border text-sidebar-primary-foreground data-[active=true]:border-sidebar-primary data-[active=true]:bg-sidebar-primary"
											>
												<CheckIcon
													class="hidden size-3 group-data-[active=true]/group-item:block"
												/>
											</div>
											{item}
										</SidebarMenuButton>
									</SidebarMenuItem>
								{/each}
							</SidebarMenu>
						</SidebarGroupContent>
					</CollapsibleContent>
				</Collapsible>
			</SidebarGroup>
			<SidebarSeparator class="mx-0" />
		{/each}
	</SidebarContent>
	<SidebarFooter>
		<SidebarMenu>
			<SidebarMenuItem>
				<SidebarMenuButton>
					<PlusIcon />
					<span>New Item</span>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	</SidebarFooter>
</Sidebar>
