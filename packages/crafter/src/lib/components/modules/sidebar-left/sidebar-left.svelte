<!--
	Main sidebar component that orchestrates mode switching between content editor (UJLC) and theme designer (UJLT).

	This component:
	- Receives tokenSet (theme tokens) and contentSlot (root slot) as props from app.svelte
	- Provides a mode switcher to toggle between Editor and Designer views
	- Routes to the appropriate child component based on the selected mode
	- Forwards all Sidebar component props while adding Crafter-specific props
-->
<script lang="ts">
	import MessageCircleQuestionIcon from '@lucide/svelte/icons/message-circle-question';
	import Settings2Icon from '@lucide/svelte/icons/settings-2';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
	import PencilRulerIcon from '@lucide/svelte/icons/pencil-ruler';
	import PaletteIcon from '@lucide/svelte/icons/palette';
	import type { UJLTTokenSet, UJLCSlotObject } from '@ujl-framework/types';

	import Header from './components/header.svelte';
	import Editor from './editor/editor.svelte';
	import Designer from './designer/designer.svelte';
	import NavSecondary from './components/nav-secondary.svelte';
	import { Sidebar, SidebarContent, SidebarRail } from '@ujl-framework/ui';
	import type { Component, ComponentProps } from 'svelte';

	/**
	 * Mode describes a sidebar mode (Editor vs Designer) and is used to switch the main content view.
	 * The fileType property ('ujlc' or 'ujlt') determines which component is rendered.
	 */
	type Mode = {
		name: string;
		icon: Component;
		fileType: string;
	};

	/**
	 * Available sidebar modes.
	 * fileType is used to decide which sidebar mode to render (content editor vs theme designer).
	 */
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

	/**
	 * Sample navigation data.
	 * In a real application, these would typically come from props or a store.
	 */
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
		]
	};

	let activeMode = $state(modes[0]);

	function handleModeChange(mode: Mode) {
		activeMode = mode;
	}

	/**
	 * Forward all Sidebar props while adding Crafter-specific props for tokenSet and contentSlot.
	 * tokenSet comes from ujltDocument.ujlt.tokens (theme tokens)
	 * contentSlot comes from ujlcDocument.ujlc.root (root slot array)
	 */
	let {
		tokenSet,
		contentSlot,
		ref = $bindable(null),
		...restProps
	}: ComponentProps<typeof Sidebar> & {
		tokenSet: UJLTTokenSet;
		contentSlot: UJLCSlotObject;
	} = $props();
</script>

<Sidebar class="border-r-0" bind:ref {...restProps}>
	<Header bind:activeMode onModeChange={handleModeChange} navMainItems={data.navMain} />
	<SidebarContent>
		{#if activeMode.fileType === 'ujlc'}
			<Editor slot={contentSlot} />
		{:else}
			<Designer tokens={tokenSet} />
		{/if}
		<NavSecondary items={data.navSecondary} class="mt-auto" />
	</SidebarContent>
	<SidebarRail />
</Sidebar>
