<script lang="ts">
	import { Tabs as TabsPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils.js';

	let { ref = $bindable(null), class: className, ...restProps }: TabsPrimitive.ListProps = $props();
</script>

<TabsPrimitive.List
	bind:ref
	data-slot="tabs-list"
	class={cn(
		'elevation after:bg-flavor-foreground/10 h-9 rounded-lg shadow-sm inline-flex w-fit items-center justify-center p-[3px]',
		className
	)}
	{...restProps}
/>
