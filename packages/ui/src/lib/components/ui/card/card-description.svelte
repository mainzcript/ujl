<script lang="ts">
	import { Text, type TextSize, type TextWeight } from '$lib/index.js';

	let {
		ref = $bindable(null),
		children,
		size = 'sm' as TextSize,
		weight = 'default' as TextWeight,
		...restProps
	}: {
		ref?: HTMLElement | null;
		children?: import('svelte').Snippet;
		size?: TextSize;
		weight?: TextWeight;
		[key: string]: unknown;
	} = $props();
</script>

<Text bind:ref data-slot="card-description" {size} {weight} intensity="muted" {...restProps}>
	{@render children?.()}
</Text>
