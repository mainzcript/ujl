<script lang="ts">
	import GripVerticalIcon from '@lucide/svelte/icons/grip-vertical';
	import * as ResizablePrimitive from 'paneforge';
	import { cn, type WithoutChildrenOrChild } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		withHandle = false,
		...restProps
	}: WithoutChildrenOrChild<ResizablePrimitive.PaneResizerProps> & {
		withHandle?: boolean;
	} = $props();
</script>

<ResizablePrimitive.PaneResizer
	bind:ref
	data-slot="resizable-handle"
	class={cn(
		'bg-flavor-foreground/15 focus-visible:ring-ring after:inset-y-0 after:w-1 data-[direction=vertical]:after:left-0 data-[direction=vertical]:after:h-1 data-[direction=vertical]:after:translate-x-0 relative flex w-px items-center justify-center after:absolute after:left-1/2 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-hidden data-[direction=vertical]:h-px data-[direction=vertical]:w-full data-[direction=vertical]:after:w-full data-[direction=vertical]:after:-translate-y-1/2 [&[data-direction=vertical]>div]:rotate-90',
		className
	)}
	{...restProps}
>
	{#if withHandle}
		<div
			class="bg-flavor-foreground/25 rounded-xs border-flavor-foreground/50 text-flavor-foreground h-4 w-3 z-10 flex items-center justify-center border"
		>
			<GripVerticalIcon class="size-2.5" />
		</div>
	{/if}
</ResizablePrimitive.PaneResizer>
