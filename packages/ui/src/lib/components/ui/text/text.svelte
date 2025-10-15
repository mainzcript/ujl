<script lang="ts" module>
	import { type VariantProps, tv } from 'tailwind-variants';

	export const textVariants = tv({
		base: 'max-w-prose text-pretty hyphens-auto',
		variants: {
			size: {
				default: 'text-base',
				xs: 'text-xs',
				sm: 'text-sm',
				lg: 'text-lg',
				xl: 'text-xl',
				'2xl': 'text-2xl',
				'3xl': 'text-3xl',
				'4xl': 'text-4xl',
				'5xl': 'text-5xl',
				'6xl': 'text-6xl'
			},
			weight: {
				normal: 'font-normal',
				medium: 'font-medium',
				semibold: 'font-semibold',
				bold: 'font-bold'
			},
			intensity: {
				muted: 'text-foreground/60',
				default: 'text-foreground/80',
				solid: 'text-foreground'
			}
		},
		defaultVariants: {
			size: 'default',
			weight: 'normal',
			intensity: 'default'
		}
	});

	export type TextSize = VariantProps<typeof textVariants>['size'];
	export type TextWeight = VariantProps<typeof textVariants>['weight'];
	export type TextIntensity = VariantProps<typeof textVariants>['intensity'];
</script>

<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className = '',
		children,
		as = 'p', // `p` is the default element
		size = 'default' as TextSize,
		weight = 'normal' as TextWeight,
		intensity = 'default' as TextIntensity,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLElement>> & {
		as?: keyof HTMLElementTagNameMap;
		size?: TextSize;
		weight?: TextWeight;
		intensity?: TextIntensity;
		children?: import('svelte').Snippet;
	} = $props();
</script>

<svelte:element
	this={as}
	bind:this={ref}
	class={cn(textVariants({ size, weight, intensity }), className)}
	{...restProps}
>
	{@render children?.()}
</svelte:element>
