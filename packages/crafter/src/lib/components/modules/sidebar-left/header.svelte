<script lang="ts">
	import ModeSwitcher from './mode-switcher.svelte';
	import NavMain from './nav-main.svelte';
	import { SidebarHeader } from '@ujl-framework/ui';
	import type { Component } from 'svelte';

	type Mode = {
		name: string;
		icon: Component;
		fileType: string;
	};

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
