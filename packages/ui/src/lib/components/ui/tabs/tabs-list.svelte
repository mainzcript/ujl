<script lang="ts">
	import { Tabs as TabsPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils.js';

	let { ref = $bindable(null), class: className, ...restProps }: TabsPrimitive.ListProps = $props();
</script>

<TabsPrimitive.List
	bind:ref
	data-slot="tabs-list"
	class={cn(
		'elevation inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px] shadow-sm after:bg-flavor-foreground/10',
		className
	)}
	{...restProps}
/>
