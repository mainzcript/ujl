<script lang="ts">
	import { cn } from '$lib/utils.js';
	import { Popover as PopoverPrimitive } from 'bits-ui';
	import { getUjlThemeContext } from '../ujl-theme/context.js';

	let {
		ref = $bindable(null),
		class: className,
		sideOffset = 4,
		align = 'center',
		portalProps,
		...restProps
	}: PopoverPrimitive.ContentProps & {
		portalProps?: PopoverPrimitive.PortalProps;
	} = $props();

	const themeContext = getUjlThemeContext();
	const themeId = $derived(themeContext?.themeId ?? null);
</script>

<PopoverPrimitive.Portal {...portalProps}>
	<PopoverPrimitive.Content
		bind:ref
		data-slot="popover-content"
		data-ujl-theme={themeId}
		{sideOffset}
		{align}
		class={cn(
			'elevation w-72 rounded-md p-4 backdrop-blur z-50',
			'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--bits-popover-content-transform-origin)',
			className
		)}
		{...restProps}
	/>
</PopoverPrimitive.Portal>
