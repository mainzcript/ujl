<script lang="ts">
	import { Button } from '@ujl-framework/ui';
	import ScissorsIcon from '@lucide/svelte/icons/scissors';
	import ClipboardPasteIcon from '@lucide/svelte/icons/clipboard-paste';
	import DeleteIcon from '@lucide/svelte/icons/trash-2';

	let {
		onCut,
		onPaste,
		onDelete,
		canCut = false,
		canPaste = false
	}: {
		onCut: () => void;
		onPaste: () => void;
		onDelete: () => void;
		canCut?: boolean;
		canPaste?: boolean;
	} = $props();
</script>

<div class="flex items-center gap-2 border-b border-sidebar-border p-2">
	<Button
		variant="ghost"
		size="sm"
		disabled={!canCut}
		onclick={onCut}
		title="Cut selected component"
	>
		<ScissorsIcon class="size-4" />
		<span>Cut</span>
	</Button>

	<Button variant="ghost" size="sm" disabled={!canPaste} onclick={onPaste} title="Paste component">
		<ClipboardPasteIcon class="size-4" />
		<span>Paste</span>
	</Button>

	<Button variant="ghost" size="sm" disabled={!canCut} onclick={onDelete} title="Delete component">
		<DeleteIcon class="size-4" />
		<span>Delete</span>
	</Button>
</div>
