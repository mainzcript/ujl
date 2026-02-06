<script lang="ts">
	import { ImageLibraryBrowser } from "../image-library-browser/index.js";
	import { ImageLibraryUploader } from "../image-library-uploader/index.js";

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

	let imageReloadTrigger = $state(0);

	function handleUploadComplete(imageId: string) {
		imageReloadTrigger++;
		onUploadComplete?.(imageId);
	}
</script>

<div class="flex flex-col gap-4">
	<ImageLibraryUploader onUploadComplete={handleUploadComplete} {onClose} />
	<div class="max-h-[60vh] overflow-y-auto">
		{#key imageReloadTrigger}
			<ImageLibraryBrowser {selectedImageId} {onSelect} />
		{/key}
	</div>
</div>
