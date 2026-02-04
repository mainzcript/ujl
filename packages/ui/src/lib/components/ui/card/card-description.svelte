<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { Text } from "$lib/index.js";
	import { type WithElementRef } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		children,
		as,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLElement>> & {
		children?: import("svelte").Snippet;
		as?: keyof HTMLElementTagNameMap;
	} = $props();
</script>

<Text bind:ref data-slot="card-description" {as} size="sm" intensity="muted" {...restProps}>
	{@render children?.()}
</Text>
