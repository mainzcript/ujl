import type {
	ImageMetadata,
	ImageEntry,
	ImageSource,
	UJLCImageLibrary
} from '@ujl-framework/types';
import type { ImageService, UploadResult } from './image-service.js';
import { generateUid } from '@ujl-framework/core';
import { compressImage } from '../utils/image-compression.js';

/**
 * Inline Image Service
 *
 * Stores images as Base64 Data-URLs directly in the UJLC document.
 * Uses client-side compression (target: ≤100KB, fallback: ≤200KB).
 */
export class InlineImageService implements ImageService {
	private getImages: () => UJLCImageLibrary;
	private updateImages: (fn: (images: UJLCImageLibrary) => UJLCImageLibrary) => void;

	/**
	 * Create an inline image service
	 * @param getImages - Function to get current image library
	 * @param updateImages - Function to update image library
	 */
	constructor(
		getImages: () => UJLCImageLibrary,
		updateImages: (fn: (images: UJLCImageLibrary) => UJLCImageLibrary) => void
	) {
		this.getImages = getImages;
		this.updateImages = updateImages;
	}

	async checkConnection(): Promise<{ connected: boolean; error?: string }> {
		// Inline storage is always available (local)
		return { connected: true };
	}

	async upload(file: File, metadata: ImageMetadata): Promise<UploadResult> {
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
		const imageId = generateUid();
		const entry: ImageEntry = {
			src: base64Url,
			metadata: {
				...metadata,
				filesize: compressedFile.size, // Use compressed size
				mimeType: compressedFile.type // Use compressed type
			}
		};

		// Store in image library
		this.updateImages((currentImages) => ({
			...currentImages,
			[imageId]: entry
		}));

		return { imageId, entry };
	}

	async get(imageId: string): Promise<ImageEntry | null> {
		const images = this.getImages();
		return images[imageId] ?? null;
	}

	async list(): Promise<Array<{ id: string; entry: ImageEntry }>> {
		const images = this.getImages();
		return Object.entries(images).map(([id, entry]) => ({ id, entry }));
	}

	async delete(imageId: string): Promise<boolean> {
		const images = this.getImages();
		if (!(imageId in images)) {
			return false;
		}

		this.updateImages((currentImages) => {
			const newImages = { ...currentImages };
			delete newImages[imageId];
			return newImages;
		});

		return true;
	}

	async resolve(id: string | number): Promise<ImageSource | null> {
		const entry = await this.get(String(id));
		if (!entry) return null;
		return { src: entry.src };
	}
}
