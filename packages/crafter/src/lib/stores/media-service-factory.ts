/**
 * Media Service Factory - Dependency Injection for Media Services
 *
 * This module provides a factory function for creating media services.
 * It implements the Factory Pattern for Dependency Injection, allowing
 * the Store to receive media services without knowing their implementation.
 *
 * @module media-service-factory
 */

import type { UJLCMediaLibrary, UJLCDocumentMeta } from '@ujl-framework/types';
import { BackendMediaService } from '$lib/services/backend-media-service.js';
import { InlineMediaService } from '$lib/services/inline-media-service.js';
import type { MediaService } from '$lib/services/media-service.js';
import { logger } from '$lib/utils/logger.js';
import { toast } from 'svelte-sonner';

// ============================================
// TYPES
// ============================================

/**
 * Media library configuration from document meta.
 */
export type MediaLibraryConfig = UJLCDocumentMeta['media_library'];

/**
 * Function type for immutable media library updates.
 */
export type UpdateMediaFn = (fn: (media: UJLCMediaLibrary) => UJLCMediaLibrary) => void;

/**
 * Factory function type for creating media services.
 */
export type MediaServiceFactoryFn = (
	config: MediaLibraryConfig,
	getMedia: () => UJLCMediaLibrary,
	updateMedia: UpdateMediaFn
) => MediaService;

/**
 * Options for configuring the media service factory.
 */
export interface MediaServiceFactoryOptions {
	/** API key for backend storage (overrides environment variable) */
	backendApiKey?: string;
	/** Callback when backend connection fails */
	onConnectionError?: (error: string, endpoint: string) => void;
	/** Whether to show toast notifications on errors */
	showToasts?: boolean;
}

// ============================================
// FACTORY
// ============================================

/**
 * Creates a media service factory with the given options.
 *
 * This factory implements the Factory Pattern for Dependency Injection.
 * The Store calls this factory to create media services, allowing:
 * - Testability: Factory can be mocked in tests
 * - Extensibility: New storage types without Store changes
 * - Configurability: API keys can be injected externally
 *
 * @param options - Configuration options for the factory
 * @returns A factory function that creates media services
 *
 * @example
 * ```ts
 * // Create factory with default options
 * const createMediaService = createMediaServiceFactory();
 *
 * // Create factory with custom options
 * const createMediaService = createMediaServiceFactory({
 *   backendApiKey: 'my-api-key',
 *   onConnectionError: (error) => console.error(error),
 *   showToasts: false
 * });
 *
 * // Use factory to create service
 * const service = createMediaService(config, getMedia, updateMedia);
 * ```
 */
export function createMediaServiceFactory(
	options: MediaServiceFactoryOptions = {}
): MediaServiceFactoryFn {
	const { backendApiKey, onConnectionError, showToasts = true } = options;

	return function createMediaService(
		config: MediaLibraryConfig,
		getMedia: () => UJLCMediaLibrary,
		updateMedia: UpdateMediaFn
	): MediaService {
		// Backend storage
		if (config.storage === 'backend') {
			const apiKey = backendApiKey ?? import.meta.env.PUBLIC_MEDIA_API_KEY;

			if (!apiKey) {
				logger.warn(
					'PUBLIC_MEDIA_API_KEY not found in environment. Backend media service may not work properly.'
				);
			}

			const service = new BackendMediaService(config.endpoint, apiKey);

			// Async connection check (non-blocking)
			service.checkConnection().then((status) => {
				if (!status.connected) {
					const errorMessage = status.error ?? 'Unknown error';
					logger.error('Backend Media Service is not reachable:', errorMessage);

					// Call custom error handler if provided
					if (onConnectionError) {
						onConnectionError(errorMessage, config.endpoint);
					}

					// Show toast notification if enabled
					if (showToasts) {
						toast.error('Media Library Backend Unavailable', {
							description: `${errorMessage}\n\nPlease check:\n- Is the backend service running?\n- Is the endpoint correct? (${config.endpoint})\n- Is the API key configured in .env.local?`
						});
					}
				}
			});

			return service;
		}

		// Inline storage (default)
		return new InlineMediaService(getMedia, updateMedia);
	};
}

/**
 * Default media service factory with standard options.
 * Uses environment variable for API key and shows toasts on errors.
 */
export const defaultMediaServiceFactory = createMediaServiceFactory();
