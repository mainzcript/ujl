<script lang="ts">
	import MessageCircleQuestionIcon from '@lucide/svelte/icons/message-circle-question';
	import Settings2Icon from '@lucide/svelte/icons/settings-2';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';

	import NavMain from './nav-main.svelte';
	import NavSecondary from './nav-secondary.svelte';
	import NavTree from './nav-tree.svelte';
	import ModeSwitcher from './mode-switcher.svelte';
	import { Sidebar, SidebarHeader, SidebarContent, SidebarRail } from '@ujl-framework/ui';
	import type { ComponentProps } from 'svelte';

	// This is sample data.
	const data = {
		navMain: [
			{
				title: 'Ask AI',
				url: '#',
				icon: SparklesIcon
			}
		],
		navSecondary: [
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
		],
		nodes: [
			{
				name: 'UJL Framework Example',
				pages: [
					{
						name: 'Main Container',
						pages: [
							{
								name: 'Hero Text'
							},
							{
								name: 'Features Grid',
								pages: [
									{
										name: 'Type-Safe Fields'
									},
									{
										name: 'Modular Architecture'
									},
									{
										name: 'Flexible Rendering'
									}
								]
							},
							{
								name: 'Description Text'
							},
							{
								name: 'Try UJL Framework Button'
							},
							{
								name: 'Nested Container',
								pages: [
									{
										name: 'Call-to-Action'
									}
								]
							}
						]
					}
				]
			}
		]
	};

	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar> = $props();
</script>

<Sidebar class="border-r-0" {...restProps}>
	<SidebarHeader>
		<ModeSwitcher />
		<NavMain items={data.navMain} />
	</SidebarHeader>
	<SidebarContent>
		<NavTree nodes={data.nodes} />
		<NavSecondary items={data.navSecondary} class="mt-auto" />
	</SidebarContent>
	<SidebarRail />
</Sidebar>
