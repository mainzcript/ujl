/**
 * Image compression utilities for optimizing image files.
 *
 * These helpers are intentionally UI-agnostic and can be reused from
 * different components. They do not depend on Svelte APIs.
 */

import Compressor from "compressorjs";

/**
 * Load image and return dimensions
 */
function loadImage(file: File): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		const objectUrl = URL.createObjectURL(file);

		img.onload = () => {
			URL.revokeObjectURL(objectUrl);
			resolve(img);
		};

		img.onerror = () => {
			URL.revokeObjectURL(objectUrl);
			reject(new Error("Failed to load image"));
		};

		img.src = objectUrl;
	});
}

/**
 * Compresses an image file with iterative quality/dimension reduction
 * Target: <= 100KB, fallback: <= 200KB
 *
 * Strategy:
 * 1. Scale to max 2000x2000 (4M pixels)
 * 2. Try quality 80%
 * 3. Reduce quality stepwise to 60%
 * 4. Scale down stepwise to 800x800 (640K pixels)
 * 5. Aggressively reduce both dimensions and quality simultaneously until <= 200KB
 *
 * @param file - The image file to compress
 * @returns A promise resolving to the compressed File
 */
export async function compressImage(file: File): Promise<File> {
	const TARGET_SIZE = 100 * 1024; // 100KB
	const FALLBACK_SIZE = 200 * 1024; // 200KB

	// Load image once to get dimensions
	const img = await loadImage(file);
	const aspectRatio = img.width / img.height;

	// Helper: Get file size in bytes
	const getFileSize = (f: File | Blob): number => f.size;

	// Helper: Compress with specific settings
	const compressWithSettings = (
		file: File,
		maxWidth: number,
		maxHeight: number,
		quality: number,
	): Promise<File | Blob> => {
		return new Promise((resolve, reject) => {
			new Compressor(file, {
				maxWidth: Math.round(maxWidth),
				maxHeight: Math.round(maxHeight),
				quality,
				convertTypes: ["image/png"],
				convertSize: 5_000_000,
				mimeType: "auto",
				success: resolve,
				error: reject,
			});
		});
	};

	// Helper: Convert Blob to File
	const ensureFile = (result: File | Blob, originalName: string): File => {
		if (result instanceof File) return result;
		return new File([result], originalName, {
			type: result.type,
			lastModified: Date.now(),
		});
	};

	// Step 1: Scale to max 2000x2000 (4M pixels)
	let maxWidth = Math.min(2000, img.width);
	let maxHeight = Math.min(2000, img.height);

	// Maintain aspect ratio
	if (maxWidth / maxHeight !== aspectRatio) {
		if (maxWidth / maxHeight > aspectRatio) {
			maxWidth = maxHeight * aspectRatio;
		} else {
			maxHeight = maxWidth / aspectRatio;
		}
	}

	let result = await compressWithSettings(file, maxWidth, maxHeight, 1.0);
	let resultFile = ensureFile(result, file.name);

	if (getFileSize(resultFile) <= TARGET_SIZE) {
		return resultFile;
	}

	// Step 2: Try quality 80%
	result = await compressWithSettings(file, maxWidth, maxHeight, 0.8);
	resultFile = ensureFile(result, file.name);

	if (getFileSize(resultFile) <= TARGET_SIZE) {
		return resultFile;
	}

	// Step 3: Reduce quality stepwise from 80% to 60%
	for (let quality = 0.75; quality >= 0.6; quality -= 0.05) {
		result = await compressWithSettings(file, maxWidth, maxHeight, quality);
		resultFile = ensureFile(result, file.name);

		if (getFileSize(resultFile) <= TARGET_SIZE) {
			return resultFile;
		}
	}

	// Step 4: Scale down stepwise to 800x800 (640K pixels)
	const minDimension = 800;
	const steps = 5; // Number of reduction steps
	const widthStep = (maxWidth - minDimension) / steps;
	const heightStep = (maxHeight - minDimension) / steps;

	for (let i = 1; i <= steps; i++) {
		const currentMaxWidth = Math.max(minDimension, maxWidth - widthStep * i);
		const currentMaxHeight = Math.max(minDimension, maxHeight - heightStep * i);

		// Maintain aspect ratio
		let scaledWidth = currentMaxWidth;
		let scaledHeight = currentMaxHeight;
		if (scaledWidth / scaledHeight !== aspectRatio) {
			if (scaledWidth / scaledHeight > aspectRatio) {
				scaledWidth = scaledHeight * aspectRatio;
			} else {
				scaledHeight = scaledWidth / aspectRatio;
			}
		}

		result = await compressWithSettings(file, scaledWidth, scaledHeight, 0.6);
		resultFile = ensureFile(result, file.name);

		if (getFileSize(resultFile) <= TARGET_SIZE) {
			return resultFile;
		}
	}

	// Step 5: Aggressively reduce both dimensions and quality simultaneously until <= 200KB
	let currentWidth = Math.max(minDimension, maxWidth - widthStep * steps);
	let currentHeight = Math.max(minDimension, maxHeight - heightStep * steps);
	let currentQuality = 0.6;

	const minWidth = 400; // Lower threshold for Step 5
	const minHeight = 400;
	const minQuality = 0.3; // Absolute minimum quality
	const maxIterations = 50; // Prevent infinite loops
	let iterations = 0;
	let previousSize = getFileSize(resultFile);

	while (
		getFileSize(resultFile) > FALLBACK_SIZE &&
		(currentWidth > minWidth || currentQuality > minQuality) &&
		iterations < maxIterations
	) {
		iterations++;

		// Reduce both dimension and quality for aggressive compression
		currentWidth = Math.max(minWidth, currentWidth * 0.9);
		currentHeight = Math.max(minHeight, currentHeight * 0.9);
		currentQuality = Math.max(minQuality, currentQuality * 0.9);

		// Maintain aspect ratio (defensive check for rounding errors)
		if (Math.abs(currentWidth / currentHeight - aspectRatio) > 0.01) {
			currentWidth = currentHeight * aspectRatio;
		}

		result = await compressWithSettings(file, currentWidth, currentHeight, currentQuality);
		resultFile = ensureFile(result, file.name);

		// Check if we're making progress - if size hasn't changed, break to avoid infinite loop
		const currentSize = getFileSize(resultFile);
		if (currentSize >= previousSize) {
			// No progress made, break to avoid infinite loop
			break;
		}
		previousSize = currentSize;

		// Early exit if we reached target
		if (currentSize <= TARGET_SIZE) {
			return resultFile;
		}
	}

	return resultFile;
}
