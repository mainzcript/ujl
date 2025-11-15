<script lang="ts">
	import type { UJLCModuleObject } from '@ujl-framework/types';
	import { page } from '$app/stores';
	import NavTree from './nav-tree.svelte';
	import EditorToolbar from './editor-toolbar.svelte';
	import {
		findNodeById,
		findParentOfNode,
		removeNodeFromTree,
		insertNodeIntoSlot,
		getFirstSlotName,
		hasSlots
	} from './ujlc-tree-utils.js';

	let { ujlcData = $bindable() }: { ujlcData: UJLCModuleObject[] } = $props();

	// Clipboard State
	let clipboardNode = $state<UJLCModuleObject | null>(null);

	// selected node id from URL
	const selectedNodeId = $derived($page.url.searchParams.get('selected'));

	// selected node object
	const selectedNode = $derived(selectedNodeId ? findNodeById(ujlcData, selectedNodeId) : null);

	// Cut Button is enabled if a node is selected and it's not the root node
	const canCut = $derived(selectedNodeId !== null);

	// paste button enabled if:
	// - Clipboard is not empty
	// - node is selected
	// - selected Node has Slots
	const canPaste = $derived(
		clipboardNode !== null && selectedNode !== null && hasSlots(selectedNode)
	);

	/**
	 * Cut Handler - cut selected Node to Clipboard
	 */
	function handleCut() {
		if (!selectedNodeId) return;

		const node = findNodeById(ujlcData, selectedNodeId);
		if (!node) return;

		// check if node is root
		// TODO: add more restictions if needed
		const parentInfo = findParentOfNode(ujlcData, selectedNodeId);
		if (!parentInfo || !parentInfo.parent) {
			console.warn('Cannot cut root node');
			return;
		}

		// save node to Clipboard
		clipboardNode = node;

		// remove node from tree
		ujlcData = removeNodeFromTree(ujlcData, selectedNodeId);

		console.log('Cut node:', node.meta.id);
	}

	/**
	 * Paste Handler - paste node from Clipboard into selected Node
	 */
	function handlePaste() {
		if (!clipboardNode || !selectedNodeId) return;

		const targetNode = findNodeById(ujlcData, selectedNodeId);
		if (!targetNode) return;

		// find first slot name of target node
		const slotName = getFirstSlotName(targetNode);
		if (!slotName) {
			console.warn('Target node has no slots');
			return;
		}

		// add node to target slot
		ujlcData = insertNodeIntoSlot(ujlcData, selectedNodeId, slotName, clipboardNode);

		console.log('Pasted node into:', selectedNodeId, 'slot:', slotName);

		// clear Clipboard
		clipboardNode = null;
	}
</script>

<div data-slot="sidebar-group" data-sidebar="group" class="relative flex w-full min-w-0 flex-col">
	<EditorToolbar onCut={handleCut} onPaste={handlePaste} {canCut} {canPaste} />
	<div class="p-2">
		<NavTree nodes={ujlcData} />
	</div>
</div>
