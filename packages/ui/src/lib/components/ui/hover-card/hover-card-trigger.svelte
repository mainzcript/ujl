<script lang="ts">
	import { LinkPreview as HoverCardPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: HoverCardPrimitive.TriggerProps = $props();
</script>

<HoverCardPrimitive.Trigger
	bind:ref
	data-slot="hover-card-trigger"
	class={cn("cursor-pointer", className)}
	{...restProps}
/>
