<script lang="ts" module>
	import { type VariantProps, tv } from 'tailwind-variants';

	export const headingVariants = tv({
		base: 'font-bold text-foreground text-pretty hyphens-auto',
		variants: {
			level: {
				1: 'text-4xl sm:text-5xl',
				2: 'text-3xl sm:text-4xl',
				3: 'text-2xl sm:text-3xl',
				4: 'text-xl sm:text-2xl',
				5: 'text-lg sm:text-xl',
				6: 'text-base sm:text-lg'
			}
		},
		defaultVariants: {
			level: 1
		}
	});

	export type HeadingLevel = VariantProps<typeof headingVariants>['level'];
</script>

<script lang="ts">
	import { cn } from '$lib/utils.js';
	import { Text, type TextWeight } from '$lib/components/ui/text/index.js';

	let {
		class: className = '',
		children,
		level = 2 as HeadingLevel,
		as = `h${level}`,
		weight = 'bold' as TextWeight,
		...restProps
	} = $props();
</script>

<Text {as} size="xl" {weight} class={cn(headingVariants({ level }), className)} {...restProps}>
	{@render children()}
</Text>
