<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '$lib/utils.js';
	import { getDrawerContext } from './context.js';

	interface DrawerOverlayProps extends WithElementRef<HTMLAttributes<HTMLDivElement>> {
		class?: string;
	}

	let { ref = $bindable(null), class: className, ...restProps }: DrawerOverlayProps = $props();

	const drawerContext = getDrawerContext();

	const isOpen = $derived(drawerContext?.open ?? false);

	/**
	 * Handle click on overlay - close the drawer.
	 */
	function handleClick() {
		drawerContext?.setOpen(false);
	}
</script>

<div
	bind:this={ref}
	data-slot="drawer-overlay"
	data-state={isOpen ? 'open' : 'closed'}
	class={cn(
		'fixed inset-0 z-50 bg-black/50 transition-opacity duration-200 ease-out',
		'data-[state=closed]:pointer-events-none data-[state=closed]:opacity-0',
		'data-[state=open]:opacity-100',
		className
	)}
	onclick={handleClick}
	{...restProps}
></div>
