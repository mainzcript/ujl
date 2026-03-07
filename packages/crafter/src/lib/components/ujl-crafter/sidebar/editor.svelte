<script lang="ts">
	import type { UJLCSlotObject } from "@ujl-framework/types";
	import { getContext } from "svelte";
	import NavTree from "./nav-tree/nav-tree.svelte";
	import { CRAFTER_CONTEXT, type CrafterContext } from "$lib/stores/index.js";
	import {
		findNodeById,
		ROOT_NODE_ID,
		ROOT_SLOT_NAME,
		parseSlotSelection,
		isRootNode,
		isModuleObject,
	} from "$lib/utils/ujlc-tree.js";
	import {
		writeToBrowserClipboard,
		readFromBrowserClipboard,
		type UJLClipboardData,
	} from "$lib/utils/clipboard.js";
	import ComponentPicker from "./component-picker.svelte";

	let {
		rootSlot,
		externalClipboard = null,
	}: {
		rootSlot: UJLCSlotObject;
		externalClipboard?: UJLClipboardData | null;
	} = $props();

	const crafter = getContext<CrafterContext>(CRAFTER_CONTEXT);

	// Synchronized with browser clipboard for cross-tab support
	// Can be overridden by externalClipboard from parent (ujl-crafter.svelte)
	let internalClipboard = $state<UJLClipboardData | null>(null);
	const clipboard = $derived(externalClipboard ?? internalClipboard);

	let showComponentPicker = $state(false);
	let insertTargetNodeId = $state<string | null>(null);

	async function handleCopy(nodeId: string) {
		const copiedNode = crafter.operations.copyNode(nodeId);
		if (copiedNode) {
			internalClipboard = copiedNode;
			await writeToBrowserClipboard(copiedNode);
		}
	}

	async function handleCut(nodeId: string) {
		const cutNode = crafter.operations.cutNode(nodeId);
		if (cutNode) {
			internalClipboard = cutNode;
			await writeToBrowserClipboard(cutNode);
		}
	}

	async function handlePaste(nodeIdOrSlot: string) {
		// May fail in Safari without user interaction
		const browserClipboard = await readFromBrowserClipboard();
		const currentClipboard = clipboard; // Use derived value
		const pasteData = browserClipboard || currentClipboard;

		if (!pasteData) return;

		if (browserClipboard && browserClipboard !== currentClipboard) {
			internalClipboard = browserClipboard;
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
					"into",
				);
			} else {
				newNodeId = crafter.operations.pasteNode(pasteData, nodeIdOrSlot, undefined, "after");
			}
			if (newNodeId) {
				crafter.setSelectedNodeId(newNodeId);
			}
			return;
		}

		if (pasteData.type === "slot") {
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
			newNodeId = crafter.operations.insertNode(componentType, ROOT_NODE_ID, slotName, "into");
		} else {
			const targetNode = findNodeById(rootSlot, parentId);
			if (!targetNode) {
				return false;
			}
			newNodeId = crafter.operations.insertNode(componentType, parentId, slotName, "into");
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
				"into",
			);
		} else {
			// Regular module: insert after current module (consistent with paste)
			const targetNode = findNodeById(rootSlot, nodeId);
			if (!targetNode) {
				return false;
			}

			newNodeId = crafter.operations.insertNode(componentType, nodeId, undefined, "after");
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

	function handleSlotClick(parentId: string, slotName: string) {
		if (crafter.mode !== "editor") return;
		crafter.setSelectedNodeId(`${parentId}:${slotName}`);
	}

	/**
	 * Handles node move operation for drag & drop.
	 * @returns true if move was successful, false if rejected
	 */
	function handleNodeMove(
		nodeId: string,
		targetId: string,
		slotName?: string,
		position?: "before" | "after" | "into",
	): boolean {
		return crafter.operations.moveNode(nodeId, targetId, slotName, position);
	}

	async function handleSlotCopy(parentId: string, slotName: string) {
		const slotData = crafter.operations.copySlot(parentId, slotName);
		if (slotData) {
			internalClipboard = slotData;
			await writeToBrowserClipboard(slotData);
		}
	}

	async function handleSlotCut(parentId: string, slotName: string) {
		const slotData = crafter.operations.cutSlot(parentId, slotName);
		if (slotData) {
			internalClipboard = slotData;
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
		targetSlotName: string,
	): boolean {
		return crafter.operations.moveSlot(
			sourceParentId,
			sourceSlotName,
			targetParentId,
			targetSlotName,
		);
	}
</script>

<div data-slot="sidebar-group" data-sidebar="group" class="relative flex w-full min-w-0 flex-col">
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

<ComponentPicker bind:open={showComponentPicker} onSelect={handleComponentSelect} />
