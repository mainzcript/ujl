<script lang="ts">
	import { Card } from '@ujl-framework/ui';
	import { cn, type WithElementRef } from '@ujl-framework/ui/utils';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLElement>> & {
		children?: Snippet;
	} = $props();
</script>

<main class={cn('flex-1', className)} bind:this={ref} {...restProps}>
	<Card class="relative h-full w-full overflow-hidden p-0">
		<div class="absolute top-0 right-0 h-full w-full overflow-auto">
			{@render children?.()}
		</div>
	</Card>
</main>
