import { getContext, setContext } from "svelte";
import { SvelteSet } from "svelte/reactivity";

export const SCROLL_CONTEXT = Symbol("scroll-context");

export interface ScrollPosition {
	x: number;
	y: number;
}

export interface ScrollContext {
	/** Current scroll position */
	readonly position: ScrollPosition;
	/** Register a callback to be called when scroll position changes */
	register(callback: () => void): () => void;
	/** Update the scroll position (called by Preview.svelte) */
	updatePosition(x: number, y: number): void;
}

export function createScrollContext(): ScrollContext {
	let position = $state<ScrollPosition>({ x: 0, y: 0 });
	const callbacks = new SvelteSet<() => void>();
	let ticking = false;

	function notify() {
		if (!ticking) {
			requestAnimationFrame(() => {
				callbacks.forEach((cb) => cb());
				ticking = false;
			});
			ticking = true;
		}
	}

	return {
		get position() {
			return position;
		},
		register(callback: () => void) {
			callbacks.add(callback);
			return () => {
				callbacks.delete(callback);
			};
		},
		updatePosition(x: number, y: number) {
			position = { x, y };
			notify();
		},
	};
}

export function getScrollContext(): ScrollContext {
	const context = getContext<ScrollContext>(SCROLL_CONTEXT);
	if (!context) {
		throw new Error(
			"ScrollContext not found. Make sure to call setScrollContext() in a parent component.",
		);
	}
	return context;
}

export function setScrollContext(context: ScrollContext) {
	setContext(SCROLL_CONTEXT, context);
}
