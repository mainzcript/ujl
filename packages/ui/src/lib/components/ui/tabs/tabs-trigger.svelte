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
		'inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1 whitespace-nowrap',
		'border border-transparent focus-visible:border-ring/50 data-[state=active]:border-foreground/30',
		'text-sm font-medium text-foreground/70 hover:text-foreground/90 data-[state=active]:text-foreground',
		'data-[state=active]:bg-flavor data-[state=active]:shadow-sm',
		'focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring',
		"h-[calc(100%-1px)] transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
		className
	)}
	{...restProps}
/>
