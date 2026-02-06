<script lang="ts">
	import { Button } from "$lib/index.js";
	import type { ButtonProps } from "$lib/components/ui/button/button.svelte";
	import { getCarouselContext } from "./context.js";
	import type { WithoutChildren } from "bits-ui";
	import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
	import type { CarouselState } from "./carousel.js";

	let {
		ref = $bindable(null),
		class: className,
		size = "icon",
		variant = "muted",
		...restProps
	}: WithoutChildren<ButtonProps> = $props();

	const carouselCtx = getCarouselContext("<Carousel.Next/>");

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
	disabled={!state?.canScrollNext}
	aria-disabled={!state?.canScrollNext}
	onclick={() => {
		carouselCtx.carousel?.scrollNext();
	}}
	{size}
	{variant}
	{...restProps}
>
	<ChevronRightIcon />
	<span class="sr-only">Next slide</span>
</Button>
