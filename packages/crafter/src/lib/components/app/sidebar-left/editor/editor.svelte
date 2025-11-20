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
	let clipboard = $state<
		| UJLCModuleObject
		| {
				type: 'slot';
				slotName: string;
				content: UJLCModuleObject[];
		  }
		| null
	>(null);

	// Component Picker state
	let showComponentPicker = $state(false);
	let insertTargetNodeId = $state<string | null>(null);

	// Selected node id from URL
	const selectedNodeId = $derived($page.url.searchParams.get('selected'));

	// Selected node object from current slot
	const selectedNode = $derived(selectedNodeId ? findNodeById(slot, selectedNodeId) : null);

	// Target node for component insertion
	const insertTargetNode = $derived(
		insertTargetNodeId ? findNodeById(slot, insertTargetNodeId) : null
	);

	// Button states
	const canCut = $derived(selectedNodeId !== null);
	const canCopy = $derived(selectedNodeId !== null);
	const canPaste = $derived(() => {
		if (!clipboard || !selectedNode) return false;

		// If clipboard is a regular node, check if target has slots
		if ('meta' in clipboard) {
			return hasSlots(selectedNode);
		}

		// If clipboard is a slot, check if target has that slot type
		if (clipboard.type === 'slot' && selectedNode.slots) {
			return Object.keys(selectedNode.slots).includes(clipboard.slotName);
		}

		return false;
	});

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
	 * Paste Handler - paste node or slot from clipboard into selected node
	 */
	function handlePaste(nodeId: string) {
		if (!clipboard) return;

		// If clipboard contains a regular node
		if ('meta' in clipboard) {
			const success = crafter.operations.pasteNode(clipboard, nodeId);
			if (success) {
				clipboard = null;
			}
			return;
		}

		// If clipboard contains a slot
		if (clipboard.type === 'slot') {
			const targetNode = findNodeById(slot, nodeId);
			if (!targetNode?.slots) {
				console.warn('Target node has no slots');
				return;
			}

			// Check if target has the slot type
			if (!Object.keys(targetNode.slots).includes(clipboard.slotName)) {
				console.warn('Target does not have slot:', clipboard.slotName);
				return;
			}

			// Capture clipboard data before passing to callback
			const slotName = clipboard.slotName;
			const slotContent = clipboard.content;

			// Paste slot content into target's matching slot
			crafter.updateRootSlot((currentSlot) => {
				return updateNodeInTree(currentSlot, nodeId, (node) => ({
					...node,
					slots: {
						...node.slots,
						[slotName]: [...slotContent]
					}
				}));
			});

			console.log('Pasted slot', slotName, 'into node:', nodeId);
			clipboard = null;
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
	function handleComponentSelect(componentType: string, slotName?: string) {
		if (!insertTargetNodeId) return;

		// Insert component with optional slot name
		const success = crafter.operations.insertNode(
			componentType,
			insertTargetNodeId,
			slotName, // Pass the selected slot name
			'into' // position - insert into target
		);

		if (success) {
			console.log('Component inserted successfully:', componentType, 'into slot:', slotName);
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
			if (canPaste()) {
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

	/**
	 * Helper function to update a node in the tree
	 */
	function updateNodeInTree(
		nodes: UJLCModuleObject[],
		targetId: string,
		updateFn: (node: UJLCModuleObject) => UJLCModuleObject
	): UJLCModuleObject[] {
		return nodes.map((node) => {
			if (node.meta.id === targetId) {
				return updateFn(node);
			}

			if (node.slots) {
				const updatedSlots: Record<string, UJLCModuleObject[]> = {};
				for (const [slotName, children] of Object.entries(node.slots)) {
					updatedSlots[slotName] = updateNodeInTree(children, targetId, updateFn);
				}
				return { ...node, slots: updatedSlots };
			}

			return node;
		});
	}

	/**
	 * Slot Copy Handler - copies a complete slot with all its content
	 */
	function handleSlotCopy(parentId: string, slotName: string) {
		const parentNode = findNodeById(slot, parentId);
		if (!parentNode?.slots?.[slotName]) {
			console.warn('Slot not found:', slotName);
			return;
		}

		clipboard = {
			type: 'slot',
			slotName,
			content: [...parentNode.slots[slotName]]
		};
		console.log('Copied slot:', slotName, 'with', clipboard.content.length, 'items');
	}

	/**
	 * Slot Cut Handler - cuts a complete slot (empties it and saves to clipboard)
	 */
	function handleSlotCut(parentId: string, slotName: string) {
		const parentNode = findNodeById(slot, parentId);
		if (!parentNode?.slots?.[slotName]) {
			console.warn('Slot not found:', slotName);
			return;
		}

		const slotContent = [...parentNode.slots[slotName]];

		// Save to clipboard
		clipboard = {
			type: 'slot',
			slotName,
			content: slotContent
		};

		// Empty the slot
		crafter.updateRootSlot((currentSlot) => {
			return updateNodeInTree(currentSlot, parentId, (node) => ({
				...node,
				slots: {
					...node.slots,
					[slotName]: []
				}
			}));
		});

		console.log('Cut slot:', slotName, 'with', slotContent.length, 'items');
	}

	/**
	 * Slot Paste Handler - uses the regular paste handler
	 */
	function handleSlotPaste(targetParentId: string) {
		handlePaste(targetParentId);
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
			onSlotCopy={handleSlotCopy}
			onSlotCut={handleSlotCut}
			onSlotPaste={handleSlotPaste}
		/>
	</div>
</div>

<ComponentPicker
	bind:open={showComponentPicker}
	targetNode={insertTargetNode}
	onSelect={handleComponentSelect}
/>
