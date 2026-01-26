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
	const isDark = $derived(themeContext ? themeContext.isDark : false);
	const portalTarget = $derived(themeContext?.portalContainer ?? undefined);
</script>

<PopoverPrimitive.Portal to={portalTarget} {...portalProps}>
	<PopoverPrimitive.Content
		bind:ref
		data-slot="popover-content"
		data-ujl-theme={themeId}
		{sideOffset}
		{align}
		class={cn(
			isDark && 'dark',
			'z-50 w-72 rounded-md border border-border bg-background/90 p-4 shadow shadow-foreground/10 backdrop-blur',
			'origin-(--bits-popover-content-transform-origin) data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
			className
		)}
		{...restProps}
	/>
</PopoverPrimitive.Portal>
