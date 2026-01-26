/**
 * Stores Module - Centralized State Management
 *
 * This module exports all store-related functionality for the Crafter.
 *
 * @module stores
 */

// Store
export {
	createCrafterStore,
	type CrafterStore,
	type CrafterContext,
	type CrafterStoreDeps,
	type CrafterMode,
	type ViewportSize,
	type ImageLibraryContext,
	type LibraryConfig,
	type UpdateImagesFn,
	type ImageServiceFactory,
	type ShadowRootContext,
	CRAFTER_CONTEXT,
	COMPOSER_CONTEXT,
	SHADOW_ROOT_CONTEXT
} from './crafter-store.svelte.js';

// Operations
export { createOperations, type CrafterOperations } from './operations.js';

// Image Service Factory
export {
	createImageServiceFactory,
	getDefaultImageServiceFactory,
	type ImageServiceFactoryFn,
	type ImageServiceFactoryOptions
} from './image-service-factory.js';
