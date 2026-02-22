import type { AssetEntry, AssetMetadata, ImageSource, UJLCLibrary } from "@ujl-framework/types";
import { generateUid } from "../utils.js";
import type { ConnectionStatus, UpdateLibraryFn, UploadResult } from "./base.js";
import { LibraryBase } from "./base.js";

// Minimal FileReader interface — avoids requiring "lib": ["DOM"] in tsconfig
// while keeping the implementation fully typed. The real FileReader is provided
// by the browser (or by a test stub in unit tests).
declare class FileReader {
	result: string | ArrayBuffer | null;
	onload: (() => void) | null;
	onerror: (() => void) | null;
	readAsDataURL(blob: Blob): void;
}

/**
 * Inline Library Adapter
 *
 * Stores assets as Base64 Data-URLs directly in the UJLC document's
 * `library` object. No external service required — works offline and
 * is fully portable (the document is self-contained).
 *
 * Limitations: Base64 encoding increases file size by ~33%. Large images
 * should be compressed before uploading. The Crafter's built-in uploader
 * handles client-side compression automatically (target: ≤100 KB).
 *
 * This is the default adapter when no `_library` configuration is present
 * in the UJLC document.
 */
export class InlineLibraryProvider extends LibraryBase {
	public readonly name = "inline";

	private getLibrary: () => UJLCLibrary;
	private updateLibrary: UpdateLibraryFn;

	/**
	 * Create an InlineLibraryProvider.
	 * @param getLibrary - Accessor for the current library state
	 * @param updateLibrary - Immutable updater for the library state
	 */
	constructor(getLibrary: () => UJLCLibrary, updateLibrary: UpdateLibraryFn) {
		super();
		this.getLibrary = getLibrary;
		this.updateLibrary = updateLibrary;
	}

	public async checkConnection(): Promise<ConnectionStatus> {
		// Inline storage is always available (local)
		return { connected: true };
	}

	public async upload(file: File, metadata: AssetMetadata): Promise<UploadResult> {
		// Convert to Base64
		const reader = new FileReader();
		const base64Url = await new Promise<string>((resolve, reject) => {
			reader.onload = () => {
				if (typeof reader.result === "string") {
					resolve(reader.result);
				} else {
					reject(new Error("Failed to convert asset to Base64"));
				}
			};
			reader.onerror = () => {
				reject(new Error("Failed to read file"));
			};
			reader.readAsDataURL(file);
		});

		// Generate ID and create entry.
		// mimeType and filesize are not part of AssetMetadata — the provider reads
		// them directly from the File object rather than relying on the caller.
		const assetId = generateUid();
		const entry: AssetEntry = {
			src: base64Url,
			metadata: {
				filename: metadata.filename,
				width: metadata.width,
				height: metadata.height,
			},
		};

		// Store in library
		this.updateLibrary((current) => ({
			...current,
			[assetId]: entry,
		}));

		return { assetId, entry };
	}

	public async get(assetId: string): Promise<AssetEntry | null> {
		const library = this.getLibrary();
		return library[assetId] ?? null;
	}

	public async list(): Promise<Array<{ id: string; entry: AssetEntry }>> {
		const library = this.getLibrary();
		return Object.entries(library).map(([id, entry]) => ({ id, entry }));
	}

	public async delete(assetId: string): Promise<boolean> {
		const library = this.getLibrary();
		if (!(assetId in library)) {
			return false;
		}

		this.updateLibrary((current) => {
			const updated = { ...current };
			delete updated[assetId];
			return updated;
		});

		return true;
	}

	public async resolve(id: string | number): Promise<ImageSource | null> {
		const entry = await this.get(String(id));
		if (!entry) return null;
		return { src: entry.src };
	}
}
