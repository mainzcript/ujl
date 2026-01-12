<script lang="ts">
	import { cn, type WithElementRef } from '@ujl-framework/ui/utils';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import { setApp } from './context.svelte.js';
	import { APP_SIDEBAR_WIDTH, APP_PANEL_WIDTH } from './constants.js';

	let {
		ref = $bindable(null),
		sidebarOpen = $bindable(true),
		panelOpen = $bindable(false),
		class: className,
		style,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		sidebarOpen?: boolean;
		panelOpen?: boolean;
		children?: Snippet;
	} = $props();

	let containerRef: HTMLElement | null = $state(null);

	// Set App context (used by child components via useApp())
	setApp({
		sidebarOpen: () => sidebarOpen,
		setSidebarOpen: (v) => {
			sidebarOpen = v;
		},
		panelOpen: () => panelOpen,
		setPanelOpen: (v) => {
			panelOpen = v;
		}
	});

	$effect(() => {
		ref = containerRef;
	});
</script>

<div
	bind:this={containerRef}
	data-slot="app-wrapper"
	style="--ujl-app-sidebar-width: {APP_SIDEBAR_WIDTH}; --ujl-app-panel-width: {APP_PANEL_WIDTH}; {style}"
	class={cn('@container/ujl-app h-full bg-background', className)}
	{...restProps}
>
	<div class="mx-auto flex h-full max-w-[2000px] flex-col gap-1 p-1">
		{@render children?.()}
	</div>
</div>
