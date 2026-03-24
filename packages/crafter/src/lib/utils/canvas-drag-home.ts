import type { InsertRequest } from "$lib/stores/features/clipboard.js";
import type { UJLCModuleObject } from "@ujl-framework/types";
import { findParentOfNode, ROOT_NODE_ID } from "./ujlc-tree.js";

export interface CanvasDragHomePosition {
	ownerModuleId: string | null;
	slotName: string;
	previousSiblingId: string | null;
	nextSiblingId: string | null;
}

export function getCanvasDragHomePosition(
	rootNodes: UJLCModuleObject[],
	moduleId: string,
): CanvasDragHomePosition | null {
	const parentInfo = findParentOfNode(rootNodes, moduleId);
	if (!parentInfo?.parent) {
		return null;
	}

	const ownerModuleId =
		parentInfo.parent.meta.id === ROOT_NODE_ID ? null : parentInfo.parent.meta.id;
	const siblings =
		ownerModuleId === null ? rootNodes : (parentInfo.parent.slots?.[parentInfo.slotName] ?? []);

	return {
		ownerModuleId,
		slotName: parentInfo.slotName,
		previousSiblingId: siblings[parentInfo.index - 1]?.meta.id ?? null,
		nextSiblingId: siblings[parentInfo.index + 1]?.meta.id ?? null,
	};
}

export function getCanvasDragHomeTrackedModuleIds(
	homePosition: CanvasDragHomePosition | null,
): string[] {
	if (!homePosition) {
		return [];
	}

	return [
		...new Set(
			[homePosition.previousSiblingId, homePosition.nextSiblingId].filter(
				(moduleId): moduleId is string => Boolean(moduleId),
			),
		),
	];
}

export function getCanvasDragHomeInsertRequests(
	homePosition: CanvasDragHomePosition | null,
): InsertRequest[] {
	if (!homePosition) {
		return [];
	}

	const requests: InsertRequest[] = [];

	if (homePosition.nextSiblingId) {
		requests.push({
			targetId: homePosition.nextSiblingId,
			position: "before",
		});
	}

	if (homePosition.previousSiblingId) {
		requests.push({
			targetId: homePosition.previousSiblingId,
			position: "after",
		});
	}

	requests.push({
		targetId: homePosition.ownerModuleId ?? ROOT_NODE_ID,
		slotName: homePosition.slotName,
		position: "into",
	});

	return requests;
}
