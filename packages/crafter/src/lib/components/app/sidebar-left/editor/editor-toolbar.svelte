<script lang="ts">
	import { Button } from '@ujl-framework/ui';
	import ScissorsIcon from '@lucide/svelte/icons/scissors';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import ClipboardPasteIcon from '@lucide/svelte/icons/clipboard-paste';
	import DeleteIcon from '@lucide/svelte/icons/trash-2';

	let {
		onCopy,
		onCut,
		onPaste,
		onDelete,
		canCopy = false,
		canCut = false,
		canPaste = false
	}: {
		onCopy: () => void;
		onCut: () => void;
		onPaste: () => void;
		onDelete: () => void;
		canCopy?: boolean;
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
		title="Cut selected component (Ctrl+X)"
	>
		<ScissorsIcon class="size-4" />
	</Button>

	<Button
		variant="ghost"
		size="sm"
		disabled={!canCopy}
		onclick={onCopy}
		title="Copy selected component (Ctrl+C)"
	>
		<CopyIcon class="size-4" />
	</Button>

	<Button
		variant="ghost"
		size="sm"
		disabled={!canPaste}
		onclick={onPaste}
		title="Paste component (Ctrl+V)"
	>
		<ClipboardPasteIcon class="size-4" />
	</Button>

	<Button
		variant="ghost"
		size="sm"
		disabled={!canCut}
		onclick={onDelete}
		title="Delete component (Del)"
	>
		<DeleteIcon class="size-4" />
	</Button>
</div>
