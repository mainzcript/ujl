/**
 * Image data structure for UJL
 *
 * Currently: Base64 Data-URLs stored directly in UJLC documents.
 * Future: Media IDs referencing Media Library entries.
 *
 * @see Migration Guide - Media Library Integration (Issue)
 */
export type UJLImageData = {
	/**
	 * Base64 Data-URL (current) or Media ID (future)
	 * @see Migration Guide - Media Library Integration (Issue)
	 */
	dataUrl: string;
};
