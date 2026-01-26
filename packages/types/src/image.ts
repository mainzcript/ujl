/**
 * Image source for AST rendering
 *
 * Contains the URL needed for display. Can be either:
 * - HTTP URL (from backend storage like Payload CMS)
 * - Base64 Data-URL (from inline storage in UJLC document)
 */
export type ImageSource = {
	/** Image URL (HTTP or Base64 Data-URL) */
	src: string;
};

/**
 * Metadata for image entries
 *
 * Contains technical information about the image file.
 */
export type ImageMetadata = {
	/** Original filename */
	filename: string;
	/** MIME type (e.g., "image/png", "image/jpeg") */
	mimeType: string;
	/** File size in bytes */
	filesize: number;
	/** Image width in pixels */
	width: number;
	/** Image height in pixels */
	height: number;
};

/**
 * Complete image entry with URL and metadata
 *
 * Stored in UJLC document's images object (inline storage)
 * or returned from backend API calls.
 */
export type ImageEntry = {
	/** Image URL (HTTP or Base64 Data-URL) */
	src: string;
	/** Technical metadata about the image */
	metadata: ImageMetadata;
};

/**
 * Provider interface for resolving image IDs to sources
 *
 * Implemented by ImageService in crafter for use in Composer.
 * Allows the Composer to resolve image references during AST composition
 * without knowing the storage implementation details.
 */
export interface ImageProvider {
	/**
	 * Resolve an image ID to its source URL
	 * @param id - Image ID (string for inline, number for backend)
	 * @returns Image source or null if not found
	 */
	resolve(id: string | number): Promise<ImageSource | null>;
}
