<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getCarouselContext } from './context.js';
	import { cn } from '$lib/utils.js';
	import { Carousel } from './carousel.js';
	let { class: className, children, ...restProps }: HTMLAttributes<HTMLDivElement> = $props();

	const carouselCtx = getCarouselContext('<Carousel.wrapper/>');

	let wrapper: HTMLDivElement;

	$effect(() => {
		if (wrapper) {
			const carousel = new Carousel(wrapper);
			carouselCtx.carousel = carousel;
			return () => {
				if (carouselCtx.carousel) {
					carouselCtx.carousel.destroy();
					carouselCtx.carousel = null;
				}
			};
		}
	});
</script>

<div class="relative">
	<div
		bind:this={wrapper}
		data-slot="carousel-wrapper"
		class="no-scrollbar -mx-22 -my-2 py-2 snap-x snap-mandatory overflow-x-scroll"
		style="mask: linear-gradient(to right, transparent 0%, black 80px, black calc(100% - 80px), transparent 100%); -webkit-mask: linear-gradient(to right, transparent 0%, black 80px, black calc(100% - 80px), transparent 100%);"
	>
		<div data-slot="carousel-track" class={cn('isolate flex', className)} {...restProps}>
			<div
				class="w-20 min-w-0 relative shrink-0 grow-0"
				data-slot="carousel-placeholder-start"
			></div>
			{@render children?.()}
			<div class="w-20 min-w-0 relative shrink-0 grow-0" data-slot="carousel-placeholder-end"></div>
		</div>
	</div>
</div>
