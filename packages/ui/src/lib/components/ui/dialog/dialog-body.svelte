<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

	let {
		class: className,
		children,
		...restProps
	}: {
		class?: string;
		children: import("svelte").Snippet;
	} & HTMLAttributes<HTMLDivElement> = $props();
</script>

<div class={className} {...restProps}>
	{@render children?.()}
</div>
