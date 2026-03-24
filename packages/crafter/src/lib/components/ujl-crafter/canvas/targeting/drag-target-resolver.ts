import type { InsertRequest } from "$lib/stores/features/clipboard.js";
import type { CanvasDragHomePosition } from "$lib/utils/canvas-drag-home.js";
import { getCanvasDragHomeInsertRequests } from "$lib/utils/canvas-drag-home.js";
import type { UJLCModuleObject } from "@ujl-framework/types";
import type { ActiveSlotTarget } from "./pointer-targets.js";
import {
	findSemanticallyEquivalentInsertTarget,
	getSlotPlaceholderInsertRequest,
} from "./slot-placeholder-targets.js";

export interface DragRenderTargetDefinition {
	insertRequest: InsertRequest;
	kind: "placement" | "placeholder";
	x: number;
	y: number;
}

interface ResolveActiveDragTargetInput<T extends DragRenderTargetDefinition> {
	rootNodes: UJLCModuleObject[];
	definitions: T[];
	pointer: { x: number; y: number } | null;
	activePlaceholderSlot: ActiveSlotTarget | null;
	isHoveringDraggedSource: boolean;
	homePosition: CanvasDragHomePosition | null;
}

function getDistanceSquared(from: { x: number; y: number }, to: { x: number; y: number }): number {
	const deltaX = from.x - to.x;
	const deltaY = from.y - to.y;
	return deltaX * deltaX + deltaY * deltaY;
}

function getNearestTarget<T extends DragRenderTargetDefinition>(
	definitions: T[],
	point: { x: number; y: number },
): T | null {
	let nearestDefinition: T | null = null;
	let nearestDistance = Number.POSITIVE_INFINITY;

	for (const definition of definitions) {
		const distance = getDistanceSquared(point, { x: definition.x, y: definition.y });
		if (distance < nearestDistance) {
			nearestDefinition = definition;
			nearestDistance = distance;
		}
	}

	return nearestDefinition;
}

function matchesActivePlaceholderSlot(
	insertRequest: InsertRequest,
	activePlaceholderSlot: ActiveSlotTarget | null,
): boolean {
	if (!activePlaceholderSlot || insertRequest.position !== "into") {
		return false;
	}

	return (
		insertRequest.slotName === activePlaceholderSlot.slotName &&
		((insertRequest.targetId === "__root__" && activePlaceholderSlot.ownerModuleId === null) ||
			insertRequest.targetId === activePlaceholderSlot.ownerModuleId)
	);
}

function findDefinitionByExactInsertRequest<T extends DragRenderTargetDefinition>(
	definitions: T[],
	request: InsertRequest,
): T | null {
	return (
		definitions.find((definition) => {
			const candidate = definition.insertRequest;
			return (
				candidate.targetId === request.targetId &&
				candidate.slotName === request.slotName &&
				candidate.position === request.position
			);
		}) ?? null
	);
}

function resolveHomeDropTarget<T extends DragRenderTargetDefinition>(
	rootNodes: UJLCModuleObject[],
	definitions: T[],
	homePosition: CanvasDragHomePosition | null,
): T | null {
	if (!homePosition) {
		return null;
	}

	for (const request of getCanvasDragHomeInsertRequests(homePosition)) {
		if (request.position === "into") {
			return findSemanticallyEquivalentInsertTarget(
				rootNodes,
				definitions,
				getSlotPlaceholderInsertRequest(homePosition.ownerModuleId, homePosition.slotName),
			);
		}

		const exactDefinition = findDefinitionByExactInsertRequest(definitions, request);
		if (exactDefinition) {
			return exactDefinition;
		}
	}

	return null;
}

export function resolveActiveDragTarget<T extends DragRenderTargetDefinition>({
	rootNodes,
	definitions,
	pointer,
	activePlaceholderSlot,
	isHoveringDraggedSource,
	homePosition,
}: ResolveActiveDragTargetInput<T>): T | null {
	if (isHoveringDraggedSource) {
		const homeDefinition = resolveHomeDropTarget(rootNodes, definitions, homePosition);
		if (homeDefinition) {
			return homeDefinition;
		}
	}

	const activePlaceholderDefinition =
		definitions.find(
			(definition) =>
				definition.kind === "placeholder" &&
				matchesActivePlaceholderSlot(definition.insertRequest, activePlaceholderSlot),
		) ?? null;
	if (activePlaceholderDefinition) {
		return activePlaceholderDefinition;
	}

	if (!pointer) {
		return null;
	}

	return getNearestTarget(definitions, pointer);
}
