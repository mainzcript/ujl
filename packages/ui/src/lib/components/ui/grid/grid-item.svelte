<script lang="ts">
	import { cn } from '$lib/utils.js';

	let {
		class: className = '',
		children,
		as = 'div', // `div` is the default element
		...restProps
	} = $props();

	const baseStyle = 'col-span-full';
</script>

<svelte:element this={as} class={cn(baseStyle, className)} {...restProps}>
	{@render children()}
</svelte:element>
