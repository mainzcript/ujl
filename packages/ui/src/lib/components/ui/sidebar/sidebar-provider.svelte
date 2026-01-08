<script lang="ts">
	import { TooltipProvider } from '$lib/components/ui/tooltip/index.js';
	import { cn, type WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		SIDEBAR_COOKIE_MAX_AGE,
		SIDEBAR_COOKIE_NAME,
		SIDEBAR_WIDTH,
		SIDEBAR_WIDTH_ICON
	} from './constants.js';
	import { setSidebar } from './context.svelte.js';

	let {
		ref = $bindable(null),
		open = $bindable(true),
		onOpenChange = () => {},
		breakpoint = 768,
		class: className,
		style,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
		/**
		 * Breakpoint in pixels. When the container width is below this value,
		 * the sidebar will use narrow layout (e.g., Sheet on mobile).
		 * Default: 768px
		 */
		breakpoint?: number;
	} = $props();

	let providerRef: HTMLElement | null = $state(null);

	const sidebar = setSidebar({
		open: () => open,
		setOpen: (value: boolean) => {
			open = value;
			onOpenChange(value);

			// This sets the cookie to keep the sidebar state.
			document.cookie = `${SIDEBAR_COOKIE_NAME}=${open}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
		}
	});

	// Set initial breakpoint and update when it changes
	$effect(() => {
		sidebar.setBreakpoint(breakpoint);
	});

	// Set provider ref for container-based width observation
	$effect(() => {
		if (providerRef) {
			sidebar.setProviderRef(providerRef);
		}
		return () => {
			sidebar.setProviderRef(null);
		};
	});

	// Sync external ref with internal ref
	$effect(() => {
		ref = providerRef;
	});
</script>

<svelte:window onkeydown={sidebar.handleShortcutKeydown} />

<TooltipProvider delayDuration={0}>
	<div
		bind:this={providerRef}
		data-slot="sidebar-wrapper"
		style="--sidebar-width: {SIDEBAR_WIDTH}; --sidebar-width-icon: {SIDEBAR_WIDTH_ICON}; {style}"
		class={cn(
			'group/sidebar-wrapper flex min-h-svh w-full has-data-[variant=inset]:bg-sidebar',
			className
		)}
		{...restProps}
	>
		{@render children?.()}
	</div>
</TooltipProvider>
