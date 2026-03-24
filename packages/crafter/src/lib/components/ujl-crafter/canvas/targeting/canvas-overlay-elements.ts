export const CANVAS_OVERLAY_SELECTOR = [
	'[data-crafter="module-action-bar"]',
	'[data-crafter="placement-target-button"]',
	'[data-crafter="slot-placeholder-target"]',
	'[data-crafter="overlay-base"]',
	'[data-crafter="module-placement-targets"]',
].join(", ");

export function isCanvasOverlayElement(element: HTMLElement | null): boolean {
	return !!element?.closest(CANVAS_OVERLAY_SELECTOR);
}
