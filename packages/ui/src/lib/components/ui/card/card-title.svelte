<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "$lib/utils.js";
	import Heading, { type HeadingLevel } from "../text/heading.svelte";

	let {
		ref = $bindable(null),
		class: className,
		children,
		level = 4 as HeadingLevel,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLElement>> & { level?: HeadingLevel } = $props();
</script>

<Heading data-slot="card-title" {level} class={cn("leading-none", className)} {...restProps}>
	{@render children?.()}
</Heading>
