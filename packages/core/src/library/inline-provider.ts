import type {
	ImageMetadata,
	LibraryAsset,
	LibraryAssetImage,
	LibraryListResult,
	LibraryUploadOptions,
} from "@ujl-framework/types";
import { LibraryError } from "@ujl-framework/types";

/**
 * Inline Library Provider
 *
 * Processes assets for inline storage in the document.
 * No external service needed - assets are embedded as Base64.
 *
 * Note: Base64 increases file size by ~33%.
 * The Crafter automatically compresses (target: ≤100 KB).
 *
 * This is a stateless provider - it only processes data and returns results.
 * The Crafter/Store manages all document storage.
 */
export class InlineLibraryProvider {
	readonly name = "inline";

	/**
	 * List assets from a library
	 * @param library - The library record to list from
	 * @param options - Pagination and search options
	 * @returns Paginated list result
	 */
	async list(
		library: Record<string, LibraryAsset>,
		options?: {
			limit?: number;
			cursor?: string;
			search?: string;
		},
	): Promise<LibraryListResult> {
		let items = Object.entries(library).map(([id, asset]) => ({ id, ...asset }));

		// Simple search filter if search is provided
		if (options?.search) {
			const searchLower = options.search.toLowerCase();
			items = items.filter(
				(item) =>
					(item.meta?.filename?.toLowerCase().includes(searchLower) ?? false) ||
					(item.meta?.caption?.toLowerCase().includes(searchLower) ?? false) ||
					(item.meta?.alt?.toLowerCase().includes(searchLower) ?? false),
			);
		}

		// Simple offset pagination
		const start = options?.cursor ? parseInt(options.cursor, 10) : 0;
		const limit = options?.limit ?? 50;

		const paginatedItems = items.slice(start, start + limit);
		const hasMore = start + limit < items.length;
		const nextCursor = hasMore ? String(start + paginatedItems.length) : undefined;

		return { items: paginatedItems, hasMore, nextCursor };
	}

	/**
	 * Get a single asset from library
	 * @param library - The library record to read from
	 * @param id - Asset ID
	 * @returns Asset or null if not found
	 */
	async get(library: Record<string, LibraryAsset>, id: string): Promise<LibraryAsset | null> {
		return library[id] ?? null;
	}

	/**
	 * Process and upload an asset
	 * Converts to Base64 and extracts metadata.
	 * Does NOT store to document - Crafter/Store handles storage.
	 * @param data - Raw file data
	 * @param options - Upload options
	 * @returns Processed asset (without ID)
	 */
	async upload(data: ArrayBuffer, options: LibraryUploadOptions): Promise<LibraryAsset> {
		// Base64 conversion
		const base64 = this.arrayBufferToBase64(data, options.type);

		// Get dimensions (always 0,0 in Node.js/test environment without DOM)
		const { width, height } = await this.getImageDimensions(base64);

		// Create new LibraryAssetImage format
		const asset: LibraryAssetImage = {
			kind: "image",
			img: {
				src: base64,
				width,
				height,
			},
			meta: {
				filename: options.filename,
				fileSize: data.byteLength,
				uploadedAt: new Date().toISOString(),
			},
		};

		// NO STORAGE HERE - Crafter/Store handles document updates
		return asset;
	}

	/**
	 * Update asset metadata
	 * @param library - The library record to read from
	 * @param id - Asset ID
	 * @param metadata - Metadata to update
	 * @returns Updated asset
	 * @throws LibraryError if asset not found
	 */
	async updateMetadata(
		library: Record<string, LibraryAsset>,
		id: string,
		metadata: Partial<ImageMetadata>,
	): Promise<LibraryAsset> {
		const current = library[id];

		if (!current) {
			throw new LibraryError("Asset not found", "NOT_FOUND");
		}

		const updated: LibraryAsset = {
			...current,
			meta: { ...current.meta, ...metadata },
		};

		return updated;
	}

	// Helper methods

	private arrayBufferToBase64(buffer: ArrayBuffer, type: string): string {
		const bytes = new Uint8Array(buffer);
		let binary = "";
		for (let i = 0; i < bytes.length; i += 1024) {
			binary += String.fromCharCode(...bytes.slice(i, i + 1024));
		}
		return `data:${type};base64,${btoa(binary)}`;
	}

	private async getImageDimensions(url: string): Promise<{ width: number; height: number }> {
		// In Node.js/test environment without DOM: return default dimensions
		// Check for browser globals safely using globalThis
		// We cast globalThis to access optional browser globals
		const globalWithWindow = globalThis as typeof globalThis & {
			window?: {
				Image?: new () => {
					naturalWidth: number;
					naturalHeight: number;
					onload: (() => void) | null;
					onerror: (() => void) | null;
					src: string;
				};
			};
		};

		if (!globalWithWindow.window?.Image) {
			return { width: 0, height: 0 };
		}

		// Browser environment: load image to get natural dimensions
		const img = new globalWithWindow.window.Image();

		return new Promise((resolve) => {
			img.onload = () => {
				resolve({ width: img.naturalWidth, height: img.naturalHeight });
			};
			img.onerror = () => {
				// Fallback to zero on error to maintain backward compatibility
				resolve({ width: 0, height: 0 });
			};
			img.src = url;
		});
	}
}
