import type { AssetEntry, AssetMetadata, ImageSource } from "@ujl-framework/types";
import type { ConnectionStatus, UploadResult } from "./base.js";
import { LibraryBase } from "./base.js";

/**
 * Payload CMS image document shape (IPTC-oriented data model).
 *
 * Image sizes follow Tailwind CSS breakpoint naming:
 * xs (320), sm (640), md (768), lg (1024), xl (1280), xxl (1536), xxxl (1920), max (2560)
 */
type PayloadImageDoc = {
	id: string;
	filename: string;
	mimeType: string;
	filesize: number;
	width: number;
	height: number;
	sizes?: {
		xs?: { url: string; width: number; height: number };
		sm?: { url: string; width: number; height: number };
		md?: { url: string; width: number; height: number };
		lg?: { url: string; width: number; height: number };
		xl?: { url: string; width: number; height: number };
		xxl?: { url: string; width: number; height: number };
		xxxl?: { url: string; width: number; height: number };
		max?: { url: string; width: number; height: number };
	};
	url: string;
	alt?: string;
	createdAt: string;
	updatedAt: string;
};

type PayloadListResponse = {
	docs: PayloadImageDoc[];
	totalDocs: number;
	limit: number;
	totalPages: number;
	page: number;
	pagingCounter: number;
	hasPrevPage: boolean;
	hasNextPage: boolean;
	prevPage: number | null;
	nextPage: number | null;
};

/**
 * Runtime validation for PayloadImageDoc.
 * Returns the doc if valid, null otherwise.
 */
function validatePayloadImageDoc(data: unknown): PayloadImageDoc | null {
	if (!data || typeof data !== "object") return null;
	const doc = data as Record<string, unknown>;
	if (typeof doc.id !== "string") return null;
	if (typeof doc.filename !== "string") return null;
	if (typeof doc.mimeType !== "string") return null;
	if (typeof doc.filesize !== "number") return null;
	if (typeof doc.width !== "number") return null;
	if (typeof doc.height !== "number") return null;
	if (typeof doc.url !== "string") return null;
	if (typeof doc.createdAt !== "string") return null;
	if (typeof doc.updatedAt !== "string") return null;
	return doc as unknown as PayloadImageDoc;
}

/**
 * Runtime validation for PayloadListResponse.
 * Returns the response if valid, null otherwise.
 */
function validatePayloadListResponse(data: unknown): PayloadListResponse | null {
	if (!data || typeof data !== "object") return null;
	const result = data as Record<string, unknown>;
	if (!Array.isArray(result.docs)) return null;
	// Validate that docs is an array of objects (simplified check)
	if (!result.docs.every((doc) => doc && typeof doc === "object")) return null;
	return result as unknown as PayloadListResponse;
}

/**
 * Configuration for BackendLibraryProvider.
 *
 * Uses session-key authentication. The frontend never holds a permanent API key.
 * Instead, it requests short-lived tokens via the `requestAccessToken` callback.
 *
 * ```typescript
 * new BackendLibraryProvider({
 *   url: "https://library.example.com",
 *   requestAccessToken: async () => {
 *     const response = await fetch("/api/library-token");
 *     const { token } = await response.json();
 *     return token;
 *   }
 * })
 * ```
 *
 * The callback is called lazily when needed and tokens are cached internally
 * with automatic refresh before expiry (15 minute lifetime assumed).
 */
export type BackendLibraryProviderConfig = {
	/** Base URL of the Payload CMS instance (e.g., `https://library.example.com`) */
	url: string;
	/** Collection slug (default: `"images"`) */
	collectionSlug?: string;
	/**
	 * Callback to request a temporary access token.
	 * Called lazily when needed and cached internally.
	 * The token should have a short lifetime (e.g., 15 minutes).
	 */
	requestAccessToken: () => Promise<string>;
};

/**
 * Backend Library Adapter — Payload CMS
 *
 * Stores assets on a Payload CMS backend via REST API using session-key authentication.
 * Compression is handled server-side by Payload.
 *
 * **Security model:**
 * - No permanent API key in the browser
 * - Short-lived tokens (15 min) obtained via `requestAccessToken` callback
 * - Tokens are cached internally with automatic refresh
 * - App backend holds the real API key server-side
 */
export class BackendLibraryProvider extends LibraryBase {
	public readonly name = "backend";

	private apiBase: string;
	private baseUrl: string;
	private requestAccessToken: () => Promise<string>;
	private cachedToken: { value: string; expiresAt: number } | null = null;

	constructor(config: BackendLibraryProviderConfig) {
		super();

		const cleanUrl = config.url.endsWith("/") ? config.url.slice(0, -1) : config.url;
		this.baseUrl = cleanUrl;
		const slug = config.collectionSlug ?? "images";
		this.apiBase = `${cleanUrl}/api/${slug}`;
		this.requestAccessToken = config.requestAccessToken;
	}

	/**
	 * Get a valid token, either from cache or by requesting a new one.
	 * Tokens are cached and refreshed 30 seconds before expiry.
	 */
	private async getToken(): Promise<string> {
		// Return cached if valid (with 30s buffer)
		if (this.cachedToken && Date.now() < this.cachedToken.expiresAt - 30_000) {
			return this.cachedToken.value;
		}

		// Fetch new token
		try {
			const token = await this.requestAccessToken();
			// Assume 15min lifetime (backend controls actual expiry)
			this.cachedToken = { value: token, expiresAt: Date.now() + 15 * 60 * 1000 };
			return token;
		} catch (error) {
			throw new Error(
				`Failed to obtain access token: ${error instanceof Error ? error.message : String(error)}`,
				{ cause: error },
			);
		}
	}

