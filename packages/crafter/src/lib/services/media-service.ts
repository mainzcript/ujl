import type { MediaMetadata, MediaLibraryEntry } from '@ujl-framework/types';

/**
 * Result of uploading media
 */
export type UploadResult = {
	mediaId: string;
	entry: MediaLibraryEntry;
};

/**
 * Result of a connection check
 */
export type ConnectionStatus = {
	connected: boolean;
	error?: string;
};

/**
 * Abstract interface for media storage services
 *
 * Two implementations:
 * - InlineMediaService: Stores Base64 in UJLC document
 * - BackendMediaService: Uses Payload CMS API
 */
export interface MediaService {
	/**
	 * Check if the service is available and properly configured
	 * @returns Connection status with error details if not connected
	 */
	checkConnection(): Promise<ConnectionStatus>;

	/**
	 * Upload a file and get back a media ID + entry
	 * @param file - The file to upload
	 * @param metadata - Metadata for the file
	 * @returns Upload result with media ID and entry
	 */
	upload(file: File, metadata: MediaMetadata): Promise<UploadResult>;

	/**
	 * Get a media entry by ID
	 * @param mediaId - The media ID
	 * @returns The media entry or null if not found
	 */
	get(mediaId: string): Promise<MediaLibraryEntry | null>;

	/**
	 * List all media entries
	 * @returns Array of media entries with IDs
	 */
	list(): Promise<Array<{ id: string; entry: MediaLibraryEntry }>>;

	/**
	 * Delete a media entry
	 * @param mediaId - The media ID to delete
	 * @returns true if deleted, false if not found
	 */
	delete(mediaId: string): Promise<boolean>;
}
