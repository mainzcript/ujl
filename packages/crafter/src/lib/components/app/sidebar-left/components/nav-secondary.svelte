<script lang="ts">
	import InfoIcon from '@lucide/svelte/icons/info';
	import FileTextIcon from '@lucide/svelte/icons/file-text';
	import ShieldCheckIcon from '@lucide/svelte/icons/shield-check';
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
	 * Navigation data for secondary navigation items.
	 * Includes legal links (Imprint, Privacy) and utility links.
	 */
	const defaultItems = [
		{
			title: 'Info',
			url: 'https://ujl-framework.org/',
			icon: InfoIcon
		},
		{
			title: 'Imprint',
			url: 'https://ujl-framework.org/legal/imprint.html',
			icon: FileTextIcon
		},
		{
			title: 'Privacy',
			url: 'https://ujl-framework.org/legal/privacy.html',
			icon: ShieldCheckIcon
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
							<a
								href={item.url}
								target={item.url.startsWith('http') ? '_blank' : undefined}
								rel={item.url.startsWith('http') ? 'noreferrer' : undefined}
								{...props}
							>
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
