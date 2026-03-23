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

// Hover Target Context for preview-local hover state
export {
	HOVER_TARGET_CONTEXT,
	createHoverTargetContext,
	getHoverTargetContext,
	setHoverTargetContext,
	type HoverTargetContext,
} from "./hover-target-context.svelte.ts";
