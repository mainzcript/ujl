<script lang="ts">
	import { Button } from '$lib/index.js';
	import type { ButtonProps } from '$lib/components/ui/button/button.svelte';
	import { getCarouselContext } from './context.js';
	import type { WithoutChildren } from 'bits-ui';
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import type { CarouselState } from './carousel.js';

	let {
		ref = $bindable(null),
		class: className,
		size = 'icon',
		variant = 'muted',
		...restProps
	}: WithoutChildren<ButtonProps> = $props();

	const carouselCtx = getCarouselContext('<Carousel.Previous/>');

	let state: CarouselState | undefined = $state(undefined);

	$effect(() => {
		if (carouselCtx.carousel) {
			const id = carouselCtx.carousel.registerUpdateHandler((s) => {
				state = s;
			});
			return () => {
				if (carouselCtx.carousel) {
					carouselCtx.carousel.unregisterUpdateHandler(id);
				}
			};
		}
	});
</script>

<Button
	bind:ref
	class={className}
	disabled={!state?.canScrollPrev}
	aria-disabled={!state?.canScrollPrev}
	onclick={() => {
		carouselCtx.carousel?.scrollPrev();
	}}
	{size}
	{variant}
	{...restProps}
>
	<ChevronLeftIcon />
	<span class="sr-only">Previous slide</span>
</Button>
