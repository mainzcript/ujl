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
 * Configuration for BackendLibraryProvider.
 *
 * Two modes are supported:
 *
 * **Direct mode** — API key is included in every request.
 * Suitable for local development or server-side rendering where the key
 * is not exposed to the browser.
 *
 * ```typescript
 * new BackendLibraryProvider({ url: "http://localhost:3000", apiKey: "my-key" })
 * ```
 *
 * **Proxy mode** — Requests are forwarded through a developer-controlled
 * BFF endpoint. No API key in the browser. The proxy holds the key server-side.
 *
 * ```typescript
 * new BackendLibraryProvider({ proxyUrl: "/api/library" })
 * ```
 *
 * For a SvelteKit proxy example, see the UJL documentation.
 */
export type BackendLibraryProviderConfig =
	| {
			/** Base URL of the Payload CMS instance (e.g., `http://localhost:3000`) */
			url: string;
			/** API key for direct authentication */
			apiKey: string;
			/** Collection slug (default: `"images"`) */
			collectionSlug?: string;
			proxyUrl?: never;
	  }
	| {
			/**
			 * URL of the BFF proxy endpoint.
			 * The adapter appends `/{id}` for single-item operations
			 * and passes query strings for listing.
			 * Example: `"/api/library"` → `"/api/library/abc123"`.
			 */
			proxyUrl: string;
			url?: never;
			apiKey?: never;
			collectionSlug?: never;
	  };

/**
 * Backend Library Adapter — Payload CMS
 *
 * Stores assets on a Payload CMS backend via REST API.
 * Compression is handled server-side by Payload.
 *
 * Supports two authentication modes:
 * - **Direct:** `url + apiKey` — for dev/SSR setups
 * - **Proxy:** `proxyUrl` — for deployed browser setups (no key in browser)
 */
export class BackendLibraryProvider extends LibraryBase {
	public readonly name = "backend";

	private apiBase: string;
	private baseUrl: string | null;
	private apiKey?: string;
	private isProxyMode: boolean;

	constructor(config: BackendLibraryProviderConfig) {
		super();

		if (config.proxyUrl !== undefined) {
			// Proxy mode — all requests go through developer's BFF
			this.isProxyMode = true;
			this.apiBase = config.proxyUrl.endsWith("/") ? config.proxyUrl.slice(0, -1) : config.proxyUrl;
			this.baseUrl = null;
		} else {
			// Direct mode — talk to Payload CMS directly
			this.isProxyMode = false;
			const cleanUrl = config.url.endsWith("/") ? config.url.slice(0, -1) : config.url;
			this.baseUrl = cleanUrl;
			const slug = config.collectionSlug ?? "images";
			this.apiBase = `${cleanUrl}/api/${slug}`;
			this.apiKey = config.apiKey;
		}
	}

	/**
	 * Build request headers.
	 * In proxy mode no authorization header is added — the proxy handles auth.
	 */
	private getHeaders(): Record<string, string> {
		if (this.isProxyMode || !this.apiKey) return {};
		return { Authorization: `users API-Key ${this.apiKey}` };
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

		// In proxy mode the proxy already returns full URLs; in direct mode we prefix
		const relativeUrl = bestSize?.url || doc.url;
		const src = this.baseUrl ? `${this.baseUrl}${relativeUrl}` : relativeUrl;

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
			const response = await fetch(`${this.apiBase}?limit=1`, {
				headers: this.getHeaders(),
			});

			if (!response.ok) {
				if (response.status === 401) {
					return {
						connected: false,
						error: "Authentication failed. Check your API key.",
					};
				}
				return {
					connected: false,
					error: `Backend returned status ${response.status}`,
				};
			}

			return { connected: true };
		} catch {
			return {
				connected: false,
				error: `Cannot reach backend at ${this.apiBase}. Is the service running?`,
			};
		}
	}

	public async upload(file: File, _metadata: AssetMetadata): Promise<UploadResult> {
		const formData = new FormData();
		formData.append("file", file);

		const response = await fetch(this.apiBase, {
			method: "POST",
			headers: this.getHeaders(),
			body: formData,
		});

		if (!response.ok) {
			const error = (await response.json().catch(() => ({}))) as {
				errors?: Array<{ message?: string }>;
			};
			throw new Error(error?.errors?.[0]?.message ?? "Upload failed");
		}

		const result = (await response.json()) as { doc: PayloadImageDoc };
		const doc = result.doc;

		return {
			assetId: doc.id,
			entry: this.payloadToEntry(doc),
		};
	}

	public async get(assetId: string): Promise<AssetEntry | null> {
		try {
			const response = await fetch(`${this.apiBase}/${assetId}`, {
				headers: this.getHeaders(),
			});

			if (!response.ok) {
				if (response.status === 404) return null;
				throw new Error("Failed to fetch asset");
			}

			const doc = (await response.json()) as PayloadImageDoc;
			return this.payloadToEntry(doc);
		} catch {
			return null;
		}
	}

	public async list(): Promise<Array<{ id: string; entry: AssetEntry }>> {
		try {
			const response = await fetch(`${this.apiBase}?limit=100`, {
				headers: this.getHeaders(),
			});

			if (!response.ok) {
				throw new Error("Failed to list assets");
			}

			const result = (await response.json()) as PayloadListResponse;
			return result.docs.map((doc) => ({
				id: doc.id,
				entry: this.payloadToEntry(doc),
			}));
		} catch {
			return [];
		}
	}

	public async delete(assetId: string): Promise<boolean> {
		try {
			const response = await fetch(`${this.apiBase}/${assetId}`, {
				method: "DELETE",
				headers: this.getHeaders(),
			});

			if (!response.ok) {
				if (response.status === 404) return false;
				throw new Error("Failed to delete asset");
			}

			return true;
		} catch {
			return false;
		}
	}

	public async resolve(id: string | number): Promise<ImageSource | null> {
		const entry = await this.get(String(id));
		if (!entry) return null;
		return { src: entry.src };
	}
}
