<script lang="ts">
	import { cn } from '@ujl-framework/ui/utils';
	import type { Snippet } from 'svelte';
	import { useApp } from './context.svelte.js';
	import AppSidebarTrigger from './app-sidebar-trigger.svelte';
	import AppLogo from './app-logo.svelte';
	import AppHeader from './app-header.svelte';
	import AppActions from './app-actions.svelte';
	import AppPanelTrigger from './app-panel-trigger.svelte';

	let {
		logo,
		header,
		actions
	}: {
		logo?: Snippet;
		header?: Snippet;
		actions?: Snippet;
	} = $props();

	const app = useApp();
</script>

<header class="flex h-12 shrink-0 items-center gap-2">
	<div
		class={cn(
			'flex shrink-0 items-center gap-2 overflow-hidden duration-300',
			app.sidebarOpen ? '@7xl/app:w-[240px]' : 'w-[140px]'
		)}
	>
		<AppSidebarTrigger />

		{#if logo}
			<AppLogo>{@render logo()}</AppLogo>
		{/if}
	</div>

	{#if header}
		<AppHeader>{@render header()}</AppHeader>
	{/if}

	<div class="flex items-center justify-end gap-2 @5xl/app:w-sm @5xl/app:shrink-0">
		{#if actions}
			<AppActions>{@render actions()}</AppActions>
		{/if}

		<AppPanelTrigger />
	</div>
</header>
