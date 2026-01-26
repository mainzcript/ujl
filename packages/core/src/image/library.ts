import type { ImageEntry, ImageMetadata, ImageProvider, ImageSource } from "@ujl-framework/types";
import { nanoid } from "nanoid";

/**
 * Image Library for managing inline image entries during composition
 *
 * Provides CRUD operations for image entries with automatic ID generation.
 * Image entries are stored in the UJLC document's images object (inline storage)
 * or resolved via an ImageProvider (backend storage).
 */
export class ImageLibrary {
	private images: Record<string, ImageEntry>;
	private provider?: ImageProvider;

	/**
	 * Create a new ImageLibrary instance
	 * @param initialImages - Initial image entries (from UJLC document)
	 * @param provider - Optional provider for backend storage resolution
	 */
	constructor(initialImages: Record<string, ImageEntry> = {}, provider?: ImageProvider) {
		this.images = initialImages;
		this.provider = provider;
	}

	/**
	 * Add a new image entry to the library
	 * @param data - Image source containing the src URL
	 * @param metadata - Metadata about the image file
	 * @returns Generated image ID
	 */
	public add(data: ImageSource, metadata: ImageMetadata): string {
		const id = nanoid();
		this.images[id] = {
			src: data.src,
			metadata,
		};
		return id;
	}

	/**
	 * Get an image entry by ID
	 * @param id - The image ID to look up
	 * @returns The image entry or null if not found
	 */
	public get(id: string): ImageEntry | null {
		return this.images[id] ?? null;
	}

	/**
	 * List all image entries in the library
	 * @returns Array of all image entries with their IDs
	 */
	public list(): Array<{ id: string; entry: ImageEntry }> {
		return Object.entries(this.images).map(([id, entry]) => ({ id, entry }));
	}

	/**
	 * Remove an image entry from the library
	 * @param id - The image ID to remove
	 * @returns true if the entry was removed, false if it didn't exist
	 */
	public remove(id: string): boolean {
		if (id in this.images) {
			delete this.images[id];
			return true;
		}
		return false;
	}

	/**
	 * Resolve an image ID to ImageSource for AST composition
	 * @param id - The image ID to resolve (can be string or number)
	 * @returns Promise resolving to ImageSource, or null if not found
	 */
	public async resolve(id: string | number): Promise<ImageSource | null> {
		const imageId = String(id);

		// First try inline storage
		const entry = this.get(imageId);
		if (entry) {
			return { src: entry.src };
		}

		// If not found in inline storage and provider is available, try backend
		if (this.provider) {
			return this.provider.resolve(imageId);
		}

		return null;
	}

	/**
	 * Get the raw images object (for serialization back to UJLC)
	 * @returns The image entries record
	 */
	public toObject(): Record<string, ImageEntry> {
		return { ...this.images };
	}
}
