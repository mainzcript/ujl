import { getContext, hasContext, setContext } from 'svelte';
import type { Carousel } from './carousel.js';

const CAROUSEL_CONTEXT = Symbol('CAROUSEL_CONTEXT');

export type CarouselContext = {
	carousel: Carousel | null;
};

export function setCarouselContext(config: CarouselContext): CarouselContext {
	setContext(CAROUSEL_CONTEXT, config);
	return config;
}

export function getCarouselContext(name = 'This component') {
	if (!hasContext(CAROUSEL_CONTEXT)) {
		throw new Error(`${name} must be used within a <Carousel.Root> component`);
	}
	return getContext<ReturnType<typeof setCarouselContext>>(CAROUSEL_CONTEXT);
}
