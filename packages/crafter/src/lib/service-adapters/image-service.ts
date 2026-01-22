import type { ImageMetadata, ImageEntry, ImageSource, ImageProvider } from '@ujl-framework/types';

/**
 * Result of uploading an image
 */
export type UploadResult = {
	imageId: string;
	entry: ImageEntry;
};

/**
 * Result of a connection check
 */
export type ConnectionStatus = {
	connected: boolean;
	error?: string;
};

/**
 * Service interface for library storage and retrieval
 *
 * Extends ImageProvider to allow direct use in Composer.compose().
 *
 * Two implementations:
 * - InlineImageService: Stores Base64 in UJLC document
 * - BackendImageService: Uses Payload CMS API
 */
export interface ImageService extends ImageProvider {
	/**
	 * Check if the service is available and properly configured
	 * @returns Connection status with error details if not connected
	 */
	checkConnection(): Promise<ConnectionStatus>;

	/**
	 * Upload a file and get back an image ID + entry
	 * @param file - The file to upload
	 * @param metadata - Metadata for the file
	 * @returns Upload result with image ID and entry
	 */
	upload(file: File, metadata: ImageMetadata): Promise<UploadResult>;

	/**
	 * Get an image entry by ID
	 * @param imageId - The image ID
	 * @returns The image entry or null if not found
	 */
	get(imageId: string): Promise<ImageEntry | null>;

	/**
	 * List all image entries
	 * @returns Array of image entries with IDs
	 */
	list(): Promise<Array<{ id: string; entry: ImageEntry }>>;

	/**
	 * Delete an image entry
	 * @param imageId - The image ID to delete
	 * @returns true if deleted, false if not found
	 */
	delete(imageId: string): Promise<boolean>;

	/**
	 * Resolve an image ID to its source URL
	 * Inherited from ImageProvider - enables direct use in Composer.compose()
	 * @param id - Image ID (string for inline, number for backend)
	 * @returns Image source or null if not found
	 */
	resolve(id: string | number): Promise<ImageSource | null>;
}
