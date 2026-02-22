<script lang="ts">
	import { Text, Popover, PopoverTrigger, PopoverContent } from "@ujl-framework/ui";
	import { getContext } from "svelte";
	import { CRAFTER_CONTEXT, type CrafterContext } from "$lib/stores/index.js";
	import type { AssetEntry } from "@ujl-framework/types";
	import ImageIcon from "@lucide/svelte/icons/image";
	import { logger } from "$lib/utils/logger.js";
	import { LibraryPopover } from "../library-popover/index.js";

	let {
		value,
		onChange,
	}: {
		value: string | number | null | undefined;
		onChange?: (value: string | number | null) => void;
	} = $props();

	const crafter = getContext<CrafterContext>(CRAFTER_CONTEXT);
	const library = $derived(crafter.library);

	let popoverOpen = $state(false);

	function handleImageSelect(imageId: string) {
		onChange?.(imageId);
		popoverOpen = false;
	}

	let previewUrl = $state<string | null>(null);
	let previewAlt = $state<string>("Selected image preview");
	let isLoadingPreview = $state(false);

	$effect(() => {
		if (!value) {
			previewUrl = null;
			previewAlt = "Selected image preview";
			return;
		}

		// Convert numeric IDs to strings (backend services like Payload return numbers)
		const imageId = String(value);
		isLoadingPreview = true;
		library
			.get(imageId)
			.then((entry: AssetEntry | null) => {
				previewUrl = entry?.src ?? null;
				previewAlt = entry?.metadata?.filename ?? "Selected image preview";
			})
			.catch((err: unknown) => {
				logger.error("[ImagePicker] Failed to load image preview:", err);
				previewUrl = null;
				previewAlt = "Selected image preview";
			})
			.finally(() => {
				isLoadingPreview = false;
			});
	});
</script>

<Popover bind:open={popoverOpen}>
	{#if isLoadingPreview}
		<PopoverTrigger
			class="flex h-32 w-full items-center justify-center rounded-md border border-border bg-muted/30"
		>
			<div class="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
		</PopoverTrigger>
	{:else if previewUrl}
		<PopoverTrigger
			class="relative h-32 w-full overflow-hidden rounded-md border border-border transition-all hover:border-primary focus:ring-2 focus:ring-ring focus:outline-none"
		>
			<img src={previewUrl} alt={previewAlt} class="h-full w-full object-cover" />
		</PopoverTrigger>
	{:else}
		<PopoverTrigger
			class="flex w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-border p-8 transition-colors hover:bg-muted/50 focus:ring-2 focus:ring-ring focus:outline-none"
		>
			<ImageIcon class="mb-2 h-12 w-12 text-muted-foreground" />
			<Text size="sm" intensity="muted" class="text-center">Select an image</Text>
			<Text size="xs" intensity="muted" class="mt-1 text-center">Click to browse library</Text>
		</PopoverTrigger>
	{/if}
	<PopoverContent class="max-h-[80vh] w-sm max-w-[80vw]">
		<LibraryPopover
			selectedImageId={value != null ? String(value) : null}
			onSelect={handleImageSelect}
			onClose={() => (popoverOpen = false)}
		/>
	</PopoverContent>
</Popover>
