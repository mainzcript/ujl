<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className = "",
		children,
		as = "strong",
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLElement>> & {
		as?: keyof HTMLElementTagNameMap;
		children?: import("svelte").Snippet;
	} = $props();

	const baseStyle =
		"text-highlight font-(--typography-highlight-weight) [font-style:var(--typography-highlight-style)] [text-decoration:var(--typography-highlight-decoration)]";
</script>

<svelte:element this={as} bind:this={ref} class={cn(baseStyle, className)} {...restProps}>
	{@render children?.()}
</svelte:element>
