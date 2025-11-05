<script lang="ts">
	import { Card } from '$lib/index.js';
	import { getCarouselContext } from './context.js';
	import { cn, type WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { CarouselState } from './carousel.js';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();

	const carouselCtx = getCarouselContext('<Carousel.Dots/>');

	let carouselState: CarouselState | undefined = $state(undefined);
	let itemCount: number = $state(0); // Memoize the dots array to avoid recreating it on every update

	$effect(() => {
		if (carouselCtx.carousel) {
			const id = carouselCtx.carousel.registerUpdateHandler((s) => {
				carouselState = s;
				if (s.itemCount !== itemCount) {
					itemCount = s.itemCount;
				}
			});
			return () => {
				if (carouselCtx.carousel) {
					carouselCtx.carousel.unregisterUpdateHandler(id);
				}
			};
		}
	});
</script>

<Card bind:ref class={cn('px-2 py-1 relative inline-block rounded-full', className)} {...restProps}>
	<div class="flex" role="tablist" aria-label="Carousel navigation">
		{#each Array(itemCount), i (i)}
			{@const isActive = carouselState
				? carouselState.firstActiveIndex <= i && i <= carouselState.lastActiveIndex
				: false}
			<button
				class="duration-200 hover:scale-150"
				onclick={() => carouselCtx.carousel?.scrollTo(i)}
				role="tab"
				aria-current={isActive ? 'true' : 'false'}
				aria-selected={isActive ? 'true' : 'false'}
			>
				<div
					data-is-active={isActive}
					class="bg-foreground/30 data-[is-active=true]:bg-foreground/80 m-0.5 h-2 w-2 rounded-full duration-500"
				></div>
				<span class="sr-only">
					{isActive
						? `Slide ${i + 1} of ${itemCount}, currently active`
						: `Go to slide ${i + 1} of ${itemCount}`}
				</span>
			</button>
		{/each}
	</div>
</Card>
