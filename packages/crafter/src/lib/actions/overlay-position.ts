/**
 * Svelte action for tracking element position relative to a scroll container.
 *
 * This action automatically updates the position, size, and visibility of an overlay
 * element based on a target module's position within a scroll container.
 *
 * @example
 * ```svelte
 * <div use:overlayPositioning={{
 *   containerElement: scrollContainer,
 *   getModuleId: () => moduleId,
 *   padding: 4,
 *   onVisibilityChange: (visible) => isVisible = visible
 * }}
 * >
 * ```
 */

import type { ActionReturn } from "svelte/action";

interface OverlayPositionParams {
	/** The scroll container element */
	containerElement: HTMLElement;
	/** Function that returns the current module ID to track */
	getModuleId: () => string | null;
	/** Padding around the module in pixels */
	padding?: number;
	/** Callback when visibility changes */
	onVisibilityChange?: (isVisible: boolean) => void;
	/** Callback when position updates - called immediately on changes and during scroll */
	onPositionUpdate?: (rect: { top: number; left: number; width: number; height: number }) => void;
}

export function overlayPositioning(
	node: HTMLElement,
	params: OverlayPositionParams,
): ActionReturn<OverlayPositionParams> {
	let { containerElement, getModuleId, padding = 0, onVisibilityChange, onPositionUpdate } = params;

	function updatePosition() {
		const moduleId = getModuleId();

		if (!moduleId) {
			onVisibilityChange?.(false);
			return;
		}

		const moduleEl = containerElement.querySelector(
			`[data-ujl-module-id="${moduleId}"]`,
		) as HTMLElement | null;

		if (!moduleEl) {
			onVisibilityChange?.(false);
			return;
		}

		const moduleRect = moduleEl.getBoundingClientRect();
		const containerRect = containerElement.getBoundingClientRect();

		// Check if module is visible in container viewport
		const isModuleVisible =
			moduleRect.top < containerRect.bottom &&
			moduleRect.bottom > containerRect.top &&
			moduleRect.left < containerRect.right &&
			moduleRect.right > containerRect.left;

		if (!isModuleVisible) {
			onVisibilityChange?.(false);
			return;
		}

		// Calculate position with padding
		const targetTop = moduleRect.top - containerRect.top + containerElement.scrollTop - padding / 2;
		const targetLeft =
			moduleRect.left - containerRect.left + containerElement.scrollLeft - padding / 2;
		const targetWidth = moduleRect.width + padding;
		const targetHeight = moduleRect.height + padding;

		// Apply styles
		node.style.transform = `translate(${targetLeft}px, ${targetTop}px)`;
		node.style.width = `${targetWidth}px`;
		node.style.height = `${targetHeight}px`;

		onVisibilityChange?.(true);
		onPositionUpdate?.({
			top: targetTop,
			left: targetLeft,
			width: targetWidth,
			height: targetHeight,
		});
	}

	function setupTracking() {
		let ticking = false;
		function onScroll() {
			if (!ticking) {
				requestAnimationFrame(() => {
					updatePosition();
					ticking = false;
				});
				ticking = true;
			}
		}

		// Initial position
		updatePosition();

		// Add scroll listener
		containerElement.addEventListener("scroll", onScroll, { passive: true });

		// Periodic fallback
		const interval = setInterval(updatePosition, 500);

		// Handle resize
		const resizeObserver = new ResizeObserver(updatePosition);
		resizeObserver.observe(containerElement);

		return () => {
			containerElement.removeEventListener("scroll", onScroll);
			clearInterval(interval);
			resizeObserver.disconnect();
		};
	}

	let cleanup = setupTracking();

	return {
		update(newParams: OverlayPositionParams) {
			cleanup();
			containerElement = newParams.containerElement;
			getModuleId = newParams.getModuleId;
			padding = newParams.padding ?? 0;
			onVisibilityChange = newParams.onVisibilityChange;
			onPositionUpdate = newParams.onPositionUpdate;
			cleanup = setupTracking();
		},
		destroy() {
			cleanup();
		},
	};
}
