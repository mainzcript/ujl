<script lang="ts">
	import type { UJLCSlotObject } from '@ujl-framework/types';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { onMount, getContext } from 'svelte';
	import NavTree from './nav-tree/nav-tree.svelte';
	import ComponentPicker from './component-picker.svelte';
	import { CRAFTER_CONTEXT, type CrafterContext } from '../context.js';
	import {
		findNodeById,
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
		rootSlot
	}: {
		rootSlot: UJLCSlotObject;
	} = $props();

	const crafter = getContext<CrafterContext>(CRAFTER_CONTEXT);

	// Synchronized with browser clipboard for cross-tab support
	let clipboard = $state<UJLClipboardData | null>(null);

	let showComponentPicker = $state(false);
	let insertTargetNodeId = $state<string | null>(null);

	// Prevents duplicate execution when keyboard shortcuts trigger clipboard events
	let isHandlingKeyboardShortcut = $state(false);

	const selectedNodeId = $derived(page.url.searchParams.get('selected'));

	// Slot selection uses format: parentId:slotName
	const selectedSlotInfo = $derived(parseSlotSelection(selectedNodeId));

	const selectedNode = $derived.by(() => {
		if (!selectedNodeId) return null;

		if (selectedSlotInfo) {
			return findNodeById(rootSlot, selectedSlotInfo.parentId);
		}

		return findNodeById(rootSlot, selectedNodeId);
	});

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
			const parentNode = findNodeById(rootSlot, selectedSlotInfo.parentId);
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
			return true;
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

		if (tagName === 'input' || tagName === 'textarea') {
			return true;
		}

		if (target.isContentEditable) {
			return true;
		}

		if (tagName === 'select') {
			return true;
		}

		return false;
	}

	async function handleCopy(nodeId: string) {
		const copiedNode = crafter.operations.copyNode(nodeId);
		if (copiedNode) {
			clipboard = copiedNode;
			await writeToBrowserClipboard(copiedNode);
		}
	}

	async function handleCut(nodeId: string) {
		const cutNode = crafter.operations.cutNode(nodeId);
		if (cutNode) {
			clipboard = cutNode;
			await writeToBrowserClipboard(cutNode);
		}
	}

	async function handlePaste(nodeIdOrSlot: string) {
		// May fail in Safari without user interaction
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
			let newNodeId: string | null = null;
			if (isSlotSelection && slotInfo) {
				newNodeId = crafter.operations.pasteNode(
					pasteData,
					slotInfo.parentId,
					slotInfo.slotName,
					'into'
				);
			} else {
				newNodeId = crafter.operations.pasteNode(pasteData, nodeIdOrSlot, undefined, 'after');
			}
			if (newNodeId) {
				crafter.setSelectedNodeId(newNodeId);
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

	function handleDelete(nodeId: string) {
		const success = crafter.operations.deleteNode(nodeId);
		if (success) {
			crafter.setSelectedNodeId(null);
		}
	}

	function handleInsert(nodeIdOrSlot: string) {
		insertTargetNodeId = nodeIdOrSlot;
		showComponentPicker = true;
	}

	function handleSlotInsert(componentType: string, parentId: string, slotName: string): boolean {
		let newNodeId: string | null = null;
		if (isRootNode(parentId)) {
			newNodeId = crafter.operations.insertNode(componentType, ROOT_NODE_ID, slotName, 'into');
		} else {
			const targetNode = findNodeById(rootSlot, parentId);
			if (!targetNode) {
				return false;
			}
			newNodeId = crafter.operations.insertNode(componentType, parentId, slotName, 'into');
		}
		if (newNodeId) {
			crafter.setSelectedNodeId(newNodeId);
			return true;
		}
		return false;
	}

	function handleNodeInsert(componentType: string, nodeId: string): boolean {
		let newNodeId: string | null = null;
		if (isRootNode(nodeId)) {
			// Root: insert at end of document
			newNodeId = crafter.operations.insertNode(
				componentType,
				ROOT_NODE_ID,
				ROOT_SLOT_NAME,
				'into'
			);
		} else {
			// Regular module: insert after current module (consistent with paste)
			const targetNode = findNodeById(rootSlot, nodeId);
			if (!targetNode) {
				return false;
			}

			newNodeId = crafter.operations.insertNode(componentType, nodeId, undefined, 'after');
		}
		if (newNodeId) {
			crafter.setSelectedNodeId(newNodeId);
			return true;
		}
		return false;
	}

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

	async function handleSlotClick(parentId: string, slotName: string) {
		const url = new URL(page.url);
		url.searchParams.set('selected', `${parentId}:${slotName}`);
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		await goto(url, { replaceState: true, noScroll: true });
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (isEditableElement(event.target)) return;

		// Ctrl+I (Add) should always work, even without selection
		if ((event.ctrlKey || event.metaKey) && event.key === 'i') {
			event.preventDefault();
			if (selectedSlotInfo && selectedNodeId) {
				// Slot selected: insert into slot
				handleInsert(selectedNodeId);
			} else if (selectedNodeId) {
				// Module selected: insert after module (consistent with paste)
				handleInsert(selectedNodeId);
			} else {
				// Nothing selected: insert at end of document
				handleInsert(ROOT_NODE_ID);
			}
			return;
		}

		// For other shortcuts (Copy, Paste, Cut, Delete) we need a selection or clipboard
		if (!selectedNodeId && !clipboard) return;

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
			nodes={rootSlot}
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
