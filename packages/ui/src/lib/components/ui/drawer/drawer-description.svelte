<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "$lib/utils.js";

	interface DrawerDescriptionProps extends WithElementRef<HTMLAttributes<HTMLParagraphElement>> {
		class?: string;
		children?: Snippet;
	}

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: DrawerDescriptionProps = $props();
</script>

<p
	bind:this={ref}
	data-slot="drawer-description"
	class={cn("text-sm text-muted-foreground", className)}
	{...restProps}
>
	{@render children?.()}
</p>
