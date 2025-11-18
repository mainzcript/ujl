<!-- Sidebar header containing the mode switcher and main navigation. -->
<script lang="ts">
	import ModeSwitcher from './mode-switcher.svelte';
	import NavMain from './nav-main.svelte';
	import { SidebarHeader } from '@ujl-framework/ui';
	import type { Component } from 'svelte';
	import type { CrafterMode } from '../../types.js';

	/**
	 * @param mode - The currently active mode
	 * @param onModeChange - Callback function called when the user switches modes
	 * @param navMainItems - Array of navigation items to display in the main nav section
	 */
	let {
		mode,
		onModeChange,
		navMainItems
	}: {
		mode: CrafterMode;
		onModeChange?: (mode: CrafterMode) => void;
		navMainItems: { title: string; url: string; icon: Component }[];
	} = $props();
</script>

<SidebarHeader>
	<ModeSwitcher {mode} {onModeChange} />
	<NavMain items={navMainItems} />
</SidebarHeader>
