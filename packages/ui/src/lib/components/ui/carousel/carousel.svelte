<script lang="ts">
	import { type CarouselContext, setCarouselContext } from "./context.js";
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";
	import type { CarouselOptions } from "./carousel.js";
	import { DEFAULT_OPTIONS } from "./carousel.js";

	type CarouselProps = {
		options?: Partial<CarouselOptions>;
	} & WithElementRef<HTMLAttributes<HTMLDivElement>>;

	let {
		ref = $bindable(null),
		options = {},
		class: className,
		children,
		...restProps
	}: CarouselProps = $props();

	// Context setup
	let carouselCtx = $state<CarouselContext>({
		carousel: null,
	});

	setCarouselContext(carouselCtx);

	$effect(() => {
		if (carouselCtx.carousel) {
			carouselCtx.carousel.options = { ...DEFAULT_OPTIONS, ...options };
		}
	});
</script>

<div
	bind:this={ref}
	data-slot="carousel-root"
	class={className}
	role="region"
	aria-roledescription="carousel"
	{...restProps}
>
	{@render children?.()}
</div>
