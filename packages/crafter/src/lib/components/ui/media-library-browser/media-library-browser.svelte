<script lang="ts">
	import {
		Button,
		Text,
		Dialog,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogDescription,
		DialogBody,
		DialogFooter,
		DialogCloseButton
	} from '@ujl-framework/ui';
	import { getContext } from 'svelte';
	import { CRAFTER_CONTEXT, type CrafterContext } from '$lib/components/ujl-crafter/context.js';
	import type { MediaMetadata, MediaLibraryEntry } from '@ujl-framework/types';
	import XIcon from '@lucide/svelte/icons/x';
	import ImageIcon from '@lucide/svelte/icons/image';
	import TrashIcon from '@lucide/svelte/icons/trash-2';
	import InfoIcon from '@lucide/svelte/icons/info';
	import { logger } from '$lib/utils/logger.js';

	let {
		onSelect,
		selectedMediaId
	}: {
		onSelect?: (mediaId: string) => void;
		selectedMediaId?: string | null;
	} = $props();

	const crafter = getContext<CrafterContext>(CRAFTER_CONTEXT);
	const mediaService = crafter.getMediaService();

	let mediaEntries = $state<Array<{ id: string; dataUrl: string; metadata: MediaMetadata }>>([]);
	let isLoading = $state(true);

	$effect(() => {
		loadMediaEntries();
	});

	async function loadMediaEntries() {
		isLoading = true;
		try {
			const entries = await mediaService.list();
			mediaEntries = entries.map(({ id, entry }: { id: string; entry: MediaLibraryEntry }) => ({
				id,
				dataUrl: entry.dataUrl,
				metadata: entry.metadata
			}));
		} catch (err) {
			logger.error('Failed to load media entries:', err);
		} finally {
			isLoading = false;
		}
	}

	const hasMedia = $derived(mediaEntries.length > 0);

	let showMetadataFor: string | null = $state(null);
	let mediaToDelete: string | null = $state(null);
	let deleteDialogOpen = $state(false);

	function handleSelect(mediaId: string) {
		if (onSelect) {
			onSelect(mediaId);
		}
	}

	function openDeleteDialog(mediaId: string, event: MouseEvent) {
		event.stopPropagation();
		mediaToDelete = mediaId;
		deleteDialogOpen = true;
	}

	async function confirmDelete() {
		if (!mediaToDelete) return;

		try {
			const success = await mediaService.delete(mediaToDelete);
			if (success) {
				await loadMediaEntries();
			} else {
				logger.error('Failed to delete media:', mediaToDelete);
			}
		} catch (err) {
			logger.error('Error deleting media:', err);
		} finally {
			deleteDialogOpen = false;
			mediaToDelete = null;
		}
	}

	function toggleMetadata(mediaId: string, event: MouseEvent) {
		event.stopPropagation();
		showMetadataFor = showMetadataFor === mediaId ? null : mediaId;
	}

	function formatFileSize(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	}
</script>

{#if isLoading}
	<div class="p-3">
		<div
			class="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-border p-8"
		>
			<div class="mb-2 h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
			<Text size="sm" intensity="muted" class="text-center">Loading media library...</Text>
		</div>
	</div>
{:else if !hasMedia}
	<div class="p-3">
		<div
			class="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-border p-8"
		>
			<ImageIcon class="mb-2 h-12 w-12 text-muted-foreground opacity-40" />
			<Text size="sm" intensity="muted" class="text-center">No media in library</Text>
			<Text size="xs" intensity="muted" class="mt-1 text-center"
				>Upload an image to get started</Text
			>
		</div>
	</div>
{:else}
	<div class="p-3">
		<div class="grid grid-cols-2 gap-3">
			{#each mediaEntries as media (media.id)}
				<button
					type="button"
					class="group relative aspect-square overflow-hidden rounded-md border-2 transition-all hover:border-primary focus:ring-2 focus:ring-ring focus:outline-none {selectedMediaId ===
					media.id
						? 'border-primary ring-2 ring-ring'
						: 'border-border'}"
					onclick={() => handleSelect(media.id)}
				>
					<img
						src={media.dataUrl}
						alt={media.metadata.filename}
						class="h-full w-full object-cover"
					/>

					<!-- Overlay with actions -->
					<div
						class="absolute inset-0 flex items-end bg-linear-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
					>
						<div class="flex w-full items-center justify-between p-2">
							<Button
								type="button"
								variant="ghost"
								size="sm"
								class="h-6 w-6 bg-black/50 text-white hover:bg-black/70"
								onclick={(e) => toggleMetadata(media.id, e)}
							>
								<InfoIcon class="h-3 w-3" />
							</Button>

							<Button
								type="button"
								variant="ghost"
								size="sm"
								class="h-6 w-6 bg-destructive/80 text-white hover:bg-destructive"
								onclick={(e) => openDeleteDialog(media.id, e)}
							>
								<TrashIcon class="h-3 w-3" />
							</Button>
						</div>
					</div>

					<!-- Selected indicator -->
					{#if selectedMediaId === media.id}
						<div
							class="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary"
						>
							<svg class="h-3 w-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
								<path
									fill-rule="evenodd"
									d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
									clip-rule="evenodd"
								/>
							</svg>
						</div>
					{/if}
				</button>

				<!-- Metadata panel -->
				{#if showMetadataFor === media.id}
					<div class="col-span-2 space-y-2 rounded-md border border-border bg-muted/50 p-3">
						<div class="flex items-center justify-between">
							<Text size="xs" intensity="default">Image Details</Text>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onclick={(e) => toggleMetadata(media.id, e)}
							>
								<XIcon class="h-3 w-3" />
							</Button>
						</div>

						<div class="space-y-1">
							<div class="flex justify-between">
								<Text size="xs" intensity="muted">Filename:</Text>
								<Text size="xs" intensity="default" class="max-w-[60%] truncate"
									>{media.metadata.filename}</Text
								>
							</div>
							<div class="flex justify-between">
								<Text size="xs" intensity="muted">Size:</Text>
								<Text size="xs" intensity="default">{formatFileSize(media.metadata.filesize)}</Text>
							</div>
							<div class="flex justify-between">
								<Text size="xs" intensity="muted">Dimensions:</Text>
								<Text size="xs" intensity="default"
									>{media.metadata.width} × {media.metadata.height}</Text
								>
							</div>
							<div class="flex justify-between">
								<Text size="xs" intensity="muted">Type:</Text>
								<Text size="xs" intensity="default">{media.metadata.mimeType}</Text>
							</div>
						</div>
					</div>
				{/if}
			{/each}
		</div>
	</div>
{/if}

<!-- Delete Confirmation Dialog -->
<Dialog bind:open={deleteDialogOpen}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Delete Media</DialogTitle>
			<DialogDescription>
				Are you sure you want to delete this media? This action cannot be undone.
			</DialogDescription>
		</DialogHeader>
		<DialogBody>
			{#if mediaToDelete}
				{@const media = mediaEntries.find((m) => m.id === mediaToDelete)}
				{#if media}
					<div class="space-y-2">
						<Text size="sm" intensity="muted">Media: {media.metadata.filename}</Text>
						<img
							src={media.dataUrl}
							alt={media.metadata.filename}
							class="h-32 w-32 rounded-md border border-border object-cover"
						/>
					</div>
				{/if}
			{/if}
		</DialogBody>
		<DialogFooter>
			<DialogCloseButton variant="muted">Cancel</DialogCloseButton>
			<Button variant="destructive" onclick={confirmDelete}>Delete</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
