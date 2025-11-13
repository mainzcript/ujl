<script lang="ts">
	import {
		SidebarGroup,
		SidebarGroupContent,
		SidebarMenu,
		SidebarMenuItem,
		SidebarMenuButton,
		SidebarMenuBadge
	} from '@ujl-framework/ui';
	import type { Component, ComponentProps } from 'svelte';

	let {
		ref = $bindable(null),
		items,
		...restProps
	}: ComponentProps<typeof SidebarGroup> & {
		items: { title: string; url: string; icon: Component; badge?: string }[];
	} = $props();
</script>

<SidebarGroup bind:ref {...restProps}>
	<SidebarGroupContent>
		<SidebarMenu>
			{#each items as item (item.title)}
				<SidebarMenuItem>
					<SidebarMenuButton>
						{#snippet child({ props })}
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
