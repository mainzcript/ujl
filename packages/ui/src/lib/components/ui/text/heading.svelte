<script lang="ts" module>
	import { type VariantProps, tv } from "tailwind-variants";

	export const headingVariants = tv({
		base: "[--text-base:var(--typography-heading-size)] [--tw-leading:var(--typography-heading-line-height)] [font-family:var(--typography-heading-font)] font-(--typography-heading-weight) tracking-(--typography-heading-letter-spacing) [font-style:var(--typography-heading-style)] [text-decoration:var(--typography-heading-decoration)] [text-transform:var(--typography-heading-transform)] text-heading text-pretty hyphens-auto",
		variants: {
			level: {
				1: "text-4xl sm:text-5xl",
				2: "text-3xl sm:text-4xl",
				3: "text-2xl sm:text-3xl",
				4: "text-xl sm:text-2xl",
				5: "text-lg sm:text-xl",
				6: "text-base sm:text-lg",
			},
		},
		defaultVariants: {
			level: 1,
		},
	});

	export type HeadingLevel = VariantProps<typeof headingVariants>["level"];
</script>

<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className = "",
		children,
		level = 2 as HeadingLevel,
		as = `h${level}` as keyof HTMLElementTagNameMap,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLElement>> & {
		level?: HeadingLevel;
		as?: keyof HTMLElementTagNameMap;
		children?: import("svelte").Snippet;
	} = $props();
</script>

<svelte:element
	this={as}
	bind:this={ref}
	class={cn(headingVariants({ level }), className)}
	{...restProps}
>
	{@render children?.()}
</svelte:element>
