<script lang="ts" module>
	import type { WithElementRef } from 'bits-ui';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import { type VariantProps, tv } from 'tailwind-variants';
	import type { Flavor } from '$lib/tokens/flavor.js';

	export const buttonVariants = tv({
		base: 'focus-visible:ring-ring focus-visible:scale-[.98] duration-200 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none opacity-100 disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[.95] touch-manipulation',
		variants: {
			variant: {
				default: 'elevation after:bg-flavor-foreground text-flavor',
				flavored: 'elevation after:bg-flavor text-flavor-foreground hover:after:bg-flavor/90',
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
			flavor?: Flavor;
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
		children,
		...restProps
	}: ButtonProps = $props();

	if (flavor && !variant) {
		variant = 'flavored';
	}

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
</script>

{#if href}
	<a
		bind:this={ref}
		class={cn(buttonVariants({ variant, size }), flavor && `flavor-${flavor}`, className)}
		{href}
		ontouchstart={handleTouchStart}
		ontouchend={handleTouchEnd}
		{...restProps}
	>
		{@render children?.()}
	</a>
{:else}
	<button
		bind:this={ref}
		class={cn(buttonVariants({ variant, size }), flavor && `flavor-${flavor}`, className)}
		{type}
		{disabled}
		ontouchstart={handleTouchStart}
		ontouchend={handleTouchEnd}
		{...restProps}
	>
		{@render children?.()}
	</button>
{/if}
