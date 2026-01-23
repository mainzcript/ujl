<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { type WithElementRef } from '$lib/utils.js';
	import { getDrawerContext } from './context.js';

	interface DrawerTriggerProps extends WithElementRef<HTMLButtonAttributes> {
		children?: Snippet;
	}

	let { ref = $bindable(null), children, ...restProps }: DrawerTriggerProps = $props();

	const drawerContext = getDrawerContext();

	/**
	 * Handle click - open the drawer.
	 */
	function handleClick() {
		drawerContext?.setOpen(true);
	}
</script>

<button
	bind:this={ref}
	type="button"
	data-slot="drawer-trigger"
	onclick={handleClick}
	{...restProps}
>
	{@render children?.()}
</button>
