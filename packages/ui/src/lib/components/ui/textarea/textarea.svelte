<script lang="ts">
	import { cn, type WithElementRef, type WithoutChildren } from '$lib/utils.js';
	import type { HTMLTextareaAttributes } from 'svelte/elements';

	let {
		ref = $bindable(null),
		value = $bindable(),
		class: className,
		'data-slot': dataSlot = 'textarea',
		...restProps
	}: WithoutChildren<WithElementRef<HTMLTextareaAttributes>> = $props();
</script>

<textarea
	bind:this={ref}
	data-slot={dataSlot}
	class={cn(
		'elevation border-foreground/25 text-foreground border shadow-sm',
		'selection:bg-primary selection:text-primary-foreground ring-offset-background placeholder:text-foreground/50 shadow-xs field-sizing-content flex min-h-16 w-full rounded-md px-3 py-2 text-base outline-none transition-[color,box-shadow] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
		'focus-visible:border-ring/50 focus-visible:ring-ring/50 focus-visible:ring-[3px]',
		'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
		className
	)}
	bind:value
	{...restProps}
></textarea>
