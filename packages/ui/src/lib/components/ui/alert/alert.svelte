<script lang="ts" module>
	import { type VariantProps, tv } from 'tailwind-variants';
	import type { Flavor } from '$lib/tokens/flavor.js';

	export const alertVariants = tv({
		base: 'relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-lg border px-4 py-3 text-sm has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current border-2',
		variants: {
			variant: {
				default: 'elevation text-flavor-foreground border-flavor-foreground',
				flavored:
					'elevation bg-ambient-50 dark:bg-ambient-950 dark:text-flavor-400 text-flavor-500 border-flavor-500/80 dark:border-flavor-600/80'
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
		flavor = undefined,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		variant?: AlertVariant;
		flavor?: Flavor;
	} = $props();

	if (flavor && !variant) {
		variant = 'flavored';
	}
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
