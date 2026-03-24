import type { UJLCModuleObject, UJLCSlotObject } from "@ujl-framework/types";
import { ROOT_SLOT_NAME } from "../../utils/ujlc-tree.js";
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
	insertTargetNodeId: InsertRequest | string | null;
	clipboard: UJLClipboardData | null;
}

interface SlotSelection {
	parentId: string;
	slotName: string;
}

export interface InsertRequest {
	targetId: string;
	slotName?: string;
	position?: "before" | "after" | "into";
}

interface ClipboardFeatureDeps {
	operations: CrafterOperations;
	state: ClipboardFeatureState;
	getRootSlot: () => UJLCSlotObject;
	setSelectedNodeId: (nodeId: string | null) => void;
	findParentOfNode: (
		nodes: UJLCModuleObject[],
		targetId: string,
	) => { parent: UJLCModuleObject | null; slotName: string; index: number } | null;
	parseSlotSelection: (selection: string | null) => SlotSelection | null;
	isModuleObject: (data: UJLClipboardData) => data is UJLCModuleObject;
	readFromBrowserClipboard: () => Promise<UJLClipboardData | null>;
	writeToBrowserClipboard: (data: UJLClipboardData) => Promise<void>;
}

export function createClipboardFeature(deps: ClipboardFeatureDeps) {
	const {
		operations,
		state,
		getRootSlot,
		setSelectedNodeId,
		findParentOfNode,
		parseSlotSelection,
		isModuleObject,
		readFromBrowserClipboard,
		writeToBrowserClipboard,
	} = deps;

	function resolveDeleteSelectionFallback(nodeId: string): string | null {
		const rootSlot = getRootSlot();
		const parentInfo = findParentOfNode(rootSlot, nodeId);

		if (!parentInfo) {
			return null;
		}

		const siblings =
			parentInfo.slotName === ROOT_SLOT_NAME
				? rootSlot
				: (parentInfo.parent?.slots?.[parentInfo.slotName] ?? []);

		return (
			siblings[parentInfo.index + 1]?.meta.id ?? siblings[parentInfo.index - 1]?.meta.id ?? null
		);
	}

	function normalizeInsertRequest(target: InsertRequest | string): InsertRequest {
		if (typeof target !== "string") {
			return {
				targetId: target.targetId,
				slotName: target.slotName,
				position: target.position ?? (target.slotName ? "into" : "after"),
			};
		}

		const slotInfo = parseSlotSelection(target);
		if (slotInfo) {
			return {
				targetId: slotInfo.parentId,
				slotName: slotInfo.slotName,
				position: "into",
			};
		}

		return {
			targetId: target,
			position: "after",
		};
	}

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
		const fallbackSelectionId = resolveDeleteSelectionFallback(nodeId);
		const success = operations.deleteNode(nodeId);
		if (success) {
			setSelectedNodeId(fallbackSelectionId);
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

	function requestInsert(target: InsertRequest | string): void {
		state.insertTargetNodeId = target;
		state.showComponentPicker = true;
	}

	function closeComponentPicker(): void {
		state.showComponentPicker = false;
		state.insertTargetNodeId = null;
	}

	function handleComponentSelect(componentType: string): void {
		if (!state.insertTargetNodeId) return;

		const insertRequest = normalizeInsertRequest(state.insertTargetNodeId);
		const newNodeId = operations.insertNode(
			componentType,
			insertRequest.targetId,
			insertRequest.slotName,
			insertRequest.position,
		);

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
