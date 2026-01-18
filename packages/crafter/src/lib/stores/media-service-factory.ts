/**
 * Media Service Factory - Dependency Injection for Media Services
 *
 * This module provides a factory function for creating media services.
 * It implements the Factory Pattern for Dependency Injection, allowing
 * the Store to receive media services without knowing their implementation.
 *
 * Note: Document-level media_library configuration is ignored.
 * Only UJLCrafterOptions.mediaLibrary determines the storage mode.
 *
 * @module media-service-factory
 */

// TODO: Automatische Media-Migration implementieren
// Wenn ein Dokument mit anderer media_library Konfiguration geladen wird:
// 1. Medien vom Quell-Backend herunterladen (kein API-Key noetig fuer GET)
// 2. Medien ins konfigurierte Backend hochladen (mit API-Key)
// 3. Referenzen im Dokument aktualisieren
// 4. meta.media_library auf aktuelle Konfiguration setzen
// Gilt fuer alle Richtungen: Backend->Backend, Inline->Backend, Backend->Inline

import type { UJLCMediaLibrary, UJLCDocumentMeta } from '@ujl-framework/types';
import { BackendMediaService } from '../services/backend-media-service.js';
import { InlineMediaService } from '../services/inline-media-service.js';
import type { MediaService } from '../services/media-service.js';
import { logger } from '../utils/logger.js';
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
 *
 * Note: Document-level media_library configuration is ignored.
 * Only these options determine the storage mode and backend configuration.
 */
export interface MediaServiceFactoryOptions {
	/** Storage mode: 'inline' (default) or 'backend' */
	preferredStorage?: 'inline' | 'backend';
	/** Backend API endpoint (required when preferredStorage is 'backend') */
	backendEndpoint?: string;
	/** API key for backend storage (required when preferredStorage is 'backend') */
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
 * - Configurability: API keys and endpoints are passed explicitly (no env vars)
 *
 * @param options - Configuration options for the factory
 * @returns A factory function that creates media services
 *
 * @example
 * ```ts
 * // Create factory for inline storage (default)
 * const createMediaService = createMediaServiceFactory();
 *
 * // Create factory for backend storage
 * const createMediaService = createMediaServiceFactory({
 *   preferredStorage: 'backend',
 *   backendEndpoint: 'https://my-cms.example.com/api',
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
	const {
		preferredStorage,
		backendEndpoint,
		backendApiKey,
		onConnectionError,
		showToasts = true
	} = options;

	// Document-level config is ignored - only options determine storage mode
	// The config parameter is kept for API compatibility but not used
	return function createMediaService(
		_config: MediaLibraryConfig,
		getMedia: () => UJLCMediaLibrary,
		updateMedia: UpdateMediaFn
	): MediaService {
		// Storage mode is determined solely by options (default: inline)
		const storage = preferredStorage ?? 'inline';

		// Backend storage
		if (storage === 'backend') {
			// endpoint and apiKey are guaranteed by UJLCrafter validation
			if (!backendEndpoint || !backendApiKey) {
				// This should never happen if UJLCrafter validation is correct
				logger.error('Backend storage requires both endpoint and apiKey');
				return new InlineMediaService(getMedia, updateMedia);
			}

			const service = new BackendMediaService(backendEndpoint, backendApiKey);

			// Async connection check (non-blocking)
			service.checkConnection().then((status) => {
				if (!status.connected) {
					const errorMessage = status.error ?? 'Unknown error';
					logger.error('Backend Media Service is not reachable:', errorMessage);

					// Call custom error handler if provided
					if (onConnectionError) {
						onConnectionError(errorMessage, backendEndpoint);
					}

					// Show toast notification if enabled
					if (showToasts) {
						toast.error('Media Library Backend Unavailable', {
							description: `${errorMessage}\n\nPlease check:\n- Is the backend service running?\n- Is the endpoint correct? (${backendEndpoint})`
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
 * Default media service factory with inline storage.
 * For backend storage, use createMediaServiceFactory with explicit options.
 */
export const defaultMediaServiceFactory = createMediaServiceFactory();
