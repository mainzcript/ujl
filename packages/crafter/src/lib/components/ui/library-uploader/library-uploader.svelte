<script lang="ts">
	import { Button } from "@ujl-framework/ui";
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

	const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
	const ACCEPT_STRING = ACCEPTED_IMAGE_TYPES.join(",");

	let fileInputRef: HTMLInputElement | null = $state(null);
	let isUploading = $state(false);

	/**
	 * Handles file selection from the input element
	 * Validates file type and uploads via the Crafter store
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

		// Check if upload is supported
		if (!crafter.canUploadLibrary()) {
			toast.error("Upload not supported", {
				description: "This library provider does not support uploads.",
			});
			target.value = "";
			return;
		}

		isUploading = true;

		try {
			// Upload via Crafter store
			const result = await crafter.uploadLibraryAsset(file);

			logger.info("Image uploaded successfully:", result.id);

			// Notify parent component
			onUploadComplete?.(result.id);
			toast.success("Image uploaded successfully");
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "Failed to upload image";
			logger.error("Image upload error:", err);
			toast.error("Upload failed", {
				description: errorMessage,
			});
		} finally {
			isUploading = false;
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
		disabled={isUploading}
		class="flex-1"
	>
		{#if isUploading}
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
			disabled={isUploading}
		>
			<XIcon class="h-4 w-4" />
		</Button>
	{/if}
</div>

{#if crafter.canUploadLibrary()}
	<!-- Hidden File Input -->
	<input
		bind:this={fileInputRef}
		type="file"
		accept={ACCEPT_STRING}
		class="hidden"
		onchange={handleFileSelect}
		disabled={isUploading}
	/>
{/if}
