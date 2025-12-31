<script lang="ts">
	import { Button, Text } from '@ujl-framework/ui';
	import type { UJLImageData } from '@ujl-framework/types';
	import { compressImage } from '$lib/utils/image-compression.js';
	import { logger } from '$lib/utils/logger.js';
	import XIcon from '@lucide/svelte/icons/x';
	import ImageIcon from '@lucide/svelte/icons/image';

	let {
		value,
		onChange
	}: {
		value: UJLImageData | null | undefined;
		onChange: (value: UJLImageData | null) => void;
	} = $props();

	const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
	const ACCEPT_STRING = ACCEPTED_IMAGE_TYPES.join(',');

	let fileInputRef: HTMLInputElement | null = $state(null);
	let isCompressing = $state(false);
	let error: string | null = $state(null);

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
			const compressedFile = await compressImage(file);

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

			// TODO: Replace with Media ID when Media Library is integrated
			// @see Migration Guide - Media Library Integration (Issue)
			const imageData: UJLImageData = {
				dataUrl: base64Url
			};

			onChange(imageData);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to process image';
			logger.error('Image compression error:', err);
		} finally {
			isCompressing = false;
			// Reset input to allow selecting the same file again
			if (target) {
				target.value = '';
			}
		}
	}

	function handleRemove() {
		onChange(null);
		error = null;
		if (fileInputRef) {
			fileInputRef.value = '';
		}
	}

	function handleFileInputClick() {
		fileInputRef?.click();
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleFileInputClick();
		}
	}
</script>

<div class="space-y-2">
	<!-- Error Message -->
	{#if error}
		<div class="rounded-md border border-destructive/50 bg-destructive/10 p-3">
			<Text size="sm" intensity="muted" class="text-destructive">
				{error}
			</Text>
		</div>
	{/if}

	<!-- Image Preview or Upload Button -->
	{#if value}
		<div class="relative h-32 overflow-hidden rounded-md border border-border">
			<img src={value.dataUrl} alt="" class="h-full w-full object-cover" />
			<Button
				type="button"
				variant="muted"
				size="icon"
				class="absolute top-2 right-2"
				onclick={handleRemove}
			>
				<XIcon class="h-4 w-4" />
			</Button>
		</div>
		<Button type="button" variant="outline" size="sm" onclick={handleFileInputClick} class="w-full">
			Replace Image
		</Button>
	{:else}
		<button
			type="button"
			class="flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-border p-8 transition-colors hover:bg-muted/50"
			onclick={handleFileInputClick}
			onkeydown={handleKeyDown}
			disabled={isCompressing}
		>
			{#if isCompressing}
				<div class="flex flex-col items-center gap-2">
					<div class="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
					<Text size="sm" intensity="muted">Compressing image...</Text>
				</div>
			{:else}
				<ImageIcon class="mb-2 h-12 w-12 text-muted-foreground" />
				<Text size="sm" intensity="muted" class="text-center">Click to select an image</Text>
				<Text size="xs" intensity="muted" class="mt-1 text-center">JPEG, PNG, WebP, or GIF</Text>
			{/if}
		</button>
	{/if}

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
