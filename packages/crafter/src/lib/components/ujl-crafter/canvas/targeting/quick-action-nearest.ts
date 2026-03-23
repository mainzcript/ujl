import { findNodeById, ROOT_SLOT_NAME } from "$lib/utils/ujlc-tree.js";
import type { UJLCModuleObject } from "@ujl-framework/types";

export interface PointerPosition {
	x: number;
	y: number;
}

export interface RectLike {
	left: number;
	right: number;
	top: number;
	bottom: number;
}

export function getDirectSlotChildIds(
	nodes: UJLCModuleObject[],
	ownerModuleId: string | null,
	slotName: string,
): string[] {
	if (ownerModuleId === null && slotName === ROOT_SLOT_NAME) {
		return nodes.map((child) => child.meta.id);
	}

	if (ownerModuleId === null) return [];

	const owner = findNodeById(nodes, ownerModuleId);
	if (!owner?.slots?.[slotName]) return [];

	return owner.slots[slotName].map((child) => child.meta.id);
}

export function getSquaredDistanceToRect(pointer: PointerPosition, rect: RectLike): number {
	const dx = Math.max(rect.left - pointer.x, 0, pointer.x - rect.right);
	const dy = Math.max(rect.top - pointer.y, 0, pointer.y - rect.bottom);

	return dx * dx + dy * dy;
}

export function findNearestModuleId(
	candidateIds: string[],
	pointer: PointerPosition,
	getRect: (moduleId: string) => RectLike | null,
): string | null {
	let bestId: string | null = null;
	let bestDistance = Number.POSITIVE_INFINITY;

	for (const moduleId of candidateIds) {
		const rect = getRect(moduleId);
		if (!rect) continue;

		const distance = getSquaredDistanceToRect(pointer, rect);
		if (distance < bestDistance) {
			bestId = moduleId;
			bestDistance = distance;
		}
	}

	return bestId;
}
