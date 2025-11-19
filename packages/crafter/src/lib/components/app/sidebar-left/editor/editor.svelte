<script lang="ts">
	import type { UJLCModuleObject, UJLCSlotObject } from '@ujl-framework/types';
	import { page } from '$app/stores';
	import { onMount, getContext } from 'svelte';
	import NavTree from './nav-tree.svelte';
	import EditorToolbar from './editor-toolbar.svelte';
	import { CRAFTER_CONTEXT, type CrafterContext } from '../../context.js';
	import { findNodeById, hasSlots } from './ujlc-tree-utils.js';

	let {
		slot
	}: {
		slot: UJLCSlotObject;
	} = $props();

	// Get CrafterContext for mutations
	const crafter = getContext<CrafterContext>(CRAFTER_CONTEXT);

	// Local clipboard state
	let clipboard = $state<UJLCModuleObject | null>(null);

	// Selected node id from URL
	const selectedNodeId = $derived($page.url.searchParams.get('selected'));

	// Selected node object from current slot
	const selectedNode = $derived(selectedNodeId ? findNodeById(slot, selectedNodeId) : null);

	// Cut button enabled if a node is selected
	const canCut = $derived(selectedNodeId !== null);

	// Copy button enabled if a node is selected (same as cut)
	const canCopy = $derived(selectedNodeId !== null);

	// Paste button enabled if clipboard has content, node is selected, and node has slots
	const canPaste = $derived(clipboard !== null && selectedNode !== null && hasSlots(selectedNode));

	/**
	 * Copy Handler - copy selected node to clipboard (without removing)
	 */
	function handleCopy() {
		if (!selectedNodeId) return;

		const copiedNode = crafter.operations.copyNode(selectedNodeId);
		if (copiedNode) {
			clipboard = copiedNode;
		}
	}

	/**
	 * Cut Handler - cut selected node to clipboard
	 */
	function handleCut() {
		if (!selectedNodeId) return;

		const cutNode = crafter.operations.cutNode(selectedNodeId);
		if (cutNode) {
			clipboard = cutNode;
		}
	}

	/**
	 * Paste Handler - paste node from clipboard into selected node
	 */
	function handlePaste() {
		if (!clipboard || !selectedNodeId) return;

		const success = crafter.operations.pasteNode(clipboard, selectedNodeId);
		if (success) {
			clipboard = null;
		}
	}

	/**
	 * Delete Handler - delete selected node without saving to clipboard
	 */
	function handleDelete() {
		if (!selectedNodeId) return;
		crafter.operations.deleteNode(selectedNodeId);
	}

	/**
	 * Keyboard Event Handler
	 */
	function handleKeyDown(event: KeyboardEvent) {
		// Ctrl/Cmd + C for copy
		if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
			if (canCopy) {
				event.preventDefault();
				handleCopy();
			}
		}

		// Ctrl/Cmd + V for paste
		if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
			if (canPaste) {
				event.preventDefault();
				handlePaste();
			}
		}

		// Ctrl/Cmd + X for cut
		if ((event.ctrlKey || event.metaKey) && event.key === 'x') {
			if (canCut) {
				event.preventDefault();
				handleCut();
			}
		}

		// Delete key to remove selected node
		if (event.key === 'Delete') {
			if (canCut) {
				event.preventDefault();
				handleDelete();
			}
		}
	}

	// Add keyboard event listener on mount
	onMount(() => {
		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	});

	/**
	 * Move Handler for Drag & Drop
	 * Returns true if move was successful, false if rejected
	 */
	function handleNodeMove(nodeId: string, targetId: string, slotName?: string): boolean {
		return crafter.operations.moveNode(nodeId, targetId, slotName);
	}

	/**
	 * Reorder Handler for Drag & Drop within same parent
	 * Returns true if reorder was successful, false if rejected
	 */
	function handleNodeReorder(
		nodeId: string,
		targetId: string,
		position: 'before' | 'after'
	): boolean {
		return crafter.operations.reorderNode(nodeId, targetId, position);
	}
</script>

<div data-slot="sidebar-group" data-sidebar="group" class="relative flex w-full min-w-0 flex-col">
	<EditorToolbar
		onCopy={handleCopy}
		onCut={handleCut}
		onPaste={handlePaste}
		onDelete={handleDelete}
		{canCopy}
		{canCut}
		{canPaste}
	/>
	<div class="p-2">
		<NavTree nodes={slot} onNodeMove={handleNodeMove} onNodeReorder={handleNodeReorder} />
	</div>
</div>
