/**
 * Image Service Factory - Dependency Injection for Image Services
 *
 * This module provides a factory function for creating image services.
 * It implements the Factory Pattern for Dependency Injection, allowing
 * the Store to receive image services without knowing their implementation.
 *
 * Note: Document-level image_library configuration is ignored.
 * Only UJLCrafterOptions.imageLibrary determines the storage mode.
 *
 * @module image-service-factory
 */

// TODO: Automatische Image-Migration implementieren
// Wenn ein Dokument mit anderer image_library Konfiguration geladen wird:
// 1. Bilder vom Quell-Backend herunterladen (kein API-Key noetig fuer GET)
// 2. Bilder ins konfigurierte Backend hochladen (mit API-Key)
// 3. Referenzen im Dokument aktualisieren
// 4. meta.image_library auf aktuelle Konfiguration setzen
// Gilt fuer alle Richtungen: Backend->Backend, Inline->Backend, Backend->Inline

import type { UJLCImageLibrary, UJLCDocumentMeta } from '@ujl-framework/types';
import { BackendImageService } from '../services/backend-image-service.js';
import { InlineImageService } from '../services/inline-image-service.js';
import type { ImageService } from '../services/image-service.js';
import { logger } from '../utils/logger.js';
import { toast } from 'svelte-sonner';

// ============================================
// TYPES
// ============================================

/**
 * Image library configuration from document meta.
 */
export type ImageLibraryConfig = UJLCDocumentMeta['image_library'];

/**
 * Function type for immutable image library updates.
 */
export type UpdateImagesFn = (fn: (images: UJLCImageLibrary) => UJLCImageLibrary) => void;

/**
 * Factory function type for creating image services.
 */
export type ImageServiceFactoryFn = (
	config: ImageLibraryConfig,
	getImages: () => UJLCImageLibrary,
	updateImages: UpdateImagesFn
) => ImageService;

/**
 * Options for configuring the image service factory.
 *
 * Note: Document-level image_library configuration is ignored.
 * Only these options determine the storage mode and backend configuration.
 */
export interface ImageServiceFactoryOptions {
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
 * Creates an image service factory with the given options.
 *
 * This factory implements the Factory Pattern for Dependency Injection.
 * The Store calls this factory to create image services, allowing:
 * - Testability: Factory can be mocked in tests
 * - Extensibility: New storage types without Store changes
 * - Configurability: API keys and endpoints are passed explicitly (no env vars)
 *
 * @param options - Configuration options for the factory
 * @returns A factory function that creates image services
 *
 * @example
 * ```ts
 * // Create factory for inline storage (default)
 * const createImageService = createImageServiceFactory();
 *
 * // Create factory for backend storage
 * const createImageService = createImageServiceFactory({
 *   preferredStorage: 'backend',
 *   backendEndpoint: 'https://my-cms.example.com/api',
 *   backendApiKey: 'my-api-key',
 *   onConnectionError: (error) => console.error(error),
 *   showToasts: false
 * });
 *
 * // Use factory to create service
 * const service = createImageService(config, getImages, updateImages);
 * ```
 */
export function createImageServiceFactory(
	options: ImageServiceFactoryOptions = {}
): ImageServiceFactoryFn {
	const {
		preferredStorage,
		backendEndpoint,
		backendApiKey,
		onConnectionError,
		showToasts = true
	} = options;

	// Document-level config is ignored - only options determine storage mode
	// The config parameter is kept for API compatibility but not used
	return function createImageService(
		_config: ImageLibraryConfig,
		getImages: () => UJLCImageLibrary,
		updateImages: UpdateImagesFn
	): ImageService {
		// Storage mode is determined solely by options (default: inline)
		const storage = preferredStorage ?? 'inline';

		// Backend storage
		if (storage === 'backend') {
			// endpoint and apiKey are guaranteed by UJLCrafter validation
			if (!backendEndpoint || !backendApiKey) {
				// This should never happen if UJLCrafter validation is correct
				logger.error('Backend storage requires both endpoint and apiKey');
				return new InlineImageService(getImages, updateImages);
			}

			const service = new BackendImageService(backendEndpoint, backendApiKey);

			// Async connection check (non-blocking)
			service.checkConnection().then((status) => {
				if (!status.connected) {
					const errorMessage = status.error ?? 'Unknown error';
					logger.error('Backend Image Service is not reachable:', errorMessage);

					// Call custom error handler if provided
					if (onConnectionError) {
						onConnectionError(errorMessage, backendEndpoint);
					}

					// Show toast notification if enabled
					if (showToasts) {
						toast.error('Image Library Backend Unavailable', {
							description: `${errorMessage}\n\nPlease check:\n- Is the backend service running?\n- Is the endpoint correct? (${backendEndpoint})`
						});
					}
				}
			});

			return service;
		}

		// Inline storage (default)
		return new InlineImageService(getImages, updateImages);
	};
}

/**
 * Default image service factory with inline storage.
 * For backend storage, use createImageServiceFactory with explicit options.
 */
export const defaultImageServiceFactory = createImageServiceFactory();
