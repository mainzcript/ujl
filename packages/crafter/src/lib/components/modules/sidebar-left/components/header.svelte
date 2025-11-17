<!--
	Sidebar header component that contains the mode switcher and main navigation.

	This is a controlled component that passes through mode state from the parent.
	It uses $bindable for mode to allow two-way binding, while also accepting a callback for mode changes.
-->
<script lang="ts">
	import ModeSwitcher from './mode-switcher.svelte';
	import NavMain from './nav-main.svelte';
	import { SidebarHeader } from '@ujl-framework/ui';
	import type { Component } from 'svelte';
	import type { CrafterMode } from '../../types.js';

	/**
	 * @param mode - The currently active mode (bindable for two-way binding)
	 * @param onModeChange - Callback function called when the user switches modes
	 * @param navMainItems - Array of navigation items to display in the main nav section
	 */
	let {
		mode = $bindable<CrafterMode>('editor'),
		onModeChange,
		navMainItems
	}: {
		mode?: CrafterMode;
		onModeChange?: (mode: CrafterMode) => void;
		navMainItems: { title: string; url: string; icon: Component }[];
	} = $props();
</script>

<SidebarHeader>
	<ModeSwitcher bind:mode {onModeChange} />
	<NavMain items={navMainItems} />
</SidebarHeader>
