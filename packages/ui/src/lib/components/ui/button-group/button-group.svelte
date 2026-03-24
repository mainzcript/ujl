<script lang="ts" module>
	import { tv, type VariantProps } from "tailwind-variants";

	export const buttonGroupVariants = tv({
		base: "has-[[data-slot=button-group]]:gap-2 flex w-fit items-stretch [&>*]:focus-visible:relative [&>*]:focus-visible:z-10 [&>input]:flex-1",
		variants: {
			orientation: {
				horizontal:
					"[&>*:first-child]:rounded-l-md [&>*:last-child]:rounded-r-md [&>*]:rounded-none [&>*:not(:first-child)]:border-l-0",
				vertical:
					"flex-col [&>*:first-child]:rounded-t-md [&>*:last-child]:rounded-b-md [&>*]:rounded-none [&>*:not(:first-child)]:border-t-0",
			},
		},
		defaultVariants: {
			orientation: "horizontal",
		},
	});

	export type ButtonGroupOrientation = VariantProps<typeof buttonGroupVariants>["orientation"];
</script>

<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		orientation = "horizontal",
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		orientation?: ButtonGroupOrientation;
	} = $props();
</script>

<div
	bind:this={ref}
	role="group"
	data-slot="button-group"
	data-orientation={orientation}
	class={cn(buttonGroupVariants({ orientation }), className)}
	{...restProps}
>
	{@render children?.()}
</div>
