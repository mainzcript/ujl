/**
 * Stores Module - Centralized State Management
 *
 * This module exports all store-related functionality for the Crafter.
 *
 * @module stores
 */

// Store
export {
	COMPOSER_CONTEXT,
	CRAFTER_CONTEXT,
	SHADOW_ROOT_CONTEXT,
	createCrafterStore,
	type CrafterContext,
	type CrafterMode,
	type CrafterStore,
	type CrafterStoreDeps,
	type LibraryContext,
	type SaveCallback,
	type ShadowRootContext,
	type ViewportSize,
} from "./crafter-store.svelte.js";

// Operations
export { createOperations, type CrafterOperations } from "./operations.js";

// Scroll Context for overlays
export {
	SCROLL_CONTEXT,
	createScrollContext,
	getScrollContext,
	setScrollContext,
	type ScrollContext,
	type ScrollPosition,
} from "./scroll-context.svelte.js";

// Canvas interaction context for preview-local pointer, hover, slot and nearest state
export {
	CANVAS_INTERACTION_CONTEXT,
	createCanvasInteractionContext,
	getCanvasInteractionContext,
	setCanvasInteractionContext,
	type CanvasInteractionContext,
} from "./canvas-interaction-context.svelte.ts";

// Canvas drag context for preview-local module dragging
export {
	CANVAS_DRAG_CONTEXT,
	createCanvasDragContext,
	getCanvasDragContext,
	setCanvasDragContext,
	type CanvasDragContext,
	type CanvasDragPointer,
	type CanvasDragSnapshot,
} from "./canvas-drag-context.svelte.js";
