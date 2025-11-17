<!--
	Sidebar header component that contains the mode switcher and main navigation.

	This component uses $bindable for activeMode to allow two-way binding with the parent,
	while also accepting a callback for mode changes.
-->
<script lang="ts">
	import ModeSwitcher from './_mode-switcher.svelte';
	import NavMain from './_nav-main.svelte';
	import { SidebarHeader } from '@ujl-framework/ui';
	import type { Component } from 'svelte';

	/**
	 * Mode describes a sidebar mode (Editor vs Designer) and is used to switch the main content view.
	 * fileType ('ujlc' or 'ujlt') determines which component is rendered in the sidebar.
	 */
	type Mode = {
		name: string;
		icon: Component;
		fileType: string;
	};

	/**
	 * @param activeMode - The currently active mode (bindable for two-way binding)
	 * @param onModeChange - Callback function called when the user switches modes
	 * @param navMainItems - Array of navigation items to display in the main nav section
	 */
	let {
		activeMode = $bindable(),
		onModeChange,
		navMainItems
	}: {
		activeMode: Mode;
		onModeChange: (mode: Mode) => void;
		navMainItems: { title: string; url: string; icon: Component }[];
	} = $props();
</script>

<SidebarHeader>
	<ModeSwitcher bind:activeMode {onModeChange} />
	<NavMain items={navMainItems} />
</SidebarHeader>
