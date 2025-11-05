<script lang="ts" module>
	import type { WithElementRef } from 'bits-ui';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import { type VariantProps, tv } from 'tailwind-variants';
	import type { UJLTFlavor } from '@ujl-framework/core';

	export const buttonVariants = tv({
		base: 'focus-visible:ring-ring focus-visible:scale-[.98] duration-200 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none opacity-100 disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[.95] touch-manipulation transition-all',
		variants: {
			variant: {
				default: 'elevation bg-flavor-foreground text-flavor shadow-sm',
				flavored: 'elevation bg-flavor text-flavor-foreground hover:bg-flavor/90 shadow-sm',
				muted:
					'elevation after:bg-flavor-foreground/15 text-flavor-foreground backdrop-blur shadow-sm',
				outline:
					'border border-flavor-foreground text-flavor-foreground hover:bg-flavor-foreground hover:text-flavor',
				ghost: 'hover:bg-flavor-foreground/10 text-flavor-foreground'
			},
			size: {
				default: 'h-9 px-4 py-2',
				sm: 'h-8 rounded-md px-3 text-xs',
				lg: 'h-10 rounded-md px-8',
				icon: 'h-9 w-9'
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'default'
		}
	});

	export type ButtonVariant = VariantProps<typeof buttonVariants>['variant'];
	export type ButtonSize = VariantProps<typeof buttonVariants>['size'];

	export type ButtonProps = WithElementRef<HTMLButtonAttributes> &
		WithElementRef<HTMLAnchorAttributes> & {
			variant?: ButtonVariant;
			size?: ButtonSize;
			flavor?: UJLTFlavor;
			as?: 'button' | 'a' | 'div' | 'span';
		};
</script>

<script lang="ts">
	import { cn } from '$lib/utils.js';

	let {
		class: className,
		variant = undefined,
		size = 'default',
		flavor = undefined,
		ref = $bindable(null),
		href = undefined,
		type = 'button',
		disabled,
		as = undefined,
		children,
		...restProps
	}: ButtonProps = $props();

	if (flavor && !variant) {
		variant = 'flavored';
	}

	// Determine element type
	const elementType = as || (href ? 'a' : 'button');

	// Touch event handlers for better mobile interaction
	function handleTouchStart(event: TouchEvent) {
		if (disabled) return;
		const target = event.currentTarget as HTMLElement;
		target.style.transform = 'scale(0.95)';
	}

	function handleTouchEnd(event: TouchEvent) {
		if (disabled) return;
		const target = event.currentTarget as HTMLElement;
		target.style.transform = '';
	}

	// Touch handlers for different element types
	const touchHandlers = {
		ontouchstart: handleTouchStart,
		ontouchend: handleTouchEnd
	};

	// For div/span elements, only use basic props
	const basicProps = {
		role: restProps.role,
		tabindex: restProps.tabindex,
		'aria-label': restProps['aria-label'],
		'aria-describedby': restProps['aria-describedby'],
		'data-testid': restProps['data-testid']
	};
</script>

{#if elementType === 'a'}
	<a
		bind:this={ref}
		class={cn(buttonVariants({ variant, size }), flavor && `flavor-${flavor}`, className)}
		{href}
		{...touchHandlers}
		{...restProps}
	>
		{@render children?.()}
	</a>
{:else if elementType === 'div'}
	<div
		bind:this={ref}
		class={cn(buttonVariants({ variant, size }), flavor && `flavor-${flavor}`, className)}
		{...basicProps}
	>
		{@render children?.()}
	</div>
{:else if elementType === 'span'}
	<span
		bind:this={ref}
		class={cn(buttonVariants({ variant, size }), flavor && `flavor-${flavor}`, className)}
		{...basicProps}
	>
		{@render children?.()}
	</span>
{:else}
	<button
		bind:this={ref}
		class={cn(buttonVariants({ variant, size }), flavor && `flavor-${flavor}`, className)}
		{type}
		{disabled}
		{...touchHandlers}
		{...restProps}
	>
		{@render children?.()}
	</button>
{/if}
