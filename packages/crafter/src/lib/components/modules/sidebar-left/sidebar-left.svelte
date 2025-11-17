<!--
	Main sidebar component that orchestrates mode switching between content editor (UJLC) and theme designer (UJLT).

	This is a controlled component - the mode state is owned by app.svelte and passed down as a prop.
	This component:
	- Receives tokenSet (theme tokens), contentSlot (root slot), and mode as props from app.svelte
	- Provides a mode switcher to toggle between Editor and Designer views
	- Routes to the appropriate child component based on the mode prop
	- Forwards all Sidebar component props while adding Crafter-specific props
-->
<script lang="ts">
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
	import type { UJLTTokenSet, UJLCSlotObject } from '@ujl-framework/types';

	import Header from './components/header.svelte';
	import Editor from './editor/editor.svelte';
	import Designer from './designer/designer.svelte';
	import NavSecondary from './components/nav-secondary.svelte';
	import { Sidebar, SidebarContent, SidebarRail } from '@ujl-framework/ui';
	import type { ComponentProps } from 'svelte';
	import type { CrafterMode } from '../types.js';

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
		]
	};

	/**
	 * Forward all Sidebar props while adding Crafter-specific props for tokenSet and contentSlot.
	 * tokenSet comes from ujltDocument.ujlt.tokens (theme tokens)
	 * contentSlot comes from ujlcDocument.ujlc.root (root slot array)
	 * Mode state is now controlled by parent (app.svelte)
	 */
	let {
		mode = $bindable<CrafterMode>('editor'),
		onModeChange,
		tokenSet,
		contentSlot,
		ref = $bindable(null),
		...restProps
	}: ComponentProps<typeof Sidebar> & {
		mode?: CrafterMode;
		onModeChange?: (mode: CrafterMode) => void;
		tokenSet: UJLTTokenSet;
		contentSlot: UJLCSlotObject;
	} = $props();
</script>

<Sidebar class="border-r-0" bind:ref {...restProps}>
	<Header bind:mode {onModeChange} navMainItems={data.navMain} />
	<SidebarContent>
		{#if mode === 'editor'}
			<Editor slot={contentSlot} />
		{:else}
			<Designer tokens={tokenSet} />
		{/if}
		<NavSecondary class="mt-auto" />
	</SidebarContent>
	<SidebarRail />
</Sidebar>
