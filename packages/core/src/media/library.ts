import type { MediaLibraryEntry, MediaMetadata, UJLImageData } from "@ujl-framework/types";
import { nanoid } from "nanoid";

/**
 * Interface for resolving media IDs to data URLs
 * Allows MediaLibrary to work with both inline and backend storage
 */
export interface MediaResolver {
	/**
	 * Resolve a media ID to a data URL
	 * @param id - The media ID to resolve
	 * @returns Promise resolving to the data URL, or null if not found
	 */
	resolve(id: string): Promise<string | null>;
}

/**
 * Media Library for managing media entries in UJLC documents
 *
 * Provides CRUD operations for media entries with automatic ID generation.
 * Media entries are stored in the UJLC document's media object (inline storage)
 * or resolved via a MediaResolver (backend storage).
 */
export class MediaLibrary {
	private media: Record<string, MediaLibraryEntry>;
	private resolver?: MediaResolver;

	/**
	 * Create a new MediaLibrary instance
	 * @param initialMedia - Initial media entries (from UJLC document)
	 * @param resolver - Optional resolver for backend storage
	 */
	constructor(initialMedia: Record<string, MediaLibraryEntry> = {}, resolver?: MediaResolver) {
		this.media = initialMedia;
		this.resolver = resolver;
	}

	/**
	 * Add a new media entry to the library
	 * @param data - Image data containing the dataUrl
	 * @param metadata - Metadata about the media file
	 * @returns Generated media ID
	 */
	public add(data: UJLImageData, metadata: MediaMetadata): string {
		const id = nanoid();
		this.media[id] = {
			dataUrl: data.dataUrl,
			metadata,
		};
		return id;
	}

	/**
	 * Get a media entry by ID
	 * @param id - The media ID to look up
	 * @returns The media entry or null if not found
	 */
	public get(id: string): MediaLibraryEntry | null {
		return this.media[id] ?? null;
	}

	/**
	 * List all media entries in the library
	 * @returns Array of all media entries with their IDs
	 */
	public list(): Array<{ id: string; entry: MediaLibraryEntry }> {
		return Object.entries(this.media).map(([id, entry]) => ({ id, entry }));
	}

	/**
	 * Remove a media entry from the library
	 * @param id - The media ID to remove
	 * @returns true if the entry was removed, false if it didn't exist
	 */
	public remove(id: string): boolean {
		if (id in this.media) {
			delete this.media[id];
			return true;
		}
		return false;
	}

	/**
	 * Resolve a media ID to UJLImageData for AST composition
	 * @param id - The media ID to resolve (can be string or number)
	 * @returns Promise resolving to UJLImageData with dataUrl, or null if not found
	 */
	public async resolve(id: string | number): Promise<UJLImageData | null> {
		const mediaId = String(id);

		// First try inline storage
		const entry = this.get(mediaId);
		if (entry) {
			return {
				dataUrl: entry.dataUrl,
			};
		}

		// If not found in inline storage and resolver is available, try backend
		if (this.resolver) {
			const dataUrl = await this.resolver.resolve(mediaId);
			if (dataUrl) {
				return { dataUrl };
			}
		}

		return null;
	}

	/**
	 * Get the raw media object (for serialization back to UJLC)
	 * @returns The media entries record
	 */
	public toObject(): Record<string, MediaLibraryEntry> {
		return { ...this.media };
	}
}
