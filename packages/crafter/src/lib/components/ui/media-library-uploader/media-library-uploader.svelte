<script lang="ts">
	import { Button, Text } from '@ujl-framework/ui';
	import type { ImageMetadata } from '@ujl-framework/types';
	import { logger } from '$lib/utils/logger.js';
	import { getContext } from 'svelte';
	import { CRAFTER_CONTEXT, type CrafterContext } from '$lib/components/ujl-crafter/context.js';
	import UploadIcon from '@lucide/svelte/icons/upload';

	let {
		onUploadComplete
	}: {
		onUploadComplete?: (imageId: string) => void;
	} = $props();

	const crafter = getContext<CrafterContext>(CRAFTER_CONTEXT);
	const imageService = $derived(crafter.imageService);

	const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
	const ACCEPT_STRING = ACCEPTED_IMAGE_TYPES.join(',');

	let fileInputRef: HTMLInputElement | null = $state(null);
	let isCompressing = $state(false);
	let error: string | null = $state(null);

	/**
	 * Extracts the width and height dimensions from an image file
	 * @param file - The image file to analyze
	 * @returns Promise resolving to the image dimensions
	 * @throws Error if the image fails to load
	 */
	async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
		return new Promise((resolve, reject) => {
			const img = new Image();
			const objectUrl = URL.createObjectURL(file);

			img.onload = () => {
				URL.revokeObjectURL(objectUrl);
				resolve({ width: img.width, height: img.height });
			};

			img.onerror = () => {
				URL.revokeObjectURL(objectUrl);
				reject(new Error('Failed to load image'));
			};

			img.src = objectUrl;
		});
	}

	/**
	 * Handles file selection from the input element
	 * Validates file type, extracts metadata, and uploads to image service
	 * @param event - The change event from the file input
	 */
	async function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (!file) {
			return;
		}

		error = null;

		// Validate file type
		if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
			error = `Unsupported file type: ${file.type}. Please use JPEG, PNG, WebP, or GIF.`;
			target.value = '';
			return;
		}

		isCompressing = true;

		try {
			// Get original dimensions
			const { width, height } = await getImageDimensions(file);

			// Create metadata for image library
			const metadata: ImageMetadata = {
				filename: file.name,
				mimeType: file.type,
				filesize: file.size,
				width,
				height
			};

			// Use ImageService to upload (handles compression and storage)
			const result = await imageService.upload(file, metadata);

			logger.info('Image uploaded successfully:', result.imageId);

			// Notify parent component
			onUploadComplete?.(result.imageId);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to upload image';
			logger.error('Image upload error:', err);
		} finally {
			isCompressing = false;
			// Reset input to allow selecting the same file again
			if (target) {
				target.value = '';
			}
		}
	}

	/**
	 * Triggers the hidden file input click event
	 * Opens the native file picker dialog
	 */
	function handleFileInputClick() {
		fileInputRef?.click();
	}
</script>

<div class="w-full">
	<!-- Error Message -->
	{#if error}
		<div class="rounded-md border border-destructive/50 bg-destructive/10 p-3">
			<Text size="sm" intensity="muted" class="text-destructive">
				{error}
			</Text>
		</div>
	{/if}

	<!-- Upload Button -->
	<Button
		type="button"
		variant="outline"
		size="sm"
		onclick={handleFileInputClick}
		disabled={isCompressing}
		class="w-full"
	>
		{#if isCompressing}
			<div class="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-current"></div>
			Uploading...
		{:else}
			<UploadIcon class="mr-2 h-4 w-4" />
			Upload Image
		{/if}
	</Button>

	<!-- Hidden File Input -->
	<input
		bind:this={fileInputRef}
		type="file"
		accept={ACCEPT_STRING}
		class="hidden"
		onchange={handleFileSelect}
		disabled={isCompressing}
	/>
</div>
