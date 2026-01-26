<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '$lib/utils.js';

	interface DrawerTitleProps extends WithElementRef<HTMLAttributes<HTMLHeadingElement>> {
		class?: string;
		children?: Snippet;
	}

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: DrawerTitleProps = $props();
</script>

<h2
	bind:this={ref}
	data-slot="drawer-title"
	class={cn('font-semibold text-foreground', className)}
	{...restProps}
>
	{@render children?.()}
</h2>
