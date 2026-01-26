<script lang="ts">
	/**
	 * Styles for this component are in richtext-input.css (co-located).
	 * Svelte <style> blocks don't work in Shadow DOM - see src/lib/styles/README.md
	 */
	import { onMount, onDestroy } from 'svelte';
	import { Editor } from '@tiptap/core';
	import type { ProseMirrorDocument } from '@ujl-framework/types';
	import { InputGroup, InputGroupAddon, InputGroupButton } from '@ujl-framework/ui';
	import { ujlRichTextExtensions } from '@ujl-framework/core';
	import BoldIcon from '@lucide/svelte/icons/bold';
	import CodeIcon from '@lucide/svelte/icons/code';

	let {
		value,
		onChange
	}: {
		value: ProseMirrorDocument | undefined;
		onChange: (value: ProseMirrorDocument) => void;
	} = $props();

	let editorElement: HTMLDivElement;
	let editor: Editor | null = $state(null);

	let isBoldActive = $state(false);
	let isCodeActive = $state(false);

	const EMPTY_DOCUMENT: ProseMirrorDocument = {
		type: 'doc',
		content: [{ type: 'paragraph', content: [] }]
	};

	// Prevents unnecessary editor updates when value reference hasn't changed
	let previousValue: ProseMirrorDocument | undefined = $state(undefined);

	onMount(() => {
		editor = new Editor({
			element: editorElement,
			extensions: ujlRichTextExtensions,
			content: value ?? EMPTY_DOCUMENT,
			onUpdate: ({ editor: e }: { editor: Editor }) => {
				const json = e.getJSON() as ProseMirrorDocument;
				previousValue = json;
				onChange(json);
				updateActiveStates(e);
			},
			onSelectionUpdate: ({ editor: e }: { editor: Editor }) => {
				updateActiveStates(e);
			}
		});
		previousValue = value;
		updateActiveStates(editor);
	});

	function updateActiveStates(e: Editor | null) {
		if (!e) return;
		isBoldActive = e.isActive('bold');
		isCodeActive = e.isActive('code');
	}

	function toggleBold() {
		editor?.commands.toggleBold();
	}

	function toggleCode() {
		editor?.commands.toggleCode();
	}

	onDestroy(() => {
		editor?.destroy();
	});

	// Sync external value changes to editor
	// Only update if value reference changed and content is actually different
	$effect(() => {
		if (editor && value) {
			// Skip if same reference (no change)
			if (value === previousValue) {
				return;
			}

			// Compare content only if reference changed
			const currentContent = editor.getJSON() as ProseMirrorDocument;
			const currentStr = JSON.stringify(currentContent);
			const newStr = JSON.stringify(value);

			if (currentStr !== newStr) {
				editor.commands.setContent(value);
				previousValue = value;
			}
		}
	});
</script>

<InputGroup
	class="h-auto focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50"
>
	<!-- Toolbar at top -->
	<InputGroupAddon align="block-start" class="">
		<InputGroupButton
			variant={isBoldActive ? 'default' : 'muted'}
			size="icon-xs"
			type="button"
			onclick={toggleBold}
			aria-label="Bold"
			title="Bold (Ctrl+B)"
		>
			<BoldIcon />
		</InputGroupButton>
		<InputGroupButton
			variant={isCodeActive ? 'default' : 'muted'}
			size="icon-xs"
			type="button"
			onclick={toggleCode}
			aria-label="Code"
			title="Code (Ctrl+E)"
		>
			<CodeIcon />
		</InputGroupButton>
	</InputGroupAddon>

	<!-- Editor -->
	<div
		bind:this={editorElement}
		data-slot="input-group-control"
		class="richtext-editor flex max-h-64 min-h-16 w-full flex-1 resize-none overflow-y-auto rounded-none border-0 p-3 pt-0 text-base shadow-none focus-visible:ring-0 md:text-sm"
	></div>
</InputGroup>
