<script lang="ts">
	import { cn, type WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...props
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
	bind:this={ref}
	data-slot="input-group"
	role="group"
	class={cn(
		'group/input-group elevation border-foreground/25 text-foreground relative flex w-full items-center rounded-md border shadow-sm outline-none transition-[color,box-shadow]',
		'h-9 has-[>textarea]:h-auto',

		// Variants based on alignment.
		'has-[>[data-align=inline-start]]:[&>input]:pl-2',
		'has-[>[data-align=inline-end]]:[&>input]:pr-2',
		'has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-start]]:[&>input]:pb-3',
		'has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-end]]:[&>input]:pt-3',

		// Focus state.
		'has-[[data-slot=input-group-control]:focus-visible]:border-ring/50 has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50 has-[[data-slot=input-group-control]:focus-visible]:ring-[3px]',

		// Error state.
		'has-[[data-slot][aria-invalid=true]]:ring-destructive/20 dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40 has-[[data-slot][aria-invalid=true]]:border-destructive',

		className
	)}
	{...props}
>
	{@render children?.()}
</div>
