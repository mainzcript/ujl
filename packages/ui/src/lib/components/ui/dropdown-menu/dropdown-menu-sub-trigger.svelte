<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import { cn } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		inset,
		children,
		...restProps
	}: DropdownMenuPrimitive.SubTriggerProps & {
		inset?: boolean;
	} = $props();
</script>

<DropdownMenuPrimitive.SubTrigger
	bind:ref
	data-slot="dropdown-menu-sub-trigger"
	data-inset={inset}
	class={cn(
		"data-highlighted:bg-primary/80 data-highlighted:text-primary-foreground data-[state=open]:bg-primary/80 data-[state=open]:text-primary-foreground [&_svg:not([class*='text-'])]:text-muted-foreground gap-2 rounded-sm px-2 py-1.5 text-sm data-[inset]:pl-8 [&_svg:not([class*='size-'])]:size-4 flex cursor-default items-center outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
		className
	)}
	{...restProps}
>
	{@render children?.()}
	<ChevronRightIcon class="size-4 ml-auto" />
</DropdownMenuPrimitive.SubTrigger>
