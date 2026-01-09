/**
 * Image data structure for UJL
 *
 * Used in AST for rendering. Contains only the dataUrl needed for display.
 * Composer resolves Media IDs to UJLImageData during composition.
 */
export type UJLImageData = {
	/**
	 * Base64 Data-URL for rendering
	 */
	dataUrl: string;
};

/**
 * Metadata for media library entries
 */
export type MediaMetadata = {
	filename: string;
	mimeType: string;
	filesize: number;
	width: number;
	height: number;
};

/**
 * Complete entry in the Media Library
 * Stored in UJLC document's media object
 */
export type MediaLibraryEntry = {
	dataUrl: string;
	metadata: MediaMetadata;
};
