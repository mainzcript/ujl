<script lang="ts" module>
	import { type VariantProps, tv } from 'tailwind-variants';
	import type { NotificationFlavor } from '$lib/tokens/flavor.js';
	import type { WithElementRef } from 'bits-ui';
	import type { HTMLAttributes } from 'svelte/elements';

	export const alertVariants = tv({
		base: 'relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-lg border px-4 py-3 text-sm has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current',
		variants: {
			variant: {
				default:
					'bg-flavor-100/80 dark:bg-flavor-900/80 text-flavor-600 dark:text-flavor-50 border-flavor-600 dark:border-flavor-50'
				// further variants could be added here
			}
		},
		defaultVariants: {
			variant: 'default'
		}
	});

	export type AlertVariant = VariantProps<typeof alertVariants>['variant'];

	export type AlertProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		variant?: AlertVariant;
		flavor?: NotificationFlavor;
	};
</script>

<script lang="ts">
	import { cn } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		variant = 'default',
		flavor = undefined,
		children,
		...restProps
	}: AlertProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="alert"
	class={cn(alertVariants({ variant }), flavor && `flavor-${flavor}`, className)}
	{...restProps}
	role="alert"
>
	{@render children?.()}
</div>
