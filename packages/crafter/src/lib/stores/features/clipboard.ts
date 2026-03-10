import type { UJLCModuleObject } from "@ujl-framework/types";
import type { CrafterOperations } from "../operations.js";

export type UJLClipboardData =
	| UJLCModuleObject
	| {
			type: "slot";
			slotName: string;
			content: UJLCModuleObject[];
	  };

export interface ClipboardFeatureState {
	showComponentPicker: boolean;
	insertTargetNodeId: string | null;
	clipboard: UJLClipboardData | null;
}

interface SlotSelection {
	parentId: string;
	slotName: string;
}

interface ClipboardFeatureDeps {
	operations: CrafterOperations;
	state: ClipboardFeatureState;
	setSelectedNodeId: (nodeId: string | null) => void;
	parseSlotSelection: (selection: string | null) => SlotSelection | null;
	isModuleObject: (data: UJLClipboardData) => data is UJLCModuleObject;
	readFromBrowserClipboard: () => Promise<UJLClipboardData | null>;
	writeToBrowserClipboard: (data: UJLClipboardData) => Promise<void>;
}

export function createClipboardFeature(deps: ClipboardFeatureDeps) {
	const {
		operations,
		state,
		setSelectedNodeId,
		parseSlotSelection,
		isModuleObject,
		readFromBrowserClipboard,
		writeToBrowserClipboard,
	} = deps;

	function setClipboard(data: UJLClipboardData | null): void {
		state.clipboard = data;
	}

	async function copyNode(nodeId: string): Promise<void> {
		const copied = operations.copyNode(nodeId);
		if (!copied) return;

		state.clipboard = copied;
		await writeToBrowserClipboard(copied);
	}

	async function cutNode(nodeId: string): Promise<void> {
		await copyNode(nodeId);
		deleteNode(nodeId);
	}

	function deleteNode(nodeId: string): boolean {
		const success = operations.deleteNode(nodeId);
		if (success) {
			setSelectedNodeId(null);
		}
		return success;
	}

	function performPaste(pasteData: UJLClipboardData, targetId: string): void {
		const slotInfo = parseSlotSelection(targetId);
		const isSlotSelection = slotInfo !== null;

		if (isModuleObject(pasteData)) {
			const newNodeId =
				isSlotSelection && slotInfo
					? operations.pasteNode(pasteData, slotInfo.parentId, slotInfo.slotName, "into")
					: operations.pasteNode(pasteData, targetId, undefined, "after");

			if (newNodeId) {
				setSelectedNodeId(newNodeId);
			}
			return;
		}

		if (pasteData.type === "slot") {
			if (isSlotSelection && slotInfo) {
				operations.pasteSlot(pasteData, slotInfo.parentId);
				return;
			}
			operations.pasteSlot(pasteData, targetId);
		}
	}

	async function pasteNode(targetId: string): Promise<void> {
		const browserClipboard = await readFromBrowserClipboard();
		const pasteData = browserClipboard || state.clipboard;
		if (!pasteData) return;

		if (browserClipboard && browserClipboard !== state.clipboard) {
			state.clipboard = browserClipboard;
		}

		performPaste(pasteData, targetId);
	}

	function requestInsert(targetId: string): void {
		state.insertTargetNodeId = targetId;
		state.showComponentPicker = true;
	}

	function closeComponentPicker(): void {
		state.showComponentPicker = false;
		state.insertTargetNodeId = null;
	}

	function handleComponentSelect(componentType: string): void {
		if (!state.insertTargetNodeId) return;

		const targetId = state.insertTargetNodeId;
		const slotInfo = parseSlotSelection(targetId);

		const newNodeId = slotInfo
			? operations.insertNode(componentType, slotInfo.parentId, slotInfo.slotName, "into")
			: operations.insertNode(componentType, targetId, undefined, "after");

		if (newNodeId) {
			setSelectedNodeId(newNodeId);
		}

		closeComponentPicker();
	}

	return {
		setClipboard,
		copyNode,
		cutNode,
		deleteNode,
		performPaste,
		pasteNode,
		requestInsert,
		closeComponentPicker,
		handleComponentSelect,
	};
}
