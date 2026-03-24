<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import { buttonVariants, type ButtonVariant } from "$lib/components/ui/button/button.svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import type { Snippet } from "svelte";

	let {
		ref = $bindable(null),
		class: className,
		variant = undefined,
		child,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		variant?: ButtonVariant;
		child?: Snippet<[{ props: Record<string, unknown> }]>;
	} = $props();

	const mergedProps = $derived({
		...restProps,
		class: cn(
			buttonVariants({ variant, size: "default" }),
			"pointer-events-none gap-2 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none",
			className,
		),
		"data-slot": "button-group-text",
	});
</script>

{#if child}
	{@render child({ props: mergedProps })}
{:else}
	<div bind:this={ref} {...mergedProps}>
		{@render mergedProps.children?.()}
	</div>
{/if}
