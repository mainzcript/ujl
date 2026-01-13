<script lang="ts">
	import { Button, Kbd, KbdGroup } from '@ujl-framework/ui';
	import ScissorsIcon from '@lucide/svelte/icons/scissors';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import ClipboardPasteIcon from '@lucide/svelte/icons/clipboard-paste';
	import DeleteIcon from '@lucide/svelte/icons/trash-2';
	import BackspaceIcon from '@lucide/svelte/icons/delete';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import { testId } from '$lib/utils/test-attrs.ts';
	import { getModifierKey } from '$lib/utils/platform.ts';

	let {
		nodeId,
		onCopy,
		onCut,
		onPaste,
		onDelete,
		onInsert,
		onClose,
		canCopy = false,
		canCut = false,
		canPaste = false,
		canInsert = false,
		canDelete = false
	}: {
		nodeId: string;
		onCopy: (nodeId: string) => void;
		onCut: (nodeId: string) => void;
		onPaste: (nodeId: string) => void;
		onDelete: (nodeId: string) => void;
		onInsert: (nodeId: string) => void;
		onClose?: () => void;
		canCopy?: boolean;
		canCut?: boolean;
		canPaste?: boolean;
		canInsert?: boolean;
		canDelete?: boolean;
	} = $props();

	const modifierKey = $derived(getModifierKey());
</script>

<div class="flex flex-col">
	{#if canInsert}
		<Button
			variant="ghost"
			size="sm"
			disabled={!canInsert}
			onclick={() => {
				onInsert(nodeId);
				onClose?.();
			}}
			class="justify-start gap-2"
			{...testId('context-menu-add')}
		>
			<PlusIcon class="size-4" />
			<span>Add</span>
			<span class="ml-auto">
				<KbdGroup>
					<Kbd>{modifierKey} I</Kbd>
				</KbdGroup>
			</span>
		</Button>
		{#if canCopy || canCut || canPaste}
			<div class="my-1 h-px bg-border"></div>
		{/if}
	{/if}

	{#if canCut}
		<Button
			variant="ghost"
			size="sm"
			disabled={!canCut}
			onclick={() => onCut(nodeId)}
			class="justify-start gap-2"
			{...testId('context-menu-cut')}
		>
			<ScissorsIcon class="size-4" />
			<span>Cut</span>
			<span class="ml-auto">
				<KbdGroup>
					<Kbd>{modifierKey} X</Kbd>
				</KbdGroup>
			</span>
		</Button>
	{/if}

	{#if canCopy}
		<Button
			variant="ghost"
			size="sm"
			disabled={!canCopy}
			onclick={() => onCopy(nodeId)}
			class="justify-start gap-2"
			{...testId('context-menu-copy')}
		>
			<CopyIcon class="size-4" />
			<span>Copy</span>
			<span class="ml-auto">
				<KbdGroup>
					<Kbd>{modifierKey} C</Kbd>
				</KbdGroup>
			</span>
		</Button>
	{/if}

	{#if canPaste}
		<Button
			variant="ghost"
			size="sm"
			disabled={!canPaste}
			onclick={() => onPaste(nodeId)}
			class="justify-start gap-2"
			{...testId('context-menu-paste')}
		>
			<ClipboardPasteIcon class="size-4" />
			<span>Paste</span>
			<span class="ml-auto">
				<KbdGroup>
					<Kbd>{modifierKey} V</Kbd>
				</KbdGroup>
			</span>
		</Button>
	{/if}

	{#if canDelete}
		<div class="my-1 h-px bg-border"></div>
		<Button
			variant="ghost"
			size="sm"
			disabled={!canDelete}
			onclick={() => onDelete(nodeId)}
			class="justify-start gap-2 text-destructive hover:text-destructive"
			{...testId('context-menu-delete')}
		>
			<DeleteIcon class="size-4" />
			<span>Delete</span>
			<span class="ml-auto">
				<BackspaceIcon class="size-3.5" />
			</span>
		</Button>
	{/if}
</div>
