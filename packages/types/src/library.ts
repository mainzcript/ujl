/**
 * LibraryAsset model that cleanly represents HTML <picture>/<source>/<img> semantics
 * while staying extensible for other asset kinds (video, 3D, ...) in the future.
 *
 * Goals:
 * - Model browser selection axes: type + media + srcset candidates (+ sizes for w-descriptors)
 * - Keep a required fallback (like <img src="...">)
 * - Provide structured, portable metadata + per-asset specialization
 * - Allow provider/pipeline extensions without destroying type-safety
 */

/* ---------------------------------- */
/* Metadata Types */
/* ---------------------------------- */

export interface AssetCredits {
	/** Author or photographer name */
	author?: string;
	/** Source or organization */
	source?: string;
	/** License identifier (SPDX id or human-readable label) */
	license?: string;
	/** URL to license text */
	licenseUrl?: string;
}

export interface ImageMetadata {
	/** Alternative text for accessibility */
	alt?: string;
	/** Caption or title */
	caption?: string;
	/** Credit information */
	credits?: AssetCredits;
	/** Original filename */
	filename?: string;
	/** File size in bytes */
	fileSize?: number;
	/** Upload timestamp (ISO 8601 string) */
	uploadedAt?: string;
	/** Intrinsic image width */
	width?: number;
	/** Intrinsic image height */
	height?: number;
	/**
	 * Optional focal point for responsive cropping / art direction.
	 * Normalized [0..1] coordinates in image space.
	 */
	focalPoint?: { x: number; y: number };
	/** Optional blur placeholder (tiny base64 data URL) */
	blurDataURL?: string;
	/** Optional dominant color for placeholders */
	dominantColor?: string;
	/**
	 * Provider / pipeline specific extras.
	 * Prefer namespacing keys (e.g. "cloudinary:*", "bynder:*") to avoid collisions.
	 */
	extensions?: Record<string, unknown>;
	/**
	 * Allow additional custom metadata fields.
	 * Required for Zod passthrough compatibility.
	 */
	[key: string]: unknown;
}

/* ---------------------------------- */
/* Image Asset Types */
/* ---------------------------------- */

export type ImageMime =
	| "image/avif"
	| "image/webp"
	| "image/jpeg"
	| "image/png"
	| "image/gif"
	| "image/svg+xml";

/** Either width-descriptors (w) with optional sizes, or density-descriptors (x) */
export type ImageSrcSetObject =
	| { kind: "w"; candidates: Array<{ url: string; w: number }>; sizes?: string }
	| { kind: "x"; candidates: Array<{ url: string; x: number }> };

/** Srcset can be a simple string or structured object */
export type ImageSrcSet = string | ImageSrcSetObject;

export interface PictureSource {
	srcset: ImageSrcSet;
	type?: string;
	media?: string;
}

export interface LibraryAssetImage {
	kind: "image";
	meta?: ImageMetadata;
	img: {
		src: string;
		width?: number;
		height?: number;
		srcset?: ImageSrcSet;
	};
	sources?: PictureSource[];
	/**
	 * Allow additional custom fields.
	 * Required for Zod passthrough compatibility.
	 */
	[key: string]: unknown;
}

/** For now, LibraryAsset is just the image type (union later for video/3d) */
export type LibraryAsset = LibraryAssetImage;

/* ---------------------------------- */
/* Provider Interface */
/* ---------------------------------- */

/**
 * Result of a list query with pagination
 */
export interface LibraryListResult {
	/** Array of asset entries with IDs */
	items: Array<{ id: string } & LibraryAsset>;
	/** Are there more assets? */
	hasMore: boolean;
	/** Cursor for the next page (optional) */
	nextCursor?: string;
}

/**
 * Upload options
 */
export interface LibraryUploadOptions {
	/** Filename */
	filename: string;
	/** MIME-Type */
	type: string;
}

/**
 * Library Provider Interface
 *
 * Convention over configuration - simple interface for all providers.
 * Optional methods (upload, delete, updateMetadata, init) enable
 * read-only providers without upload UI.
 */
export interface LibraryProvider {
	/** Provider name (e.g. "inline", "s3", "dam") */
	readonly name: string;

	/** Optional: Initialization (e.g. open IndexedDB) */
	init?(): Promise<void>;

	/**
	 * List assets with pagination
	 * @param library - The library record to read from
	 * @param options - limit, cursor, search
	 * @returns Paginated result
	 */
	list(
		library: Record<string, LibraryAsset>,
		options?: { limit?: number; cursor?: string; search?: string },
	): Promise<LibraryListResult>;

	/**
	 * Get a single asset
	 * @param library - The library record to read from
	 * @param id - Asset ID
	 * @returns Asset or null if not found
	 */
	get(library: Record<string, LibraryAsset>, id: string): Promise<LibraryAsset | null>;

	/**
	 * Optional: Update metadata
	 * For later alt-text/caption entry
	 * @param library - The library record to update
	 * @param id - Asset ID
	 * @param metadata - Metadata to update
	 * @returns Updated asset
	 */
	updateMetadata?(
		library: Record<string, LibraryAsset>,
		id: string,
		metadata: Record<string, unknown>,
	): Promise<LibraryAsset>;

	/**
	 * Optional: Upload asset
	 * If not present, Crafter shows no upload button
	 * Returns the processed asset without ID - Crafter generates and manages the ID
	 * @param data - Raw file data
	 * @param options - Upload options
	 * @returns Processed asset (Crafter stores and manages the ID)
	 */
	upload?(data: ArrayBuffer, options: LibraryUploadOptions): Promise<LibraryAsset>;

	/**
	 * Optional: Delete asset
	 * If not present, Crafter shows no delete button
	 * Called by Crafter before removing from document library
	 * @param id - Asset ID
	 */
	delete?(id: string): Promise<void>;
}

/**
 * Library-specific errors
 */
export class LibraryError extends Error {
	constructor(
		message: string,
		public readonly code:
			| "UPLOAD_FAILED"
			| "DELETE_FAILED"
			| "NOT_FOUND"
			| "NOT_SUPPORTED"
			| "NETWORK_ERROR",
	) {
		super(message);
		this.name = "LibraryError";
	}
}
