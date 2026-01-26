<script lang="ts">
	import { cn, type WithoutChild } from '$lib/utils.js';
	import { Popover as PopoverPrimitive } from 'bits-ui';
	import { getUjlThemeContext } from '../ujl-theme/context.js';

	let {
		ref = $bindable(null),
		class: className,
		sideOffset = 4,
		align = 'center',
		portalProps,
		children,
		...restProps
	}: WithoutChild<PopoverPrimitive.ContentProps> & {
		portalProps?: PopoverPrimitive.PortalProps;
		children?: import('svelte').Snippet;
	} = $props();

	const themeContext = getUjlThemeContext();
	const themeId = $derived(themeContext?.themeId ?? null);
	const isDark = $derived(themeContext ? themeContext.isDark : false);
	const portalTarget = $derived(themeContext?.portalContainer ?? undefined);
</script>

<PopoverPrimitive.Portal to={portalTarget} {...portalProps}>
	<PopoverPrimitive.Content
		bind:ref
		data-slot="combobox-content"
		data-ujl-theme={themeId}
		{sideOffset}
		{align}
		class={cn(
			isDark && 'dark',
			'elevation z-50 w-72 rounded-md p-0 backdrop-blur',
			'origin-(--bits-popover-content-transform-origin) data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
			className
		)}
		{...restProps}
	>
		{@render children?.()}
	</PopoverPrimitive.Content>
</PopoverPrimitive.Portal>
