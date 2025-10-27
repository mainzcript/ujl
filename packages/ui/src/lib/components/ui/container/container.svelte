<script lang="ts">
	import { cn } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		class: className = '',
		children,
		...restProps
	}: {
		class?: string;
		children: import('svelte').Snippet;
		as?: keyof HTMLElementTagNameMap;
	} & HTMLAttributes<HTMLElement> = $props();

	const baseStyle = 'container mx-auto';
</script>

<div class={cn(baseStyle, className)} {...restProps}>
	{@render children?.()}
</div>
