<script lang="ts">
	import type { WithElementRef } from 'bits-ui';
	import type { HTMLImgAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: WithElementRef<HTMLImgAttributes> = $props();
</script>

<img
	bind:this={ref}
	class={cn(
		'elevation border-flavor-foreground/20 block h-auto max-w-full rounded border',
		className
	)}
	{...restProps}
/>
