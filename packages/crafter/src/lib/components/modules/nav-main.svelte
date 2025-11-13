<script lang="ts">
	import {
		SidebarMenu,
		SidebarMenuItem,
		SidebarMenuButton
	} from '@ujl-framework/ui';
	import type { Component } from 'svelte';

	let { items }: { items: { title: string; url: string; icon: Component; isActive?: boolean }[] } =
		$props();
</script>

<SidebarMenu>
	{#each items as item (item.title)}
		<SidebarMenuItem>
			<SidebarMenuButton isActive={item.isActive}>
				{#snippet child({ props })}
					<a href={item.url} {...props}>
						<item.icon />
						<span>{item.title}</span>
					</a>
				{/snippet}
			</SidebarMenuButton>
		</SidebarMenuItem>
	{/each}
</SidebarMenu>
