<script lang="ts">
	import { Button } from '@ujl-framework/ui';
	import ScissorsIcon from '@lucide/svelte/icons/scissors';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import ClipboardPasteIcon from '@lucide/svelte/icons/clipboard-paste';
	import DeleteIcon from '@lucide/svelte/icons/trash-2';

	let {
		nodeId,
		onCopy,
		onCut,
		onPaste,
		onDelete,
		canCopy = false,
		canCut = false,
		canPaste = false
	}: {
		nodeId: string;
		onCopy: (nodeId: string) => void;
		onCut: (nodeId: string) => void;
		onPaste: (nodeId: string) => void;
		onDelete: (nodeId: string) => void;
		canCopy?: boolean;
		canCut?: boolean;
		canPaste?: boolean;
	} = $props();
</script>

<div class="flex flex-col">
	<Button
		variant="ghost"
		size="sm"
		disabled={!canCut}
		onclick={() => onCut(nodeId)}
		class="justify-start gap-2"
	>
		<ScissorsIcon class="size-4" />
		<span>Cut</span>
		<span class="ml-auto text-xs text-muted-foreground">Ctrl+X</span>
	</Button>

	<Button
		variant="ghost"
		size="sm"
		disabled={!canCopy}
		onclick={() => onCopy(nodeId)}
		class="justify-start gap-2"
	>
		<CopyIcon class="size-4" />
		<span>Copy</span>
		<span class="ml-auto text-xs text-muted-foreground">Ctrl+C</span>
	</Button>

	<Button
		variant="ghost"
		size="sm"
		disabled={!canPaste}
		onclick={() => onPaste(nodeId)}
		class="justify-start gap-2"
	>
		<ClipboardPasteIcon class="size-4" />
		<span>Paste</span>
		<span class="ml-auto text-xs text-muted-foreground">Ctrl+V</span>
	</Button>

	<div class="my-1 h-px bg-border"></div>

	<Button
		variant="ghost"
		size="sm"
		disabled={!canCut}
		onclick={() => onDelete(nodeId)}
		class="justify-start gap-2 text-destructive hover:text-destructive"
	>
		<DeleteIcon class="size-4" />
		<span>Delete</span>
		<span class="ml-auto text-xs text-muted-foreground">Del</span>
	</Button>
</div>
