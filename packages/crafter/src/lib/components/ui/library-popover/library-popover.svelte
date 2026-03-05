<script lang="ts">
	import { LibraryBrowser } from "../library-browser/index.js";
	import { LibraryUploader } from "../library-uploader/index.js";
	import { getContext } from "svelte";
	import { CRAFTER_CONTEXT, type CrafterContext } from "$lib/stores/index.js";

	let {
		selectedImageId,
		onSelect,
		onUploadComplete,
		onClose,
	}: {
		selectedImageId?: string | null;
		onSelect?: (imageId: string) => void;
		onUploadComplete?: (imageId: string) => void;
		onClose?: () => void;
	} = $props();

	const crafter = getContext<CrafterContext>(CRAFTER_CONTEXT);

	let libraryReloadTrigger = $state(0);

	function handleUploadComplete(imageId: string) {
		libraryReloadTrigger++;
		onUploadComplete?.(imageId);
	}
</script>

<div class="flex flex-col gap-4">
	{#if crafter.canUploadLibrary()}
		<LibraryUploader onUploadComplete={handleUploadComplete} {onClose} />
	{/if}
	<div class="max-h-[60vh] overflow-y-auto">
		{#key libraryReloadTrigger}
			<LibraryBrowser {selectedImageId} {onSelect} />
		{/key}
	</div>
</div>
