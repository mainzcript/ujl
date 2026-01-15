/**
 * UJL Crafter - Visual Editor Component
 *
 * This module exports the main Crafter component and its context API.
 *
 * @module ujl-crafter
 */

// Main component
export { default as UJLCrafter } from './ujl-crafter.svelte';

// Context API
export {
	CRAFTER_CONTEXT,
	COMPOSER_CONTEXT,
	isCrafterContext,
	getCrafterContext,
	type CrafterContext,
	type CrafterMode,
	type ViewportSize,
	type MediaLibraryContext,
	type CrafterOperations
} from './context.js';

// Types (re-exported for convenience)
export * from './types.js';
