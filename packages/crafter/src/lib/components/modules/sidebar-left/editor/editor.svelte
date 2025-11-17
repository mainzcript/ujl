<script lang="ts">
	import type { UJLCModuleObject } from '@ujl-framework/types';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import NavTree from './nav-tree.svelte';
	import EditorToolbar from './editor-toolbar.svelte';
	import { getDocumentContext } from '$lib/components/modules/context/document-context.svelte.ts';
	import {
		findNodeById,
		findParentOfNode,
		removeNodeFromTree,
		insertNodeIntoSlot,
		insertNodeAtPosition,
		getFirstSlotName,
		hasSlots
	} from './ujlc-tree-utils.js';

	// Get document context from parent
	const documentContext = getDocumentContext();

	// selected node id from URL
	const selectedNodeId = $derived($page.url.searchParams.get('selected'));

	// selected node object from context
	const selectedNode = $derived(
		selectedNodeId ? findNodeById(documentContext.root, selectedNodeId) : null
	);

	// Cut Button is enabled if a node is selected and it's not the root node
	const canCut = $derived(selectedNodeId !== null);

	// paste button enabled if:
	// - Clipboard is not empty
	// - node is selected
	// - selected Node has Slots
	const canPaste = $derived(
		documentContext.hasClipboard && selectedNode !== null && hasSlots(selectedNode)
	);

	/**
	 * Cut Handler - cut selected Node to Clipboard
	 */
	function handleCut() {
		if (!selectedNodeId) return;

		const node = findNodeById(documentContext.root, selectedNodeId);
		if (!node) return;

		// check if node is root
		const parentInfo = findParentOfNode(documentContext.root, selectedNodeId);
		if (!parentInfo || !parentInfo.parent) {
			console.warn('Cannot cut root node');
			return;
		}

		// save node to context clipboard
		documentContext.cutNode(node);

		// remove node from tree
		documentContext.root = removeNodeFromTree(documentContext.root, selectedNodeId);

		console.log('Cut node:', node.meta.id);
	}

	/**
	 * Paste Handler - paste node from Clipboard into selected Node
	 */
	function handlePaste() {
		const clipboardNode = documentContext.getClipboard();
		if (!clipboardNode || !selectedNodeId) return;

		const targetNode = findNodeById(documentContext.root, selectedNodeId);
		if (!targetNode) return;

		// find first slot name of target node
		const slotName = getFirstSlotName(targetNode);
		if (!slotName) {
			console.warn('Target node has no slots');
			return;
		}

		// add node to target slot
		documentContext.root = insertNodeIntoSlot(
			documentContext.root,
			selectedNodeId,
			slotName,
			clipboardNode
		);

		console.log('Pasted node into:', selectedNodeId, 'slot:', slotName);

		// clear Clipboard
		documentContext.clearClipboard();
	}

	/**
	 * Delete Handler - delete selected Node without saving to Clipboard
	 */
	function handleDelete() {
		if (!selectedNodeId) return;

		const node = findNodeById(documentContext.root, selectedNodeId);
		if (!node) return;

		// check if node is root
		const parentInfo = findParentOfNode(documentContext.root, selectedNodeId);
		if (!parentInfo || !parentInfo.parent) {
			console.warn('Cannot delete root node');
			return;
		}

		// remove node from tree
		documentContext.root = removeNodeFromTree(documentContext.root, selectedNodeId);

		console.log('Deleted node:', node.meta.id);
	}

	/**
	 * Keyboard Event Handler
	 */
	function handleKeyDown(event: KeyboardEvent) {
		// Check for Ctrl+C or Cmd+C (Mac)
		if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
			// Prevent default browser copy behavior
			if (canCut) {
				event.preventDefault();
				handleCut();
			}
		}

		// Check for Ctrl+V or Cmd+V (Mac)
		if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
			// Prevent default browser paste behavior
			if (canPaste) {
				event.preventDefault();
				handlePaste();
			}
		}

		// Optional: Ctrl+X for explicit cut (in addition to Ctrl+C)
		if ((event.ctrlKey || event.metaKey) && event.key === 'x') {
			if (canCut) {
				event.preventDefault();
				handleCut();
			}
		}

		// Delete key to remove selected node
		if (event.key === 'Delete') {
			if (canCut) {
				// same permission check as cut
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
	function handleNodeMove(nodeId: string, targetId: string): boolean {
		// Find the node and target
		const node = findNodeById(documentContext.root, nodeId);
		const targetNode = findNodeById(documentContext.root, targetId);

		if (!node || !targetNode) {
			console.warn('Node or target not found');
			return false;
		}

		// Check if node is root
		const parentInfo = findParentOfNode(documentContext.root, nodeId);
		if (!parentInfo || !parentInfo.parent) {
			console.warn('Cannot move root node');
			return false;
		}

		// Check if target can accept children (has slots)
		if (!hasSlots(targetNode)) {
			console.warn('Target node has no slots - cannot accept children');
			return false;
		}

		// Check if trying to move node into itself or its own descendants
		if (isDescendant(node, targetId)) {
			console.warn('Cannot move node into itself or its descendants');
			return false;
		}

		// Get first slot of target
		const slotName = getFirstSlotName(targetNode);
		if (!slotName) {
			console.warn('Target node has no valid slot');
			return false;
		}

		// Perform the move: remove from old position, insert at new position
		const removedTree = removeNodeFromTree(documentContext.root, nodeId);
		documentContext.root = insertNodeIntoSlot(removedTree, targetId, slotName, node);

		console.log('Moved node:', nodeId, 'into:', targetId, 'slot:', slotName);
		return true;
	}

	/**
	 * Checks if a node is a descendant of the target
	 */
	function isDescendant(node: UJLCModuleObject, targetId: string): boolean {
		if (node.meta.id === targetId) return true;

		if (!node.slots) return false;

		for (const slotContent of Object.values(node.slots)) {
			for (const child of slotContent) {
				if (isDescendant(child, targetId)) return true;
			}
		}

		return false;
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
		// Find both nodes
		const node = findNodeById(documentContext.root, nodeId);
		const targetNode = findNodeById(documentContext.root, targetId);

		if (!node || !targetNode) {
			console.warn('Node or target not found');
			return false;
		}

		// Get parent info for both nodes
		const nodeParentInfo = findParentOfNode(documentContext.root, nodeId);
		const targetParentInfo = findParentOfNode(documentContext.root, targetId);

		if (!nodeParentInfo || !nodeParentInfo.parent) {
			console.warn('Cannot reorder root node');
			return false;
		}

		if (!targetParentInfo || !targetParentInfo.parent) {
			console.warn('Cannot reorder relative to root node');
			return false;
		}

		// Check if nodes are siblings (same parent and slot)
		if (
			nodeParentInfo.parent.meta.id !== targetParentInfo.parent.meta.id ||
			nodeParentInfo.slotName !== targetParentInfo.slotName
		) {
			console.warn('Nodes must be siblings to reorder');
			return false;
		}

		// Calculate new position
		let newPosition = targetParentInfo.index;
		if (position === 'after') {
			newPosition += 1;
		}

		// Adjust position if moving within same parent and moving down
		if (nodeParentInfo.index < newPosition) {
			newPosition -= 1;
		}

		// Perform the reorder: remove from old position, insert at new position
		const removedTree = removeNodeFromTree(documentContext.root, nodeId);
		documentContext.root = insertNodeAtPosition(
			removedTree,
			nodeParentInfo.parent.meta.id,
			nodeParentInfo.slotName,
			node,
			newPosition
		);

		console.log('Reordered node:', nodeId, position, targetId, 'at position:', newPosition);
		return true;
	}
</script>

<div data-slot="sidebar-group" data-sidebar="group" class="relative flex w-full min-w-0 flex-col">
	<EditorToolbar
		onCut={handleCut}
		onPaste={handlePaste}
		onDelete={handleDelete}
		{canCut}
		{canPaste}
	/>
	<div class="p-2">
		<NavTree
			nodes={documentContext.root}
			onNodeMove={handleNodeMove}
			onNodeReorder={handleNodeReorder}
		/>
	</div>
</div>
