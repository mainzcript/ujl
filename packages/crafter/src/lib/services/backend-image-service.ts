import type { ImageMetadata, ImageEntry, ImageSource } from '@ujl-framework/types';
import type { ImageService, UploadResult } from './image-service.js';
import { logger } from '../utils/logger.js';

/**
 * Payload CMS Image Response (IPTC-oriented data model)
 *
 * Image sizes are inspired by Tailwind CSS breakpoints:
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
	description?: string;
	credit?: {
		creator?: string;
		creditLine?: string;
		copyrightNotice?: string;
		licenseUrl?: string;
	};
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
 * Backend Image Service using Payload CMS
 *
 * Stores images on a backend server via REST API.
 * Compression handled server-side.
 */
export class BackendImageService implements ImageService {
	private url: string;
	private apiBase: string;
	private apiKey?: string;
	private collectionSlug: string;

	/**
	 * Create a backend image service
	 * @param url - Base URL of the API (e.g., http://localhost:3000)
	 * @param apiKey - Optional API key for authentication
	 * @param collectionSlug - The Payload collection slug (default: 'images')
	 */
	constructor(url: string, apiKey?: string, collectionSlug: string = 'images') {
		this.url = url.endsWith('/') ? url.slice(0, -1) : url;
		this.apiKey = apiKey;
		this.collectionSlug = collectionSlug;
		// Automatically append /api/{collectionSlug} for API calls
		this.apiBase = `${this.url}/api/${this.collectionSlug}`;
	}

	/**
	 * Check if the backend service is reachable
	 * @returns Connection status with error details if not connected
	 */
	async checkConnection(): Promise<{ connected: boolean; error?: string }> {
		try {
			const response = await fetch(`${this.apiBase}?limit=1`, {
				headers: this.getHeaders()
			});

			if (!response.ok) {
				if (response.status === 401) {
					return {
						connected: false,
						error: 'Authentication failed. Check your API key in .env.local'
					};
				}
				return {
					connected: false,
					error: `Backend returned status ${response.status}`
				};
			}

			return { connected: true };
		} catch (err) {
			logger.error('Backend connection error:', err);
			return {
				connected: false,
				error: `Cannot reach backend at ${this.url}. Is the service running?`
			};
		}
	}

	/**
	 * Get authorization headers for API requests
	 * @returns Headers object with API key if configured
	 */
	private getHeaders(): HeadersInit {
		const headers: HeadersInit = {};
		if (this.apiKey) {
			headers['Authorization'] = `users API-Key ${this.apiKey}`;
		}
		return headers;
	}

	/**
	 * Convert Payload image doc to ImageEntry
	 * @param doc - The Payload CMS image document
	 * @returns ImageEntry with full URL and metadata
	 */
	private payloadToEntry(doc: PayloadImageDoc): ImageEntry {
		// Use the best available size (largest to smallest fallback)
		const bestSize =
			doc.sizes?.max ||
			doc.sizes?.xxxl ||
			doc.sizes?.xxl ||
			doc.sizes?.xl ||
			doc.sizes?.lg ||
			doc.sizes?.md ||
			doc.sizes?.sm ||
			doc.sizes?.xs;

		// Payload returns relative URLs, so we use the base URL directly
		const relativeUrl = bestSize?.url || doc.url;
		const src = `${this.url}${relativeUrl}`;

		return {
			src,
			metadata: {
				filename: doc.filename,
				mimeType: doc.mimeType,
				filesize: doc.filesize,
				width: doc.width,
				height: doc.height
			}
		};
	}

	/**
	 * Upload a file to the backend image library
	 * @param file - The file to upload
	 * @param metadata - Image metadata including filename and optional fields
	 * @returns Upload result with image ID and library entry
	 * @throws Error if upload fails
	 */
	async upload(file: File, metadata: ImageMetadata): Promise<UploadResult> {
		const formData = new FormData();
		formData.append('file', file);

		// Set alt text (required field) - use filename as default
		if (metadata.filename) {
			formData.append('alt', metadata.filename);
		}

		try {
			const response = await fetch(`${this.apiBase}`, {
				method: 'POST',
				headers: this.getHeaders(),
				body: formData
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.errors?.[0]?.message || 'Upload failed');
			}

			const result = await response.json();
			const doc: PayloadImageDoc = result.doc;

			return {
				imageId: doc.id,
				entry: this.payloadToEntry(doc)
			};
		} catch (err) {
			logger.error('Backend upload error:', err);
			throw err;
		}
	}

	/**
	 * Retrieve an image entry by ID from the backend
	 * @param imageId - The ID of the image to retrieve
	 * @returns ImageEntry if found, null otherwise
	 */
	async get(imageId: string): Promise<ImageEntry | null> {
		try {
			const response = await fetch(`${this.apiBase}/${imageId}`, {
				headers: this.getHeaders()
			});

			if (!response.ok) {
				if (response.status === 404) {
					return null;
				}
				throw new Error('Failed to fetch image');
			}

			const doc: PayloadImageDoc = await response.json();
			return this.payloadToEntry(doc);
		} catch (err) {
			logger.error('Backend get error:', err);
			return null;
		}
	}

	/**
	 * List all image entries from the backend
	 * @returns Array of image entries with their IDs (max 100 items)
	 */
	async list(): Promise<Array<{ id: string; entry: ImageEntry }>> {
		try {
			const response = await fetch(`${this.apiBase}?limit=100`, {
				headers: this.getHeaders()
			});

			if (!response.ok) {
				throw new Error('Failed to list images');
			}

			const result: PayloadListResponse = await response.json();
			return result.docs.map((doc) => ({
				id: doc.id,
				entry: this.payloadToEntry(doc)
			}));
		} catch (err) {
			logger.error('Backend list error:', err);
			return [];
		}
	}

	/**
	 * Delete an image entry from the backend
	 * @param imageId - The ID of the image to delete
	 * @returns true if deleted successfully, false otherwise
	 */
	async delete(imageId: string): Promise<boolean> {
		try {
			const response = await fetch(`${this.apiBase}/${imageId}`, {
				method: 'DELETE',
				headers: this.getHeaders()
			});

			if (!response.ok) {
				if (response.status === 404) {
					return false;
				}
				throw new Error('Failed to delete image');
			}

			return true;
		} catch (err) {
			logger.error('Backend delete error:', err);
			return false;
		}
	}

	/**
	 * Resolve an image ID to its source URL
	 * @param id - Image ID
	 * @returns Image source or null if not found
	 */
	async resolve(id: string | number): Promise<ImageSource | null> {
		const entry = await this.get(String(id));
		if (!entry) return null;
		return { src: entry.src };
	}
}
