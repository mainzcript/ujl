import { findPathToNode, parseSlotSelection } from "$lib/utils/ujlc-tree.js";
import type { UJLCModuleObject } from "@ujl-framework/types";

export const SELECTION_PARENT_BASE_OPACITY = 0.5;

export function getSelectedModuleId(selectedNodeId: string | null): string | null {
	if (!selectedNodeId || parseSlotSelection(selectedNodeId)) return null;

	const [moduleId] = selectedNodeId.split(".");
	return moduleId || null;
}

export function getSelectionParentModuleIds(
	rootNodes: UJLCModuleObject[],
	selectedNodeId: string | null,
): string[] {
	const moduleId = getSelectedModuleId(selectedNodeId);
	if (!moduleId) return [];

	const path = findPathToNode(rootNodes, moduleId);
	return path ? [...path].reverse() : [];
}

export function getSelectionParentOpacity(parentDepth: number): number {
	return SELECTION_PARENT_BASE_OPACITY / 2 ** parentDepth;
}
