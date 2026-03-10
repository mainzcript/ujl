import type { UJLCModuleObject } from "@ujl-framework/types";
import type { UJLClipboardData } from "./clipboard.js";
import { isModuleObject, isRootNode, ROOT_NODE_ID, ROOT_SLOT_NAME } from "./ujlc-tree.js";

interface SlotSelectionInfo {
	parentId: string;
	slotName: string;
}

interface CanPasteParams {
	selectedNodeId: string | null;
	selectedSlotInfo: SlotSelectionInfo | null;
	selectedNode: UJLCModuleObject | null;
	rootSlot: UJLCModuleObject[];
	clipboard: UJLClipboardData | null;
	findNodeById: (nodes: UJLCModuleObject[], nodeId: string) => UJLCModuleObject | null;
}

export function canPasteIntoSelection({
	selectedNodeId,
	selectedSlotInfo,
	selectedNode,
	rootSlot,
	clipboard,
	findNodeById,
}: CanPasteParams): boolean {
	if (!clipboard) return false;

	if (selectedNodeId === ROOT_NODE_ID) {
		return (
			isModuleObject(clipboard) ||
			(clipboard.type === "slot" && clipboard.slotName === ROOT_SLOT_NAME)
		);
	}

	if (!selectedNodeId) return false;

	if (selectedSlotInfo) {
		const parentNode = findNodeById(rootSlot, selectedSlotInfo.parentId);
		if (!parentNode && !isRootNode(selectedSlotInfo.parentId)) return false;

		if (isModuleObject(clipboard)) return true;

		if (clipboard.type === "slot") {
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
			(clipboard.type === "slot" && clipboard.slotName === ROOT_SLOT_NAME)
		);
	}

	if (!selectedNode) return false;

	if (isModuleObject(clipboard)) return true;

	if (clipboard.type === "slot" && selectedNode.slots) {
		return Object.keys(selectedNode.slots).includes(clipboard.slotName);
	}

	return false;
}
