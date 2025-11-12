<script lang="ts" module>
	import { type VariantProps, tv } from 'tailwind-variants';
	import type { UJLTFlavor } from '@ujl-framework/core';

	export const badgeVariants = tv({
		base: 'focus-visible:border-ring/50 focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium transition-[color,box-shadow] focus-visible:ring-[3px] [&>svg]:pointer-events-none [&>svg]:size-3',
		variants: {
			variant: {
				default: 'elevation bg-flavor-foreground/80 text-flavor border-flavor-foreground/20',
				flavored: 'elevation text-flavor-foreground',
				outline: 'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground'
			}
		},
		defaultVariants: {
			variant: 'default'
		}
	});

	export type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];
</script>

<script lang="ts">
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		href,
		class: className,
		variant = undefined,
		flavor = undefined,
		children,
		...restProps
	}: WithElementRef<HTMLAnchorAttributes> & {
		variant?: BadgeVariant;
		flavor?: UJLTFlavor;
	} = $props();

	if (flavor && !variant) {
		variant = 'flavored';
	}
</script>

<svelte:element
	this={href ? 'a' : 'span'}
	bind:this={ref}
	data-slot="badge"
	{href}
	class={cn(badgeVariants({ variant }), flavor && `flavor-${flavor}`, className)}
	{...restProps}
>
	{@render children?.()}
</svelte:element>
