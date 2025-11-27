<!--
	Controlled sidebar that switches between the content editor (UJLC) and theme designer (UJLT).
	Receives mode, tokenSet and contentSlot from app.svelte and forwards them to child components.
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
	 * Mode state is controlled by parent (app.svelte) - this is a controlled component.
	 */
	let {
		mode,
		onModeChange,
		tokenSet,
		contentSlot,
		ref = $bindable(null),
		...restProps
	}: ComponentProps<typeof Sidebar> & {
		mode: CrafterMode;
		onModeChange?: (mode: CrafterMode) => void;
		tokenSet: UJLTTokenSet;
		contentSlot: UJLCSlotObject;
	} = $props();
</script>

<Sidebar class="border-r-0" bind:ref {...restProps}>
	<Header {mode} {onModeChange} navMainItems={data.navMain} />
	<SidebarContent>
		{#if mode === 'editor'}
			<Editor slot={contentSlot} />
		{:else}
			<Designer tokens={tokenSet} />
		{/if}
	</SidebarContent>
	<NavSecondary class="mt-auto" />
	<SidebarRail />
</Sidebar>
