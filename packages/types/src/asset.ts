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
 * Metadata for asset entries
 *
 * Contains the fields that only the caller can provide before upload.
 * mimeType and filesize are intentionally omitted — providers read them
 * directly from the File object or from the backend response, so
 * passing them via metadata would be redundant and error-prone.
 */
export type AssetMetadata = {
	/** Original filename */
	filename: string;
	/** Image width in pixels */
	width: number;
	/** Image height in pixels */
	height: number;
};

/**
 * Complete asset entry with URL and metadata
 *
 * Stored in UJLC document's library object (inline storage)
 * or returned from backend API calls.
 */
export type AssetEntry = {
	/** Asset URL (HTTP or Base64 Data-URL) */
	src: string;
	/** Technical metadata about the asset */
	metadata: AssetMetadata;
};