	/**
	 * Build request headers with Bearer token.
	 */
	private async getHeaders(): Promise<Record<string, string>> {
		const token = await this.getToken();
		return { Authorization: `Bearer ${token}` };
	}

	/**
	 * Convert a Payload CMS image document to an AssetEntry.
	 * Picks the best available responsive size (largest first).
	 */
	private payloadToEntry(doc: PayloadImageDoc): AssetEntry {
		const bestSize =
			doc.sizes?.max ||
			doc.sizes?.xxxl ||
			doc.sizes?.xxl ||
			doc.sizes?.xl ||
			doc.sizes?.lg ||
			doc.sizes?.md ||
			doc.sizes?.sm ||
			doc.sizes?.xs;

		const relativeUrl = bestSize?.url || doc.url;
		const src = `${this.baseUrl}${relativeUrl}`;

		return {
			src,
			metadata: {
				filename: doc.filename,
				width: doc.width,
				height: doc.height,
			},
		};
	}

	public async checkConnection(): Promise<ConnectionStatus> {
		try {
			// Test token acquisition first
			await this.getToken();

			// Then test actual API connectivity
			const headers = await this.getHeaders();
			const response = await fetch(`${this.apiBase}?limit=1`, { headers });

			if (!response.ok) {
				if (response.status === 401) {
					return {
						connected: false,
						error: "Authentication failed. Token may be expired or invalid.",
					};
				}
				return {
					connected: false,
					error: `Backend returned status ${response.status}`,
				};
			}

			return { connected: true };
		} catch (error) {
			return {
				connected: false,
				error:
					error instanceof Error
						? error.message
						: `Cannot reach backend at ${this.apiBase}. Is the service running?`,
			};
		}
	}

	/**
	 * Upload a file to the backend library.
	 *
	 * @param file - The file to upload
	 * @param metadata - Asset metadata (currently unused, reserved for future IPTC/alt text support)
	 */
	public async upload(file: File, metadata?: AssetMetadata): Promise<UploadResult> {
		// TODO: Use metadata (alt text, description) once Payload supports form data + JSON body
		void metadata; // Explicitly mark as intentionally unused for now
		const formData = new FormData();
		formData.append("file", file);

		const headers = await this.getHeaders();
		const response = await fetch(this.apiBase, {
			method: "POST",
			headers,
			body: formData,
		});

		if (!response.ok) {
			const errorData = (await response.json().catch(() => ({}))) as {
				errors?: Array<{ message?: string }>;
			};
			throw new Error(errorData?.errors?.[0]?.message ?? "Upload failed");
		}

		const uploadResult = (await response.json()) as { doc?: unknown };
		const doc = validatePayloadImageDoc(uploadResult.doc);
		if (!doc) {
			throw new Error("Invalid response from backend: missing or invalid doc");
		}

		return {
			assetId: doc.id,
			entry: this.payloadToEntry(doc),
		};
	}

	public async get(assetId: string): Promise<AssetEntry | null> {
		try {
			const headers = await this.getHeaders();
			const response = await fetch(`${this.apiBase}/${assetId}`, { headers });

			if (!response.ok) {
				if (response.status === 404) return null;
				throw new Error(`Failed to fetch asset: ${response.status}`);
			}

			const data = await response.json();
			const doc = validatePayloadImageDoc(data);
			if (!doc) {
				console.warn("[BackendLibraryProvider] Invalid response format from backend");
				return null;
			}
			return this.payloadToEntry(doc);
		} catch (error) {
			console.warn(`[BackendLibraryProvider] Failed to get asset ${assetId}:`, error);
			return null;
		}
	}

	public async list(): Promise<Array<{ id: string; entry: AssetEntry }>> {
		try {
			const headers = await this.getHeaders();
			const response = await fetch(`${this.apiBase}?limit=100`, { headers });

			if (!response.ok) {
				throw new Error(`Failed to list assets: ${response.status}`);
			}

			const data = await response.json();
			const result = validatePayloadListResponse(data);
			if (!result) {
				console.warn("[BackendLibraryProvider] Invalid list response format from backend");
				return [];
			}
			return result.docs.map((doc) => ({
				id: doc.id,
				entry: this.payloadToEntry(doc),
			}));
		} catch (error) {
			console.warn("[BackendLibraryProvider] Failed to list assets:", error);
			return [];
		}
	}

	public async delete(assetId: string): Promise<boolean> {
		try {
			const headers = await this.getHeaders();
			const response = await fetch(`${this.apiBase}/${assetId}`, {
				method: "DELETE",
				headers,
			});

			if (!response.ok) {
				if (response.status === 404) return false;
				throw new Error(`Failed to delete asset: ${response.status}`);
			}

			return true;
		} catch (error) {
			console.warn(`[BackendLibraryProvider] Failed to delete asset ${assetId}:`, error);
			return false;
		}
	}

	public async resolve(id: string | number): Promise<ImageSource | null> {
		const entry = await this.get(String(id));
		if (!entry) return null;
		return { src: entry.src };
	}
}
