<script lang="ts" module>
	import { type VariantProps, tv } from 'tailwind-variants';

	export const alertVariants = tv({
		base: 'relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-lg border px-4 py-3 text-sm has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current border-2 backdrop-blur-sm',
		variants: {
			variant: {
				default: 'text-foreground border-foreground bg-flavor/90',
				ambient: 'text-ambient-foreground border-flavor-foreground-ambient bg-ambient/90',
				primary: 'text-primary-foreground border-flavor-foreground-primary bg-primary/90',
				secondary: 'text-secondary-foreground border-flavor-foreground-secondary bg-secondary/90',
				accent: 'text-accent-foreground border-flavor-foreground-accent bg-accent/90',
				success: 'text-success-foreground border-flavor-foreground-success bg-success/90',
				warning: 'text-warning-foreground border-flavor-foreground-warning bg-warning/90',
				destructive:
					'text-destructive-foreground border-flavor-foreground-destructive bg-destructive/90',
				info: 'text-info-foreground border-flavor-foreground-info bg-info/90'
			}
		},
		defaultVariants: {
			variant: 'default'
		}
	});

	export type AlertVariant = VariantProps<typeof alertVariants>['variant'];
</script>

<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		variant = undefined,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		variant?: AlertVariant;
	} = $props();
</script>

<div
	bind:this={ref}
	data-slot="alert"
	class={cn(alertVariants({ variant }), className)}
	{...restProps}
	role="alert"
>
	{@render children?.()}
</div>
