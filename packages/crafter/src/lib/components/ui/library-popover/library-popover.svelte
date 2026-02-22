<script lang="ts">
	import { LibraryBrowser } from "../library-browser/index.js";
	import { LibraryUploader } from "../library-uploader/index.js";

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

	let libraryReloadTrigger = $state(0);

	function handleUploadComplete(imageId: string) {
		libraryReloadTrigger++;
		onUploadComplete?.(imageId);
	}
</script>

<div class="flex flex-col gap-4">
	<LibraryUploader onUploadComplete={handleUploadComplete} {onClose} />
	<div class="max-h-[60vh] overflow-y-auto">
		{#key libraryReloadTrigger}
			<LibraryBrowser {selectedImageId} {onSelect} />
		{/key}
	</div>
</div>
