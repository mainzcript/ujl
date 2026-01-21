import type { MediaMetadata, MediaLibraryEntry } from '@ujl-framework/types';
import type { MediaService, UploadResult } from './media-service.js';
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
 * Backend Media Service using Payload CMS
 *
 * Stores media on a backend server via REST API.
 * Compression handled server-side.
 */
export class BackendMediaService implements MediaService {
	private endpoint: string;
	private apiKey?: string;
	private collectionSlug: string;

	/**
	 * Create a backend media service
	 * @param endpoint - Base URL of the API (e.g., http://localhost:3000/api)
	 * @param apiKey - Optional API key for authentication
	 * @param collectionSlug - The Payload collection slug (default: 'images')
	 */
	constructor(endpoint: string, apiKey?: string, collectionSlug: string = 'images') {
		this.endpoint = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint;
		this.apiKey = apiKey;
		this.collectionSlug = collectionSlug;
	}

	/**
	 * Check if the backend service is reachable
	 * @returns Connection status with error details if not connected
	 */
	async checkConnection(): Promise<{ connected: boolean; error?: string }> {
		try {
			const response = await fetch(`${this.endpoint}/${this.collectionSlug}?limit=1`, {
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
				error: `Cannot reach backend at ${this.endpoint}. Is the service running?`
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
	 * Convert Payload image doc to MediaLibraryEntry
	 * @param doc - The Payload CMS image document
	 * @returns MediaLibraryEntry with full URL and metadata
	 */
	private payloadToEntry(doc: PayloadImageDoc): MediaLibraryEntry {
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

		// Extract base URL (remove /api from endpoint)
		const baseUrl = this.endpoint.replace('/api', '');
		const relativeUrl = bestSize?.url || doc.url;
		const dataUrl = `${baseUrl}${relativeUrl}`;

		return {
			dataUrl,
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
	 * Upload a file to the backend media library
	 * @param file - The file to upload
	 * @param metadata - Media metadata including filename and optional fields
	 * @returns Upload result with media ID and library entry
	 * @throws Error if upload fails
	 */
	async upload(file: File, metadata: MediaMetadata): Promise<UploadResult> {
		const formData = new FormData();
		formData.append('file', file);

		// Set alt text (required field) - use filename as default
		if (metadata.filename) {
			formData.append('alt', metadata.filename);
		}

		try {
			const response = await fetch(`${this.endpoint}/${this.collectionSlug}`, {
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
				mediaId: doc.id,
				entry: this.payloadToEntry(doc)
			};
		} catch (err) {
			logger.error('Backend upload error:', err);
			throw err;
		}
	}

	/**
	 * Retrieve a media entry by ID from the backend
	 * @param mediaId - The ID of the media to retrieve
	 * @returns MediaLibraryEntry if found, null otherwise
	 */
	async get(mediaId: string): Promise<MediaLibraryEntry | null> {
		try {
			const response = await fetch(`${this.endpoint}/${this.collectionSlug}/${mediaId}`, {
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
	 * List all media entries from the backend
	 * @returns Array of media entries with their IDs (max 100 items)
	 */
	async list(): Promise<Array<{ id: string; entry: MediaLibraryEntry }>> {
		try {
			const response = await fetch(`${this.endpoint}/${this.collectionSlug}?limit=100`, {
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
	 * Delete a media entry from the backend
	 * @param mediaId - The ID of the media to delete
	 * @returns true if deleted successfully, false otherwise
	 */
	async delete(mediaId: string): Promise<boolean> {
		try {
			const response = await fetch(`${this.endpoint}/${this.collectionSlug}/${mediaId}`, {
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
}
