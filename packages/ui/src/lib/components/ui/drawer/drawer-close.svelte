<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { type WithElementRef } from '$lib/utils.js';
	import { getDrawerContext } from './context.js';

	interface DrawerCloseProps extends WithElementRef<HTMLButtonAttributes> {
		children?: Snippet;
	}

	let { ref = $bindable(null), children, ...restProps }: DrawerCloseProps = $props();

	const drawerContext = getDrawerContext();

	/**
	 * Handle click - close the drawer.
	 */
	function handleClick() {
		drawerContext?.setOpen(false);
	}
</script>

<button bind:this={ref} type="button" data-slot="drawer-close" onclick={handleClick} {...restProps}>
	{@render children?.()}
</button>
