<script lang="ts">
	import { Button } from "@ujl-framework/ui";
	import type { AssetMetadata } from "@ujl-framework/types";
	import { logger } from "$lib/utils/logger.js";
	import { getContext } from "svelte";
	import { CRAFTER_CONTEXT, type CrafterContext } from "$lib/stores/index.js";
	import { toast } from "svelte-sonner";
	import UploadIcon from "@lucide/svelte/icons/upload";
	import XIcon from "@lucide/svelte/icons/x";

	let {
		onUploadComplete,
		onClose,
	}: {
		onUploadComplete?: (imageId: string) => void;
		onClose?: () => void;
	} = $props();

	const crafter = getContext<CrafterContext>(CRAFTER_CONTEXT);
	const library = $derived(crafter.library);

	const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
	const ACCEPT_STRING = ACCEPTED_IMAGE_TYPES.join(",");

	let fileInputRef: HTMLInputElement | null = $state(null);
	let isCompressing = $state(false);

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
				reject(new Error("Failed to load image"));
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

		// Validate file type
		if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
			toast.error("Unsupported file type", {
				description: `Please use JPEG, PNG, WebP, or GIF.`,
			});
			target.value = "";
			return;
		}

		isCompressing = true;

		try {
			// Get original dimensions
			const { width, height } = await getImageDimensions(file);

			// Create metadata — only fields the provider cannot determine itself.
			// mimeType and filesize are read by the provider from the File object directly.
			const metadata: AssetMetadata = {
				filename: file.name,
				width,
				height,
			};

			// Use library adapter to upload (handles compression and storage)
			const result = await library.upload(file, metadata);

			logger.info("Image uploaded successfully:", result.assetId);

			// Notify parent component
			onUploadComplete?.(result.assetId);
			toast.success("Image uploaded successfully");
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "Failed to upload image";
			logger.error("Image upload error:", err);
			toast.error("Upload failed", {
				description: errorMessage,
			});
		} finally {
			isCompressing = false;
			// Reset input to allow selecting the same file again
			if (target) {
				target.value = "";
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

<div class="flex w-full items-center gap-2">
	<!-- Upload Button -->
	<Button
		type="button"
		variant="muted"
		size="sm"
		onclick={handleFileInputClick}
		disabled={isCompressing}
		class="flex-1"
	>
		{#if isCompressing}
			<div class="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-current"></div>
			Uploading...
		{:else}
			<UploadIcon class="mr-2 h-4 w-4" />
			Upload Image
		{/if}
	</Button>
	<!-- Close Button -->
	{#if onClose}
		<Button
			type="button"
			variant="ghost"
			size="icon"
			class="size-8 shrink-0"
			onclick={onClose}
			disabled={isCompressing}
		>
			<XIcon class="h-4 w-4" />
		</Button>
	{/if}
</div>

<!-- Hidden File Input -->
<input
	bind:this={fileInputRef}
	type="file"
	accept={ACCEPT_STRING}
	class="hidden"
	onchange={handleFileSelect}
	disabled={isCompressing}
/>
