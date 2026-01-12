<script lang="ts">
	import type { Snippet } from 'svelte';
	import AppHeaderWrapper from './app-header-wrapper.svelte';
	import AppSidebar from './app-sidebar.svelte';
	import AppCanvas from './app-canvas.svelte';
	import AppPanel from './app-panel.svelte';

	let {
		logo,
		header,
		sidebar,
		canvas,
		panel
	}: {
		logo?: Snippet;
		header?: Snippet;
		sidebar?: Snippet;
		canvas?: Snippet;
		panel?: Snippet;
	} = $props();
</script>

{#if logo || header}
	<AppHeaderWrapper {logo} {header} />
{/if}

<div class="flex flex-1 gap-1">
	{#if sidebar}
		<AppSidebar>{@render sidebar()}</AppSidebar>
	{/if}

	<div class="flex flex-1 flex-col gap-1">
		<div class="flex flex-1 gap-1 rounded-xl border border-border bg-foreground/5 p-1">
			{#if canvas}
				<AppCanvas>{@render canvas()}</AppCanvas>
			{/if}

			{#if panel}
				<AppPanel>{@render panel()}</AppPanel>
			{/if}
		</div>
	</div>
</div>
