import type { MediaMetadata, MediaLibraryEntry } from '@ujl-framework/types';
import type { MediaService, UploadResult } from './media-service.js';
import { logger } from '$lib/utils/logger.js';

/**
 * Payload CMS Media Response
 */
type PayloadMediaDoc = {
	id: string;
	filename: string;
	mimeType: string;
	filesize: number;
	width: number;
	height: number;
	sizes?: {
		thumbnail?: { url: string; width: number; height: number };
		small?: { url: string; width: number; height: number };
		medium?: { url: string; width: number; height: number };
		large?: { url: string; width: number; height: number };
		xlarge?: { url: string; width: number; height: number };
	};
	url: string;
	title?: string;
	alt?: string;
	description?: string;
	author?: string;
	license?: string;
	sourceLink?: string;
	tags?: Array<{ tag: string; id: string }>;
	createdAt: string;
	updatedAt: string;
};

type PayloadListResponse = {
	docs: PayloadMediaDoc[];
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

	/**
	 * Create a backend media service
	 * @param endpoint - Base URL of the API (e.g., http://localhost:3000/api)
	 * @param apiKey - Optional API key for authentication
	 */
	constructor(endpoint: string, apiKey?: string) {
		this.endpoint = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint;
		this.apiKey = apiKey;
	}

	/**
	 * Check if the backend service is reachable
	 * @returns Connection status with error details if not connected
	 */
	async checkConnection(): Promise<{ connected: boolean; error?: string }> {
		try {
			const response = await fetch(`${this.endpoint}/media?limit=1`, {
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
	 * Convert Payload media doc to MediaLibraryEntry
	 * @param doc - The Payload CMS media document
	 * @returns MediaLibraryEntry with full URL and metadata
	 */
	private payloadToEntry(doc: PayloadMediaDoc): MediaLibraryEntry {
		// Use the best available size, prefer xlarge
		const bestSize =
			doc.sizes?.xlarge ||
			doc.sizes?.large ||
			doc.sizes?.medium ||
			doc.sizes?.small ||
			doc.sizes?.thumbnail;

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
		formData.append('title', metadata.filename);

		// Add optional metadata if available
		if (metadata.filename) {
			formData.append('alt', metadata.filename);
		}

		try {
			const response = await fetch(`${this.endpoint}/media`, {
				method: 'POST',
				headers: this.getHeaders(),
				body: formData
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.errors?.[0]?.message || 'Upload failed');
			}

			const result = await response.json();
			const doc: PayloadMediaDoc = result.doc;

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
			const response = await fetch(`${this.endpoint}/media/${mediaId}`, {
				headers: this.getHeaders()
			});

			if (!response.ok) {
				if (response.status === 404) {
					return null;
				}
				throw new Error('Failed to fetch media');
			}

			const doc: PayloadMediaDoc = await response.json();
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
			const response = await fetch(`${this.endpoint}/media?limit=100`, {
				headers: this.getHeaders()
			});

			if (!response.ok) {
				throw new Error('Failed to list media');
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
			const response = await fetch(`${this.endpoint}/media/${mediaId}`, {
				method: 'DELETE',
				headers: this.getHeaders()
			});

			if (!response.ok) {
				if (response.status === 404) {
					return false;
				}
				throw new Error('Failed to delete media');
			}

			return true;
		} catch (err) {
			logger.error('Backend delete error:', err);
			return false;
		}
	}
}
