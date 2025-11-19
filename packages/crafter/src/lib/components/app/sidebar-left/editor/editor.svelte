<script lang="ts">
	import type { UJLCModuleObject, UJLCSlotObject } from '@ujl-framework/types';
	import { page } from '$app/stores';
	import { onMount, getContext } from 'svelte';
	import NavTree from './nav-tree.svelte';
	import ComponentPicker from './component-picker.svelte';
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

	// Component Picker state
	let showComponentPicker = $state(false);
	let insertTargetNodeId = $state<string | null>(null);

	// Selected node id from URL
	const selectedNodeId = $derived($page.url.searchParams.get('selected'));

	// Selected node object from current slot
	const selectedNode = $derived(selectedNodeId ? findNodeById(slot, selectedNodeId) : null);

	// Button states
	const canCut = $derived(selectedNodeId !== null);
	const canCopy = $derived(selectedNodeId !== null);
	const canPaste = $derived(clipboard !== null && selectedNode !== null && hasSlots(selectedNode));

	/**
	 * Copy Handler - copy selected node to clipboard (without removing)
	 */
	function handleCopy(nodeId: string) {
		const copiedNode = crafter.operations.copyNode(nodeId);
		if (copiedNode) {
			clipboard = copiedNode;
		}
	}

	/**
	 * Cut Handler - cut selected node to clipboard
	 */
	function handleCut(nodeId: string) {
		const cutNode = crafter.operations.cutNode(nodeId);
		if (cutNode) {
			clipboard = cutNode;
		}
	}

	/**
	 * Paste Handler - paste node from clipboard into selected node
	 */
	function handlePaste(nodeId: string) {
		if (!clipboard) return;

		const success = crafter.operations.pasteNode(clipboard, nodeId);
		if (success) {
			clipboard = null; // Clear clipboard after successful paste
		}
	}

	/**
	 * Delete Handler - delete selected node without saving to clipboard
	 */
	function handleDelete(nodeId: string) {
		crafter.operations.deleteNode(nodeId);
	}

	/**
	 * Insert Handler - open component picker for target node
	 */
	function handleInsert(nodeId: string) {
		insertTargetNodeId = nodeId;
		showComponentPicker = true;
	}

	/**
	 * Component Select Handler - insert selected component
	 */
	function handleComponentSelect(componentType: string) {
		if (!insertTargetNodeId) return;

		// Default behavior: insert into target node (not before/after)
		const success = crafter.operations.insertNode(
			componentType,
			insertTargetNodeId,
			undefined, // slotName - will use first slot
			'into' // position - insert into target
		);

		if (success) {
			console.log('Component inserted successfully:', componentType);
		}

		// Reset state
		insertTargetNodeId = null;
	}

	/**
	 * Keyboard Event Handler
	 */
	function handleKeyDown(event: KeyboardEvent) {
		// Ctrl/Cmd + I for insert
		if ((event.ctrlKey || event.metaKey) && event.key === 'i') {
			if (selectedNodeId) {
				event.preventDefault();
				handleInsert(selectedNodeId);
			}
			return;
		}

		if (!selectedNodeId) return;

		// Ctrl/Cmd + C for copy
		if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
			if (canCopy) {
				event.preventDefault();
				handleCopy(selectedNodeId);
			}
		}

		// Ctrl/Cmd + V for paste
		if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
			if (canPaste) {
				event.preventDefault();
				handlePaste(selectedNodeId);
			}
		}

		// Ctrl/Cmd + X for cut
		if ((event.ctrlKey || event.metaKey) && event.key === 'x') {
			if (canCut) {
				event.preventDefault();
				handleCut(selectedNodeId);
			}
		}

		// Delete key to remove selected node
		if (event.key === 'Delete') {
			if (canCut) {
				event.preventDefault();
				handleDelete(selectedNodeId);
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
	function handleNodeMove(
		nodeId: string,
		targetId: string,
		slotName?: string,
		position?: 'before' | 'after' | 'into'
	): boolean {
		return crafter.operations.moveNode(nodeId, targetId, slotName, position);
	}
</script>

<div data-slot="sidebar-group" data-sidebar="group" class="relative flex w-full min-w-0 flex-col">
	<div class="p-2">
		<NavTree
			nodes={slot}
			{clipboard}
			onCopy={handleCopy}
			onCut={handleCut}
			onPaste={handlePaste}
			onDelete={handleDelete}
			onInsert={handleInsert}
			onNodeMove={handleNodeMove}
		/>
	</div>
</div>

<ComponentPicker bind:open={showComponentPicker} onSelect={handleComponentSelect} />
