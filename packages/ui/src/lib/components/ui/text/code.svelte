<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className = "",
		children,
		as = "code",
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLElement>> & {
		as?: keyof HTMLElementTagNameMap;
		children?: import("svelte").Snippet;
	} = $props();
</script>

<svelte:element
	this={as}
	bind:this={ref}
	class={cn(
		"font-mono leading-(--typography-code-line-height) font-(--typography-code-weight) tracking-(--typography-code-letter-spacing) text-foreground",
		className,
	)}
	{...restProps}
>
	{@render children?.()}
</svelte:element>
