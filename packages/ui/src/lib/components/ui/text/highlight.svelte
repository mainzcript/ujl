<script lang="ts">
	import { cn } from '$lib/utils.js';

	let { class: className = '', children, as = 'strong', ...restProps } = $props();

	const baseStyle = 'text-accent';
</script>

<svelte:element this={as} class={cn(baseStyle, className)} {...restProps}>
	{@render children()}
</svelte:element>
