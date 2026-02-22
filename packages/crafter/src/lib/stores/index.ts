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
