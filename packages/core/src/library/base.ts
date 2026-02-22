import type { AssetEntry, AssetMetadata, ImageSource, UJLCLibrary } from "@ujl-framework/types";

/**
 * Result of uploading an asset
 */
export type UploadResult = {
	assetId: string;
	entry: AssetEntry;
};

/**
 * Result of a connection check
 */
export type ConnectionStatus = {
	connected: boolean;
	error?: string;
};

/**
 * Function type for immutable library updates.
 * Used by the Crafter store to propagate changes into the document.
 */
export type UpdateLibraryFn = (fn: (library: UJLCLibrary) => UJLCLibrary) => void;

/**
 * Abstract base class for UJL library adapters
 *
 * Defines the common interface that all library adapters must implement.
 * A provider manages asset storage and retrieval for a specific backend
 * (inline Base64, Payload CMS, S3, CDN, …).
 *
 * Extend this class to build a custom adapter:
 *
 * ```typescript
 * import { LibraryBase } from "@ujl-framework/core";
 *
 * export class MyS3Adapter extends LibraryBase {
 *   readonly name = "s3";
 *   // … implement abstract methods
 * }
 * ```
 *
 * Register the adapter with the LibraryRegistry before passing it to the Composer:
 *
 * ```typescript
 * const libraryRegistry = new LibraryRegistry();
 * libraryRegistry.registerAdapter(new MyS3Adapter(...));
 * const composer = new Composer(undefined, libraryRegistry);
 * ```
 */
export abstract class LibraryBase {
	/**
	 * Unique adapter identifier.
	 * Must match `doc.ujlc.meta._library.adapter` for the Composer to auto-select this provider.
	 * Use lowercase kebab-case (e.g. `"inline"`, `"backend"`, `"s3"`).
	 */
	public abstract readonly name: string;

	/**
	 * Check if the adapter is reachable and properly configured.
	 * @returns Connection status with optional error message
	 */
	public abstract checkConnection(): Promise<ConnectionStatus>;

	/**
	 * Upload an asset file and return its ID and entry.
	 * @param file - The file to upload
	 * @param metadata - File metadata (filename, dimensions, …)
	 * @returns Upload result with generated asset ID and stored entry
	 */
	public abstract upload(file: File, metadata: AssetMetadata): Promise<UploadResult>;

	/**
	 * Retrieve an asset entry by ID.
	 * @param assetId - The asset ID
	 * @returns AssetEntry if found, null otherwise
	 */
	public abstract get(assetId: string): Promise<AssetEntry | null>;

	/**
	 * List all asset entries managed by this adapter.
	 * @returns Array of asset entries with their IDs
	 */
	public abstract list(): Promise<Array<{ id: string; entry: AssetEntry }>>;

	/**
	 * Delete an asset entry.
	 * @param assetId - The asset ID to delete
	 * @returns true if deleted, false if not found
	 */
	public abstract delete(assetId: string): Promise<boolean>;

	/**
	 * Resolve an asset ID to its source URL for AST rendering.
	 *
	 * Called by the Composer during `compose()` to turn stored IDs into
	 * displayable `ImageSource` values (HTTP URL or Base64 Data-URL).
	 *
	 * @param id - Asset ID (string or number)
	 * @returns ImageSource or null if not found
	 */
	public abstract resolve(id: string | number): Promise<ImageSource | null>;
}
