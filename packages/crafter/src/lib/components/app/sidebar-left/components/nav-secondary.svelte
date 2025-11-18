<script lang="ts">
	import MessageCircleQuestionIcon from '@lucide/svelte/icons/message-circle-question';
	import Settings2Icon from '@lucide/svelte/icons/settings-2';
	import {
		SidebarGroup,
		SidebarGroupContent,
		SidebarMenu,
		SidebarMenuItem,
		SidebarMenuButton,
		SidebarMenuBadge
	} from '@ujl-framework/ui';
	import type { Component, ComponentProps } from 'svelte';

	/**
	 * Sample navigation data for secondary navigation items.
	 * In a real application, these would typically come from props or a store.
	 */
	const defaultItems = [
		{
			title: 'Settings',
			url: '#',
			icon: Settings2Icon
		},
		{
			title: 'Help',
			url: '#',
			icon: MessageCircleQuestionIcon
		}
	];

	let {
		ref = $bindable(null),
		items = defaultItems,
		...restProps
	}: ComponentProps<typeof SidebarGroup> & {
		items?: { title: string; url: string; icon: Component; badge?: string }[];
	} = $props();
</script>

<SidebarGroup bind:ref {...restProps}>
	<SidebarGroupContent>
		<SidebarMenu>
			{#each items as item (item.title)}
				<SidebarMenuItem>
					<SidebarMenuButton>
						{#snippet child({ props })}
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
							<a href={item.url} {...props}>
								<item.icon />
								<span>{item.title}</span>
							</a>
						{/snippet}
					</SidebarMenuButton>
					{#if item.badge}
						<SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
					{/if}
				</SidebarMenuItem>
			{/each}
		</SidebarMenu>
	</SidebarGroupContent>
</SidebarGroup>
