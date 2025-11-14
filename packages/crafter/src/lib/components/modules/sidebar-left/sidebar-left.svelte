<script lang="ts">
	import MessageCircleQuestionIcon from '@lucide/svelte/icons/message-circle-question';
	import Settings2Icon from '@lucide/svelte/icons/settings-2';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
	import PencilRulerIcon from '@lucide/svelte/icons/pencil-ruler';
	import PaletteIcon from '@lucide/svelte/icons/palette';

	import Header from './header.svelte';
	import Editor from './editor/editor.svelte';
	import Designer from './designer/designer.svelte';
	import NavSecondary from './nav-secondary.svelte';
	import { Sidebar, SidebarContent, SidebarRail } from '@ujl-framework/ui';
	import type { Component, ComponentProps } from 'svelte';

	type Mode = {
		name: string;
		icon: Component;
		fileType: string;
	};

	const modes: Mode[] = [
		{
			name: 'Editor',
			icon: PencilRulerIcon,
			fileType: 'ujlc'
		},
		{
			name: 'Designer',
			icon: PaletteIcon,
			fileType: 'ujlt'
		}
	];

	// This is sample data.
	const data = {
		navMain: [
			{
				title: 'Example Action',
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

	let activeMode = $state(modes[0]);

	function handleModeChange(mode: Mode) {
		activeMode = mode;
	}

	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar> = $props();
</script>

<Sidebar class="border-r-0" bind:ref {...restProps}>
	<Header {activeMode} onModeChange={handleModeChange} navMainItems={data.navMain} />
	<SidebarContent>
		{#if activeMode.fileType === 'ujlc'}
			<Editor nodes={data.nodes} />
		{:else}
			<Designer />
		{/if}
		<NavSecondary items={data.navSecondary} class="mt-auto" />
	</SidebarContent>
	<SidebarRail />
</Sidebar>
