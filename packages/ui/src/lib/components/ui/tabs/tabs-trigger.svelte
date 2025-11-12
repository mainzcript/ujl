<script lang="ts">
	import { Tabs as TabsPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: TabsPrimitive.TriggerProps = $props();
</script>

<TabsPrimitive.Trigger
	bind:ref
	data-slot="tabs-trigger"
	class={cn(
		'inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1',
		'data-[state=active]:border-foreground/30 focus-visible:border-ring/50 border border-transparent',
		'text-foreground/70 hover:text-foreground/90 data-[state=active]:text-foreground text-sm font-medium',
		'data-[state=active]:bg-flavor data-[state=active]:shadow-sm',
		'focus-visible:ring-ring/50 focus-visible:outline-ring focus-visible:outline-1 focus-visible:ring-[3px]',
		"h-[calc(100%-1px)] transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
		className
	)}
	{...restProps}
/>
