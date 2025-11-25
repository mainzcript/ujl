<script lang="ts">
	import type { UJLCModuleObject, UJLCSlotObject } from '@ujl-framework/types';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount, getContext } from 'svelte';
	import NavTree from './nav-tree/nav-tree.svelte';
	import ComponentPicker from './component-picker.svelte';
	import { CRAFTER_CONTEXT, type CrafterContext } from '../../context.js';
	import { findNodeById, hasMultipleSlots, hasSlots } from './nav-tree/ujlc-tree-utils.ts';

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

	// Parse selected ID to check if it's a slot (format: parentId:slotName)
	const selectedSlotInfo = $derived(() => {
		if (!selectedNodeId) return null;

		const parts = selectedNodeId.split(':');
		if (parts.length === 2) {
			return {
				parentId: parts[0],
				slotName: parts[1]
			};
		}
		return null;
	});

	// Selected node object from current slot
	const selectedNode = $derived(() => {
		if (!selectedNodeId) return null;

		// If it's a slot selection, get the parent node
		const slotInfo = selectedSlotInfo();
		if (slotInfo) {
			return findNodeById(slot, slotInfo.parentId);
		}

		// Otherwise, get the node directly
		return findNodeById(slot, selectedNodeId);
	});

	// Button states
	const canCut = $derived(selectedNodeId !== null && !selectedSlotInfo());
	const canCopy = $derived(selectedNodeId !== null && !selectedSlotInfo());
	const canPaste = $derived(() => {
		if (!clipboard || !selectedNodeId) return false;

		const slotInfo = selectedSlotInfo();

		// If a slot is selected
		if (slotInfo) {
			const parentNode = findNodeById(slot, slotInfo.parentId);
			if (!parentNode) return false;

			// Regular nodes can always be pasted into slots
			if ('meta' in clipboard) {
				return true;
			}

			// Slots can only be pasted if the slot name matches
			if (clipboard.type === 'slot' && parentNode.slots) {
				return Object.keys(parentNode.slots).includes(clipboard.slotName);
			}

			return false;
		}

		// If a node is selected
		const node = selectedNode();
		if (!node) return false;

		// If clipboard is a regular node, check if target has slots
		if ('meta' in clipboard) {
			return hasSlots(node);
		}

		// If clipboard is a slot, check if target has that slot type
		if (clipboard.type === 'slot' && node.slots) {
			return Object.keys(node.slots).includes(clipboard.slotName);
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
	 * Paste Handler - paste node or slot from clipboard into selected node or slot
	 */
	function handlePaste(nodeIdOrSlot: string) {
		if (!clipboard) return;

		// Check if nodeIdOrSlot is a slot selection (format: parentId:slotName)
		const parts = nodeIdOrSlot.split(':');
		const isSlotSelection = parts.length === 2;

		// If clipboard contains a regular node
		if ('meta' in clipboard) {
			if (isSlotSelection) {
				// Pasting into a specific slot
				const [parentId, slotName] = parts;
				const success = crafter.operations.pasteNode(clipboard, parentId, slotName);
				if (success) {
					clipboard = null;
				}
			} else {
				// Pasting into a node (uses first slot)
				const success = crafter.operations.pasteNode(clipboard, nodeIdOrSlot);
				if (success) {
					clipboard = null;
				}
			}
			return;
		}

		// If clipboard contains a slot
		if (clipboard.type === 'slot') {
			if (isSlotSelection) {
				// Extract parent ID from slot selection
				const [parentId] = parts;
				const success = crafter.operations.pasteSlot(clipboard, parentId);
				if (success) {
					clipboard = null;
				}
			} else {
				// Pasting into a node
				const success = crafter.operations.pasteSlot(clipboard, nodeIdOrSlot);
				if (success) {
					clipboard = null;
				}
			}
		}
	}

	/**
	 * Delete Handler - delete selected node without saving to clipboard
	 */
	function handleDelete(nodeId: string) {
		crafter.operations.deleteNode(nodeId);
	}

	/**
	 * Insert Handler - open component picker for target node or slot
	 */
	function handleInsert(nodeIdOrSlot: string) {
		insertTargetNodeId = nodeIdOrSlot;
		showComponentPicker = true;
	}

	/**
	 * Component Select Handler - insert selected component
	 */
	function handleComponentSelect(componentType: string) {
		if (!insertTargetNodeId) return;

		// Check if insertTargetNodeId is a slot (contains ':')
		const parts = insertTargetNodeId.split(':');

		if (parts.length === 2) {
			// It's a slot: parentId:slotName
			const [parentId, slotName] = parts;
			const targetNode = findNodeById(slot, parentId);

			if (!targetNode) {
				console.warn('Parent node not found');
				return;
			}

			// Insert component into specific slot
			const success = crafter.operations.insertNode(componentType, parentId, slotName, 'into');

			if (success) {
				console.log('Component inserted successfully:', componentType, 'into slot:', slotName);
			}
		} else {
			// It's a regular node
			const targetNode = findNodeById(slot, insertTargetNodeId);
			if (!targetNode) {
				console.warn('Target node not found');
				return;
			}

			// Determine slot name
			let slotName: string | undefined = undefined;

			if (targetNode.slots) {
				const slotNames = Object.keys(targetNode.slots);

				// If exactly one slot, use it
				if (slotNames.length === 1) {
					slotName = slotNames[0];
				}
				// If multiple slots, use first one as fallback (shouldn't happen as Insert is disabled)
				else if (slotNames.length > 1) {
					// console.warn('Target has multiple slots but no slot specified, using first slot');
					slotName = slotNames[0];
				}
			}

			// Insert component
			crafter.operations.insertNode(componentType, insertTargetNodeId, slotName, 'into');

			// if (success) {
			// console.log('Component inserted successfully:', componentType, 'into slot:', slotName);
			// }
		}

		// Reset state
		insertTargetNodeId = null;
	}

	/**
	 * Handle Slot Click - update URL with parent:slotname format
	 */
	async function handleSlotClick(parentId: string, slotName: string) {
		const url = new URL($page.url);
		url.searchParams.set('selected', `${parentId}:${slotName}`);
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		await goto(url, { replaceState: true, noScroll: true });
		console.log('Slot clicked:', parentId, slotName);
	}

	/**
	 * Keyboard Event Handler
	 */
	function handleKeyDown(event: KeyboardEvent) {
		if (!selectedNodeId) return;

		const slotInfo = selectedSlotInfo();

		// Ctrl/Cmd + I for insert
		if ((event.ctrlKey || event.metaKey) && event.key === 'i') {
			if (slotInfo) {
				// Slot is selected - can always insert
				event.preventDefault();
				handleInsert(selectedNodeId);
			} else {
				// Node is selected - check if can insert
				const node = selectedNode();
				const canInsert = node && hasSlots(node) && !hasMultipleSlots(node);

				if (canInsert) {
					event.preventDefault();
					handleInsert(selectedNodeId);
				}
			}
			return;
		}

		// Ctrl/Cmd + V for paste - works for both nodes and slots
		if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
			if (canPaste()) {
				event.preventDefault();
				handlePaste(selectedNodeId);
			}
			return;
		}

		// Don't allow copy/cut/delete on slots - only on nodes
		if (slotInfo) return;

		// Ctrl/Cmd + C for copy (nodes only)
		if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
			if (canCopy) {
				event.preventDefault();
				handleCopy(selectedNodeId);
			}
		}

		// Ctrl/Cmd + X for cut (nodes only)
		if ((event.ctrlKey || event.metaKey) && event.key === 'x') {
			if (canCut) {
				event.preventDefault();
				handleCut(selectedNodeId);
			}
		}

		// Delete key to remove selected node (nodes only)
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
	 * Slot Copy Handler - copies a complete slot with all its content
	 */
	function handleSlotCopy(parentId: string, slotName: string) {
		const slotData = crafter.operations.copySlot(parentId, slotName);
		if (slotData) {
			clipboard = slotData;
		}
	}

	/**
	 * Slot Cut Handler - cuts a complete slot (empties it and saves to clipboard)
	 */
	function handleSlotCut(parentId: string, slotName: string) {
		const slotData = crafter.operations.cutSlot(parentId, slotName);
		if (slotData) {
			clipboard = slotData;
		}
	}

	/**
	 * Slot Paste Handler - pastes into a specific slot
	 */
	function handleSlotPaste(targetParentId: string, slotName: string) {
		// Format as slot selection: parentId:slotName
		handlePaste(`${targetParentId}:${slotName}`);
	}

	/**
	 * Slot Move Handler for Drag & Drop
	 * Moves an entire slot (with all its content) from one parent to another
	 * Returns true if move was successful, false if rejected
	 */
	function handleSlotMove(
		sourceParentId: string,
		sourceSlotName: string,
		targetParentId: string,
		targetSlotName: string
	): boolean {
		return crafter.operations.moveSlot(
			sourceParentId,
			sourceSlotName,
			targetParentId,
			targetSlotName
		);
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
			onSlotMove={handleSlotMove}
			onSlotClick={handleSlotClick}
		/>
	</div>
</div>

<ComponentPicker bind:open={showComponentPicker} onSelect={handleComponentSelect} />