<script lang="ts">
	import { Button, Kbd, KbdGroup } from "@ujl-framework/ui";
	import CopyIcon from "@lucide/svelte/icons/copy";
	import ScissorsIcon from "@lucide/svelte/icons/scissors";
	import ClipboardPasteIcon from "@lucide/svelte/icons/clipboard-paste";
	import DeleteIcon from "@lucide/svelte/icons/trash-2";
	import PlusIcon from "@lucide/svelte/icons/plus";
	import { getModifierKey } from "$lib/utils/platform.js";

	interface Props {
		onCopy: () => void;
		onCut: () => void;
		onPaste: () => void;
		onDelete: () => void;
		onInsert: () => void;
		onClose?: () => void;
		canCopy?: boolean;
		canCut?: boolean;
		canPaste?: boolean;
		canInsert?: boolean;
		canDelete?: boolean;
	}

	let {
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
		canDelete = false,
	}: Props = $props();

	const modifierKey = $derived(getModifierKey());
</script>

<div class="flex flex-col">
	{#if canInsert}
		<Button
			variant="ghost"
			size="sm"
			disabled={!canInsert}
			onclick={() => {
				onInsert();
				onClose?.();
			}}
			class="justify-start gap-2"
			data-crafter="context-menu-add"
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
			onclick={() => {
				onCut();
				onClose?.();
			}}
			class="justify-start gap-2"
			data-crafter="context-menu-cut"
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
			onclick={() => {
				onCopy();
				onClose?.();
			}}
			class="justify-start gap-2"
			data-crafter="context-menu-copy"
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
			onclick={() => {
				onPaste();
				onClose?.();
			}}
			class="justify-start gap-2"
			data-crafter="context-menu-paste"
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
			onclick={() => {
				onDelete();
				onClose?.();
			}}
			class="justify-start gap-2 text-destructive hover:text-destructive"
			data-crafter="context-menu-delete"
		>
			<DeleteIcon class="size-4" />
			<span>Delete</span>
		</Button>
	{/if}
</div>
