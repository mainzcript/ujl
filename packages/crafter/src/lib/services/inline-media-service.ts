import type { MediaMetadata, MediaLibraryEntry, UJLCMediaLibrary } from '@ujl-framework/types';
import type { MediaService, UploadResult } from './media-service.js';
import { generateUid } from '@ujl-framework/core';
import { compressImage } from '../utils/image-compression.js';

/**
 * Inline Media Service
 *
 * Stores media as Base64 Data-URLs directly in the UJLC document.
 * Uses client-side compression (target: ≤100KB, fallback: ≤200KB).
 */
export class InlineMediaService implements MediaService {
	private getMedia: () => UJLCMediaLibrary;
	private updateMedia: (fn: (media: UJLCMediaLibrary) => UJLCMediaLibrary) => void;

	/**
	 * Create an inline media service
	 * @param getMedia - Function to get current media library
	 * @param updateMedia - Function to update media library
	 */
	constructor(
		getMedia: () => UJLCMediaLibrary,
		updateMedia: (fn: (media: UJLCMediaLibrary) => UJLCMediaLibrary) => void
	) {
		this.getMedia = getMedia;
		this.updateMedia = updateMedia;
	}

	async checkConnection(): Promise<{ connected: boolean; error?: string }> {
		// Inline storage is always available (local)
		return { connected: true };
	}

	async upload(file: File, metadata: MediaMetadata): Promise<UploadResult> {
		// Compress image
		const compressedFile = await compressImage(file);

		// Convert to Base64
		const reader = new FileReader();
		const base64Url = await new Promise<string>((resolve, reject) => {
			reader.onload = () => {
				if (typeof reader.result === 'string') {
					resolve(reader.result);
				} else {
					reject(new Error('Failed to convert image to Base64'));
				}
			};
			reader.onerror = () => {
				reject(new Error('Failed to read file'));
			};
			reader.readAsDataURL(compressedFile);
		});

		// Generate ID and create entry
		const mediaId = generateUid();
		const entry: MediaLibraryEntry = {
			dataUrl: base64Url,
			metadata: {
				...metadata,
				filesize: compressedFile.size, // Use compressed size
				mimeType: compressedFile.type // Use compressed type
			}
		};

		// Store in media library
		this.updateMedia((currentMedia) => ({
			...currentMedia,
			[mediaId]: entry
		}));

		return { mediaId, entry };
	}

	async get(mediaId: string): Promise<MediaLibraryEntry | null> {
		const media = this.getMedia();
		return media[mediaId] ?? null;
	}

	async list(): Promise<Array<{ id: string; entry: MediaLibraryEntry }>> {
		const media = this.getMedia();
		return Object.entries(media).map(([id, entry]) => ({ id, entry }));
	}

	async delete(mediaId: string): Promise<boolean> {
		const media = this.getMedia();
		if (!(mediaId in media)) {
			return false;
		}

		this.updateMedia((currentMedia) => {
			const newMedia = { ...currentMedia };
			delete newMedia[mediaId];
			return newMedia;
		});

		return true;
	}
}
