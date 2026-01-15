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
	type MediaLibraryContext,
	type MediaLibraryConfig,
	type UpdateMediaFn,
	type MediaServiceFactory
} from './crafter-store.svelte.js';

// Operations
export { createOperations, type CrafterOperations } from './operations.js';

// Media Service Factory
export {
	createMediaServiceFactory,
	defaultMediaServiceFactory,
	type MediaServiceFactoryFn,
	type MediaServiceFactoryOptions
} from './media-service-factory.js';
