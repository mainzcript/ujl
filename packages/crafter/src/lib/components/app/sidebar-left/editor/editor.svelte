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
		if (!clipboard || !selectedNode()) return false;

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
					console.warn('Target has multiple slots but no slot specified, using first slot');
					slotName = slotNames[0];
				}
			}

			// Insert component
			const success = crafter.operations.insertNode(
				componentType,
				insertTargetNodeId,
				slotName,
				'into'
			);

			if (success) {
				console.log('Component inserted successfully:', componentType, 'into slot:', slotName);
			}
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
		// Ctrl/Cmd + I for insert
		if ((event.ctrlKey || event.metaKey) && event.key === 'i') {
			if (selectedNodeId) {
				const slotInfo = selectedSlotInfo();

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
			}
		}

		if (!selectedNodeId) return;

		// Don't allow copy/cut/delete on slots
		if (selectedSlotInfo()) return;

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
		console.log('Slot move:', sourceParentId, sourceSlotName, '→', targetParentId, targetSlotName);

		// Can't move slot to itself
		if (sourceParentId === targetParentId && sourceSlotName === targetSlotName) {
			console.warn('Cannot move slot to itself');
			return false;
		}

		const sourceParent = findNodeById(slot, sourceParentId);
		const targetParent = findNodeById(slot, targetParentId);

		if (!sourceParent?.slots?.[sourceSlotName]) {
			console.warn('Source slot not found:', sourceSlotName);
			return false;
		}

		if (!targetParent?.slots) {
			console.warn('Target node has no slots');
			return false;
		}

		// Check if target has the target slot
		if (!targetParent.slots[targetSlotName]) {
			console.warn(
				`Target node doesn't have slot "${targetSlotName}". Available slots:`,
				Object.keys(targetParent.slots)
			);
			return false;
		}

		// Get the content from source slot
		const slotContent = [...sourceParent.slots[sourceSlotName]];

		console.log(`Moving ${slotContent.length} items from ${sourceSlotName} to ${targetSlotName}`);

		// Perform the move
		crafter.updateRootSlot((currentSlot) => {
			// First, remove content from source slot
			let updatedSlot = updateNodeInTree(currentSlot, sourceParentId, (node) => ({
				...node,
				slots: {
					...node.slots,
					[sourceSlotName]: []
				}
			}));

			// Then, add content to target slot (replace existing content)
			updatedSlot = updateNodeInTree(updatedSlot, targetParentId, (node) => {
				const newSlots = { ...node.slots };

				// Replace target slot content with source content
				newSlots[targetSlotName] = [...slotContent];

				return {
					...node,
					slots: newSlots
				};
			});

			return updatedSlot;
		});

		console.log('Slot moved successfully');
		return true;
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
