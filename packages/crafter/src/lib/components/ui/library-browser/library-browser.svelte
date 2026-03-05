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
		DialogCloseButton,
	} from "@ujl-framework/ui";
	import { getContext } from "svelte";
	import { CRAFTER_CONTEXT, type CrafterContext } from "$lib/stores/index.js";
	import ImageIcon from "@lucide/svelte/icons/image";
	import TrashIcon from "@lucide/svelte/icons/trash-2";
	import { logger } from "$lib/utils/logger.js";

	let {
		onSelect,
		selectedImageId,
	}: {
		onSelect?: (imageId: string) => void;
		selectedImageId?: string | null;
	} = $props();

	const crafter = getContext<CrafterContext>(CRAFTER_CONTEXT);

	// Use store state directly - reactive updates when items change
	let imageEntries = $derived(crafter.libraryItems);
	let isLoading = $derived(crafter.libraryLoading);
	let initialLoadRequested = $state(false);

	// Capability checks for conditional UI
	let canDelete = $derived(crafter.canDeleteLibrary());

	// Initial load on mount
	$effect(() => {
		if (!initialLoadRequested && crafter.libraryItems.length === 0 && !crafter.libraryLoading) {
			initialLoadRequested = true;
			crafter.loadMoreLibraryItems(50).catch((err) => {
				logger.error("[LibraryBrowser] Initial load failed:", err);
			});
		}
	});

	const hasImages = $derived(imageEntries.length > 0);

	let imageToDelete: string | null = $state(null);
	let deleteDialogOpen = $state(false);

	async function handleSelect(imageId: string) {
		const persistedId = await crafter.selectLibraryAsset(imageId);
		if (onSelect) {
			onSelect(persistedId);
		}
	}

	function openDeleteDialog(imageId: string, event: MouseEvent) {
		event.stopPropagation();
		imageToDelete = imageId;
		deleteDialogOpen = true;
	}

	async function confirmDelete() {
		if (!imageToDelete) return;

		try {
			await crafter.deleteLibraryAsset(imageToDelete);
			// Update local list
			imageEntries = crafter.libraryItems;
		} catch (err) {
			logger.error("Error deleting image:", err);
		} finally {
			deleteDialogOpen = false;
			imageToDelete = null;
		}
	}

	// Load more on scroll
	async function handleScroll(e: Event) {
		const container = e.target as HTMLElement;
		if (
			container.scrollHeight - container.scrollTop <= container.clientHeight + 100 &&
			crafter.libraryHasMore &&
			!crafter.libraryLoading
		) {
			await crafter.loadMoreLibraryItems();
			imageEntries = crafter.libraryItems;
		}
	}
</script>

{#if isLoading}
	<div class="p-3">
		<div
			class="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-border p-8"
		>
			<div class="mb-2 h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
			<Text size="sm" intensity="muted" class="text-center">Loading image library...</Text>
		</div>
	</div>
{:else if !hasImages}
	<div class="p-3">
		<div
			class="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-border p-8"
		>
			<ImageIcon class="mb-2 h-12 w-12 text-muted-foreground opacity-40" />
			<Text size="sm" intensity="muted" class="text-center">No images in library</Text>
			<Text size="xs" intensity="muted" class="mt-1 text-center"
				>Upload an image to get started</Text
			>
		</div>
	</div>
{:else}
	<div class="p-3">
		<div class="grid max-h-[400px] grid-cols-3 gap-3 overflow-y-auto" onscroll={handleScroll}>
			{#each imageEntries as image (image.id)}
				<button
					type="button"
					class="group relative aspect-square overflow-hidden rounded-md border-2 transition-all hover:border-primary focus:ring-2 focus:ring-ring focus:outline-none {selectedImageId ===
					image.id
						? 'border-primary ring-2 ring-ring'
						: 'border-border'}"
					onclick={() => handleSelect(image.id)}
				>
					<img
						src={image.img.src}
						alt={image.meta?.filename ?? "Image"}
						loading="lazy"
						class="h-full w-full object-cover"
					/>

					<!-- Overlay with actions (only when delete is supported) -->
					{#if canDelete}
						<div
							class="absolute inset-0 flex items-end bg-linear-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
						>
							<div class="flex w-full items-center justify-end p-2">
								<Button
									type="button"
									variant="ghost"
									size="sm"
									class="h-6 w-6 bg-destructive/80 text-white hover:bg-destructive"
									onclick={(e) => openDeleteDialog(image.id, e)}
								>
									<TrashIcon class="h-3 w-3" />
								</Button>
							</div>
						</div>
					{/if}

					<!-- Selected indicator -->
					{#if selectedImageId === image.id}
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
			{/each}
			{#if crafter.libraryLoading}
				<div class="col-span-3 flex justify-center py-4">
					<div class="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
				</div>
			{/if}
		</div>
	</div>
{/if}

<!-- Delete Confirmation Dialog -->
<Dialog bind:open={deleteDialogOpen}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Delete Image</DialogTitle>
			<DialogDescription>
				Are you sure you want to delete this image? This action cannot be undone.
			</DialogDescription>
		</DialogHeader>
		<DialogBody>
			{#if imageToDelete}
				{@const image = imageEntries.find((m) => m.id === imageToDelete)}
				{#if image}
					<div class="space-y-2">
						<Text size="sm" intensity="muted">Image: {image.meta?.filename ?? "Unknown"}</Text>
						<img
							src={image.img.src}
							alt={image.meta?.filename ?? "Image"}
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
