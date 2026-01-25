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
	type CrafterStoreDeps,
	type CrafterMode,
	type ViewportSize,
	type ImageLibraryContext,
	type LibraryConfig,
	type UpdateImagesFn,
	type ImageServiceFactory
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
