import { MediaQuery } from 'svelte/reactivity';

/**
 * Default mobile breakpoint in pixels.
 * Matches Tailwind's default `md` breakpoint.
 */
const DEFAULT_MOBILE_BREAKPOINT = 768;

/**
 * Reactive media query class for detecting mobile viewport sizes.
 * Extends Svelte's MediaQuery to provide a convenient way to check if the viewport is mobile.
 *
 * @example
 * ```ts
 * const isMobile = new IsMobile();
 * // Use isMobile.current to get the current state
 * ```
 */
export class IsMobile extends MediaQuery {
	/**
	 * Creates a new IsMobile instance.
	 *
	 * @param breakpoint - The breakpoint in pixels (default: 768px)
	 */
	constructor(breakpoint: number = DEFAULT_MOBILE_BREAKPOINT) {
		super(`max-width: ${breakpoint - 1}px`);
	}
}
