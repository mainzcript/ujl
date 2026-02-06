<script lang="ts">
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";
	import { Text } from "../text/index.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLElement>> = $props();
</script>

<caption bind:this={ref} data-slot="table-caption" class="mt-4" {...restProps}>
	<Text intensity="muted" size="sm" class={className}>{@render children?.()}</Text>
</caption>
