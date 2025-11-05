<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getCarouselContext } from './context.js';
	import { cn, type WithElementRef } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();

	let wrapper: HTMLDivElement;

	const carouselCtx = getCarouselContext('<Carousel.Item/>');

	$effect(() => {
		const carousel = carouselCtx.carousel;
		if (carousel && wrapper && ref) {
			const id = carousel.registerItem(wrapper, ref);
			return () => {
				carousel.unregisterItem(id);
			};
		}
	});
</script>

<div
	data-slot="carousel-item-wrapper"
	class="min-w-0 px-2 relative shrink-0 grow-0"
	bind:this={wrapper}
>
	<div class="inset-0 -left-20 top-0 absolute snap-start"></div>
	<div
		bind:this={ref}
		data-slot="carousel-item"
		role="group"
		aria-roledescription="slide"
		class={cn('will-change-all duration-10', className)}
		{...restProps}
	>
		{@render children?.()}
	</div>
</div>
