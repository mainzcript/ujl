<script lang="ts">
	import { cn, type WithElementRef } from '@ujl-framework/ui/utils';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		children?: Snippet;
	} = $props();
</script>

<div class={cn('flex-1 overflow-hidden', className)} bind:this={ref} {...restProps}>
	{@render children?.()}
</div>
