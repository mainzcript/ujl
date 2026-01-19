<script lang="ts">
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

<style>
	/* ProseMirror editor content */
	.richtext-editor :global(.ProseMirror) {
		outline: none;
		min-height: calc(4rem - 1rem); /* Container min-height minus padding */
		width: 100%;
		font-size: inherit;
		line-height: 1.5;
		color: oklch(var(--foreground));
	}

	/*
	 * Focus styles for ProseMirror are defined in bundle.css (not here)
	 * because Svelte component styles don't reliably inject into Shadow DOM.
	 * See: packages/crafter/src/lib/styles/bundle.css
	 */

	/* Placeholder styling */
	.richtext-editor :global(.ProseMirror p.is-editor-empty:first-child::before) {
		color: oklch(var(--muted-foreground));
		content: 'Enter text...';
		float: left;
		height: 0;
		pointer-events: none;
	}

	/* Typography adjustments for ProseMirror content */
	.richtext-editor :global(.ProseMirror p) {
		margin: 0;
		margin-bottom: 0.5rem;
	}

	.richtext-editor :global(.ProseMirror p:last-child) {
		margin-bottom: 0;
	}

	.richtext-editor :global(.ProseMirror h1),
	.richtext-editor :global(.ProseMirror h2),
	.richtext-editor :global(.ProseMirror h3),
	.richtext-editor :global(.ProseMirror h4),
	.richtext-editor :global(.ProseMirror h5),
	.richtext-editor :global(.ProseMirror h6) {
		margin-top: 0.75rem;
		margin-bottom: 0.5rem;
		font-weight: 600;
	}

	.richtext-editor :global(.ProseMirror ul),
	.richtext-editor :global(.ProseMirror ol) {
		margin: 0.5rem 0;
		padding-left: 1.5rem;
	}

	.richtext-editor :global(.ProseMirror blockquote) {
		margin: 0.5rem 0;
		padding-left: 1rem;
		border-left: 2px solid oklch(var(--border));
	}
</style>
