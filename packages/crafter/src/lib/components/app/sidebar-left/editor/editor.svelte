<script lang="ts">
	import type { UJLCSlotObject } from '@ujl-framework/types';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { onMount, getContext } from 'svelte';
	import NavTree from './nav-tree/nav-tree.svelte';
	import ComponentPicker from './component-picker.svelte';
	import { CRAFTER_CONTEXT, type CrafterContext } from '../../context.js';
	import {
		findNodeById,
		hasSlots,
		ROOT_NODE_ID,
		ROOT_SLOT_NAME,
		parseSlotSelection,
		isRootNode,
		isModuleObject
	} from '$lib/utils/ujlc-tree.js';
	import {
		writeToBrowserClipboard,
		readFromBrowserClipboard,
		writeToClipboardEvent,
		readFromClipboardEvent,
		type UJLClipboardData
	} from '$lib/utils/clipboard.js';

	let {
		slot
	}: {
		slot: UJLCSlotObject;
	} = $props();

	// Get CrafterContext for mutations
	const crafter = getContext<CrafterContext>(CRAFTER_CONTEXT);

	// Clipboard state synchronized with browser clipboard for cross-tab support
	let clipboard = $state<UJLClipboardData | null>(null);

	// Component Picker state
	let showComponentPicker = $state(false);
	let insertTargetNodeId = $state<string | null>(null);

	// Prevents duplicate execution when keyboard shortcuts trigger clipboard events
	let isHandlingKeyboardShortcut = $state(false);

	// Selected node id from URL
	const selectedNodeId = $derived(page.url.searchParams.get('selected'));

	// Parse selected ID to check if it's a slot (format: parentId:slotName)
	const selectedSlotInfo = $derived(parseSlotSelection(selectedNodeId));

	// Selected node object from current slot
	const selectedNode = $derived.by(() => {
		if (!selectedNodeId) return null;

		if (selectedSlotInfo) {
			return findNodeById(slot, selectedSlotInfo.parentId);
		}

		return findNodeById(slot, selectedNodeId);
	});

	// Button states
	const canCut = $derived(selectedNodeId !== null && !selectedSlotInfo);
	const canCopy = $derived(selectedNodeId !== null && !selectedSlotInfo);
	const canDelete = $derived(
		selectedNodeId !== null && !selectedSlotInfo && !isRootNode(selectedNodeId)
	);
	const canPaste = $derived.by(() => {
		if (!clipboard) return false;

		if (selectedNodeId === ROOT_NODE_ID) {
			return (
				isModuleObject(clipboard) ||
				(clipboard.type === 'slot' && clipboard.slotName === ROOT_SLOT_NAME)
			);
		}

		if (!selectedNodeId) return false;

		if (selectedSlotInfo) {
			const parentNode = findNodeById(slot, selectedSlotInfo.parentId);
			if (!parentNode && !isRootNode(selectedSlotInfo.parentId)) return false;

			if (isModuleObject(clipboard)) {
				return true;
			}

			if (clipboard.type === 'slot') {
				if (isRootNode(selectedSlotInfo.parentId)) {
					return clipboard.slotName === ROOT_SLOT_NAME;
				}
				if (parentNode?.slots) {
					return Object.keys(parentNode.slots).includes(clipboard.slotName);
				}
			}

			return false;
		}

		if (isRootNode(selectedNodeId)) {
			return (
				isModuleObject(clipboard) ||
				(clipboard.type === 'slot' && clipboard.slotName === ROOT_SLOT_NAME)
			);
		}

		if (!selectedNode) return false;

		if (isModuleObject(clipboard)) {
			return hasSlots(selectedNode);
		}

		if (clipboard.type === 'slot' && selectedNode.slots) {
			return Object.keys(selectedNode.slots).includes(clipboard.slotName);
		}

		return false;
	});

	/**
	 * Checks if the event target is an editable element (input, textarea, contenteditable).
	 * If true, we should not intercept copy/paste events and let the browser handle them.
	 */
	function isEditableElement(target: EventTarget | null): boolean {
		if (!target || !(target instanceof HTMLElement)) {
			return false;
		}

		const tagName = target.tagName.toLowerCase();

		// Check for input and textarea elements
		if (tagName === 'input' || tagName === 'textarea') {
			return true;
		}

		// Check for contenteditable elements
		if (target.isContentEditable) {
			return true;
		}

		// Also check for select elements
		if (tagName === 'select') {
			return true;
		}

		return false;
	}

	/**
	 * Copies the selected node to clipboard without removing it from the tree.
	 */
	async function handleCopy(nodeId: string) {
		const copiedNode = crafter.operations.copyNode(nodeId);
		if (copiedNode) {
			clipboard = copiedNode;
			await writeToBrowserClipboard(copiedNode);
		}
	}

	/**
	 * Cuts the selected node to clipboard (removes it from the tree).
	 */
	async function handleCut(nodeId: string) {
		const cutNode = crafter.operations.cutNode(nodeId);
		if (cutNode) {
			clipboard = cutNode;
			await writeToBrowserClipboard(cutNode);
		}
	}

	/**
	 * Pastes a node or slot from clipboard into the selected node or slot.
	 */
	async function handlePaste(nodeIdOrSlot: string) {
		// Try to read from browser clipboard (may fail in Safari without user interaction)
		const browserClipboard = await readFromBrowserClipboard();
		const pasteData = browserClipboard || clipboard;

		if (!pasteData) return;

		if (browserClipboard && browserClipboard !== clipboard) {
			clipboard = browserClipboard;
		}

		performPaste(pasteData, nodeIdOrSlot);
	}

	function performPaste(pasteData: UJLClipboardData, nodeIdOrSlot: string) {
		const slotInfo = parseSlotSelection(nodeIdOrSlot);
		const isSlotSelection = slotInfo !== null;

		if (isModuleObject(pasteData)) {
			if (isSlotSelection && slotInfo) {
				crafter.operations.pasteNode(pasteData, slotInfo.parentId, slotInfo.slotName, 'into');
			} else {
				crafter.operations.pasteNode(pasteData, nodeIdOrSlot, undefined, 'after');
			}
			return;
		}

		if (pasteData.type === 'slot') {
			if (isSlotSelection && slotInfo) {
				crafter.operations.pasteSlot(pasteData, slotInfo.parentId);
			} else {
				crafter.operations.pasteSlot(pasteData, nodeIdOrSlot);
			}
		}
	}

	/**
	 * Deletes the selected node without saving it to clipboard.
	 */
	function handleDelete(nodeId: string) {
		crafter.operations.deleteNode(nodeId);
	}

	/**
	 * Opens the component picker for the target node or slot.
	 */
	function handleInsert(nodeIdOrSlot: string) {
		insertTargetNodeId = nodeIdOrSlot;
		showComponentPicker = true;
	}

	/**
	 * Inserts a component into a specific slot.
	 */
	function handleSlotInsert(componentType: string, parentId: string, slotName: string): boolean {
		if (isRootNode(parentId)) {
			crafter.operations.insertNode(componentType, ROOT_NODE_ID, slotName, 'into');
			return true;
		}

		const targetNode = findNodeById(slot, parentId);
		if (!targetNode) {
			return false;
		}

		crafter.operations.insertNode(componentType, parentId, slotName, 'into');
		return true;
	}

	/**
	 * Inserts a component into a node (determines slot automatically).
	 */
	function handleNodeInsert(componentType: string, nodeId: string): boolean {
		if (isRootNode(nodeId)) {
			crafter.operations.insertNode(componentType, ROOT_NODE_ID, ROOT_SLOT_NAME, 'into');
			return true;
		}

		const targetNode = findNodeById(slot, nodeId);
		if (!targetNode) {
			return false;
		}

		let slotName: string | undefined = undefined;

		if (targetNode.slots) {
			const slotNames = Object.keys(targetNode.slots);
			if (slotNames.length > 0) {
				slotName = slotNames[0];
			}
		}

		crafter.operations.insertNode(componentType, nodeId, slotName, 'into');
		return true;
	}

	/**
	 * Inserts the selected component into the target node or slot.
	 */
	function handleComponentSelect(componentType: string) {
		if (!insertTargetNodeId) return;

		const slotInfo = parseSlotSelection(insertTargetNodeId);

		if (slotInfo) {
			const { parentId, slotName } = slotInfo;
			handleSlotInsert(componentType, parentId, slotName);
		} else {
			handleNodeInsert(componentType, insertTargetNodeId);
		}

		insertTargetNodeId = null;
		showComponentPicker = false;
	}

	/**
	 * Handles slot click and updates URL with parent:slotName format.
	 */
	async function handleSlotClick(parentId: string, slotName: string) {
		const url = new URL(page.url);
		url.searchParams.set('selected', `${parentId}:${slotName}`);
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		await goto(url, { replaceState: true, noScroll: true });
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (isEditableElement(event.target)) return;
		if (!selectedNodeId && !clipboard) return;

		if ((event.ctrlKey || event.metaKey) && event.key === 'i') {
			if (selectedSlotInfo && selectedNodeId) {
				event.preventDefault();
				handleInsert(selectedNodeId);
			} else if (selectedNodeId) {
				// Allow insert if node has slots (single or multiple) - enables inserting into empty containers
				const canInsertNode = selectedNode && hasSlots(selectedNode);

				if (canInsertNode) {
					event.preventDefault();
					handleInsert(selectedNodeId);
				}
			}
			return;
		}

		if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
			if (canPaste) {
				event.preventDefault();
				event.stopImmediatePropagation();
				isHandlingKeyboardShortcut = true;
				const targetId = selectedNodeId || ROOT_NODE_ID;
				handlePaste(targetId).finally(() => {
					setTimeout(() => {
						isHandlingKeyboardShortcut = false;
					}, 0);
				});
			}
			return;
		}

		if (event.key === 'Delete' || event.key === 'Backspace') {
			if (canDelete && selectedNodeId) {
				event.preventDefault();
				handleDelete(selectedNodeId);
			}
			return;
		}

		if (selectedSlotInfo || !selectedNodeId) return;

		if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
			if (canCopy) {
				event.preventDefault();
				event.stopImmediatePropagation();
				isHandlingKeyboardShortcut = true;
				handleCopy(selectedNodeId).finally(() => {
					setTimeout(() => {
						isHandlingKeyboardShortcut = false;
					}, 0);
				});
			}
		}

		if ((event.ctrlKey || event.metaKey) && event.key === 'x') {
			if (canCut) {
				event.preventDefault();
				event.stopImmediatePropagation();
				isHandlingKeyboardShortcut = true;
				handleCut(selectedNodeId).finally(() => {
					setTimeout(() => {
						isHandlingKeyboardShortcut = false;
					}, 0);
				});
			}
		}
	}

	/**
	 * Handles copy event from context menu or other sources.
	 */
	function handleCopyEvent(event: ClipboardEvent) {
		if (isHandlingKeyboardShortcut) return;

		if (isEditableElement(event.target)) return;

		if (!selectedNodeId || selectedSlotInfo) return;
		if (!canCopy) return;

		const copiedNode = crafter.operations.copyNode(selectedNodeId);
		if (copiedNode) {
			clipboard = copiedNode;
			writeToClipboardEvent(event, copiedNode);
			writeToBrowserClipboard(copiedNode);
		}
	}

	/**
	 * Handles cut event from context menu or other sources.
	 */
	function handleCutEvent(event: ClipboardEvent) {
		if (isHandlingKeyboardShortcut) return;

		if (isEditableElement(event.target)) return;

		if (!selectedNodeId || selectedSlotInfo) return;
		if (!canCut) return;

		const cutNode = crafter.operations.cutNode(selectedNodeId);
		if (cutNode) {
			clipboard = cutNode;
			writeToClipboardEvent(event, cutNode);
			writeToBrowserClipboard(cutNode);
		}
	}

	/**
	 * Handles paste event from context menu or other sources.
	 */
	function handlePasteEvent(event: ClipboardEvent) {
		if (isHandlingKeyboardShortcut) return;

		if (isEditableElement(event.target)) return;

		if (!canPaste) return;

		const eventData = readFromClipboardEvent(event);
		const pasteData = eventData || clipboard;
		if (!pasteData) return;

		if (eventData && eventData !== clipboard) {
			clipboard = eventData;
		}

		const targetId = selectedNodeId || ROOT_NODE_ID;
		performPaste(pasteData, targetId);
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('copy', handleCopyEvent);
		window.addEventListener('cut', handleCutEvent);
		window.addEventListener('paste', handlePasteEvent);

		readFromBrowserClipboard().then((data) => {
			if (data) {
				clipboard = data;
			}
		});

		const handleFocus = () => {
			readFromBrowserClipboard().then((data) => {
				if (data && data !== clipboard) {
					clipboard = data;
				}
			});
		};

		window.addEventListener('focus', handleFocus);

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('copy', handleCopyEvent);
			window.removeEventListener('cut', handleCutEvent);
			window.removeEventListener('paste', handlePasteEvent);
			window.removeEventListener('focus', handleFocus);
		};
	});

	/**
	 * Handles node move operation for drag & drop.
	 * @returns true if move was successful, false if rejected
	 */
	function handleNodeMove(
		nodeId: string,
		targetId: string,
		slotName?: string,
		position?: 'before' | 'after' | 'into'
	): boolean {
		return crafter.operations.moveNode(nodeId, targetId, slotName, position);
	}

	async function handleSlotCopy(parentId: string, slotName: string) {
		const slotData = crafter.operations.copySlot(parentId, slotName);
		if (slotData) {
			clipboard = slotData;
			await writeToBrowserClipboard(slotData);
		}
	}

	async function handleSlotCut(parentId: string, slotName: string) {
		const slotData = crafter.operations.cutSlot(parentId, slotName);
		if (slotData) {
			clipboard = slotData;
			await writeToBrowserClipboard(slotData);
		}
	}

	function handleSlotPaste(targetParentId: string, slotName: string) {
		handlePaste(`${targetParentId}:${slotName}`);
	}

	/**
	 * Handles slot move operation for drag & drop.
	 * Moves an entire slot (with all its content) from one parent to another.
	 * @returns true if move was successful, false if rejected
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
