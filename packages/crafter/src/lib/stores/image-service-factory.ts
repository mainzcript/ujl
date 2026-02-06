/**
 * Image Service Factory - Dependency Injection for Image Services
 *
 * This module provides a factory function for creating image services.
 * It implements the Factory Pattern for Dependency Injection, allowing
 * the Store to receive image services without knowing their implementation.
 *
 * Note: Document-level _library configuration is ignored.
 * Only UJLCrafterOptions.library determines the storage mode.
 *
 * @module image-service-factory
 */

// TODO: Implement automatic image migration
// When a document with a different _library configuration is loaded:
// 1. Download images from source backend (no API key needed for GET)
// 2. Upload images to configured backend (with API key)
// 3. Update references in document
// 4. Set meta._library to current configuration
// Applies to all directions: Backend->Backend, Inline->Backend, Backend->Inline

import type { UJLCDocumentMeta, UJLCImageLibrary } from "@ujl-framework/types";
import { toast } from "svelte-sonner";
import { BackendImageService } from "../service-adapters/backend-image-service.js";
import type { ImageService } from "../service-adapters/image-service.js";
import { InlineImageService } from "../service-adapters/inline-image-service.js";
import { logger } from "../utils/logger.js";

// ============================================
// TYPES
// ============================================

/**
 * Library configuration from document meta.
 */
export type LibraryConfig = UJLCDocumentMeta["_library"];

/**
 * Function type for immutable image library updates.
 */
export type UpdateImagesFn = (fn: (images: UJLCImageLibrary) => UJLCImageLibrary) => void;

/**
 * Factory function type for creating image services.
 */
export type ImageServiceFactoryFn = (
	config: LibraryConfig,
	getImages: () => UJLCImageLibrary,
	updateImages: UpdateImagesFn,
) => ImageService;

/**
 * Options for configuring the image service factory.
 *
 * Note: Document-level _library configuration is ignored.
 * Only these options determine the storage mode and backend configuration.
 */
export interface ImageServiceFactoryOptions {
	/** Storage mode: 'inline' (default) or 'backend' */
	preferredStorage?: "inline" | "backend";
	/** Backend API URL (required when preferredStorage is 'backend') */
	backendUrl?: string;
	/** API key for backend storage (required when preferredStorage is 'backend') */
	backendApiKey?: string;
	/** Callback when backend connection fails */
	onConnectionError?: (error: string, url: string) => void;
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
 * - Configurability: API keys and URLs are passed explicitly (no env vars)
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
 *   backendUrl: 'https://my-cms.example.com',
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
	options: ImageServiceFactoryOptions = {},
): ImageServiceFactoryFn {
	const {
		preferredStorage,
		backendUrl,
		backendApiKey,
		onConnectionError,
		showToasts = true,
	} = options;

	// Document-level config is ignored - only options determine storage mode
	// The config parameter is kept for API compatibility but not used
	return function createImageService(
		_config: LibraryConfig,
		getImages: () => UJLCImageLibrary,
		updateImages: UpdateImagesFn,
	): ImageService {
		// Storage mode is determined solely by options (default: inline)
		const storage = preferredStorage ?? "inline";

		// Backend storage
		if (storage === "backend") {
			// url and apiKey are guaranteed by UJLCrafter validation
			if (!backendUrl || !backendApiKey) {
				// This should never happen if UJLCrafter validation is correct
				logger.error("Backend storage requires both url and apiKey");
				return new InlineImageService(getImages, updateImages);
			}

			const service = new BackendImageService(backendUrl, backendApiKey);

			// Async connection check (non-blocking)
			service.checkConnection().then((status) => {
				if (!status.connected) {
					const errorMessage = status.error ?? "Unknown error";
					logger.error("Backend Image Service is not reachable:", errorMessage);

					// Call custom error handler if provided
					if (onConnectionError) {
						onConnectionError(errorMessage, backendUrl);
					}

					// Show toast notification if enabled
					if (showToasts) {
						toast.error("Image Library Backend Unavailable", {
							description: `${errorMessage}\n\nPlease check:\n- Is the backend service running?\n- Is the URL correct? (${backendUrl})`,
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
 * Default library service factory with inline storage.
 * For backend storage, use createImageServiceFactory with explicit options.
 *
 * This is a function instead of a constant to avoid top-level side effects
 * (importing svelte-sonner at module initialization time).
 *
 * @returns A factory function configured for inline storage
 */
export function getDefaultImageServiceFactory(): ImageServiceFactoryFn {
	return createImageServiceFactory();
}
