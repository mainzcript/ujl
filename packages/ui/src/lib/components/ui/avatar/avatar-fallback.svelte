<script lang="ts">
	import { Avatar as AvatarPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: AvatarPrimitive.FallbackProps = $props();
</script>

<AvatarPrimitive.Fallback
	bind:ref
	data-slot="avatar-fallback"
	class={cn(
		"elevation flex size-full items-center justify-center rounded-full text-foreground backdrop-blur after:bg-flavor-foreground/10",
		className,
	)}
	{...restProps}
/>
