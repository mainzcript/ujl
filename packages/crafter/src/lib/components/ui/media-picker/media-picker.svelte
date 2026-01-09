<script lang="ts">
	import { Text } from '@ujl-framework/ui';
	import { getContext } from 'svelte';
	import { CRAFTER_CONTEXT, type CrafterContext } from '$lib/components/app/context.js';
	import ImageIcon from '@lucide/svelte/icons/image';
	import { logger } from '$lib/utils/logger.js';

	let {
		value,
		fieldName,
		nodeId
	}: {
		value: string | number | null | undefined;
		fieldName?: string;
		nodeId?: string;
	} = $props();

	const crafter = getContext<CrafterContext>(CRAFTER_CONTEXT);
	const mediaService = crafter.getMediaService();

	let previewUrl = $state<string | null>(null);
	let isLoadingPreview = $state(false);

	$effect(() => {
		if (!value) {
			previewUrl = null;
			return;
		}

		// Convert numeric IDs to strings (backend services like Payload return numbers)
		const mediaId = String(value);
		isLoadingPreview = true;
		mediaService
			.get(mediaId)
			.then((entry) => {
				previewUrl = entry?.dataUrl ?? null;
			})
			.catch((err) => {
				logger.error('[MediaPicker] Failed to load media preview:', err);
				previewUrl = null;
			})
			.finally(() => {
				isLoadingPreview = false;
			});
	});

	function openMediaLibrary() {
		crafter.setMediaLibraryViewActive(true, {
			fieldName: fieldName || '',
			nodeId: nodeId || '',
			currentValue: value || null
		});
	}
</script>

{#if isLoadingPreview}
	<div
		class="flex h-32 w-full items-center justify-center rounded-md border border-border bg-muted/30"
	>
		<div class="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
	</div>
{:else if previewUrl}
	<button
		type="button"
		class="relative h-32 w-full overflow-hidden rounded-md border border-border transition-all hover:border-primary focus:ring-2 focus:ring-ring focus:outline-none"
		onclick={openMediaLibrary}
	>
		<img src={previewUrl} alt="" class="h-full w-full object-cover" />
	</button>
{:else}
	<button
		type="button"
		class="flex w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-border p-8 transition-colors hover:bg-muted/50 focus:ring-2 focus:ring-ring focus:outline-none"
		onclick={openMediaLibrary}
	>
		<ImageIcon class="mb-2 h-12 w-12 text-muted-foreground" />
		<Text size="sm" intensity="muted" class="text-center">Select an image</Text>
		<Text size="xs" intensity="muted" class="mt-1 text-center">Click to browse library</Text>
	</button>
{/if}
