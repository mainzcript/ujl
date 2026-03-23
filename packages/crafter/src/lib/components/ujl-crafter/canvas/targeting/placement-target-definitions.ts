import type { InsertRequest } from "$lib/stores/features/clipboard.js";
import { isValidMoveInsertRequest } from "$lib/utils/ujlc-tree.js";
import type { UJLCModuleObject } from "@ujl-framework/types";
import type { FlowDirection, RelativeRect } from "./quick-action-position.js";
import { getEdgeAnchor, getGapAnchor } from "./quick-action-position.js";

export interface PlacementTargetDefinition {
	key: string;
	sourceModuleId: string;
	insertRequest: InsertRequest;
	x: number;
	y: number;
}

export interface SlotPlacementContext {
	ownerModuleId: string | null;
	slotName: string;
	slotRect: RelativeRect | null;
	siblings: UJLCModuleObject[];
}

export interface SlotMetrics {
	slotRect: RelativeRect | null;
	childRects: RelativeRect[];
	slotWidth: number;
	slotHeight: number;
	childCount: number;
}

const GAP_ESTIMATE_PX = 24;
const FLOW_LINE_OVERLAP_THRESHOLD = 0.3;

function hasMeaningfulAxisOverlap(
	fromRect: RelativeRect,
	toRect: RelativeRect,
	direction: FlowDirection,
): boolean {
	const overlap =
		direction === "horizontal"
			? Math.min(fromRect.bottom, toRect.bottom) - Math.max(fromRect.top, toRect.top)
			: Math.min(fromRect.right, toRect.right) - Math.max(fromRect.left, toRect.left);

	if (overlap <= 0) {
		return false;
	}

	const referenceSize =
		direction === "horizontal"
			? Math.min(fromRect.height, toRect.height)
			: Math.min(fromRect.width, toRect.width);

	return referenceSize > 0 && overlap / referenceSize >= FLOW_LINE_OVERLAP_THRESHOLD;
}

function isFlowNeighbor(
	fromRect: RelativeRect,
	toRect: RelativeRect,
	direction: FlowDirection,
): boolean {
	if (!hasMeaningfulAxisOverlap(fromRect, toRect, direction)) {
		return false;
	}

	if (direction === "horizontal") {
		return toRect.centerX > fromRect.centerX;
	}

	return toRect.centerY > fromRect.centerY;
}

function collectChildRects(
	siblings: UJLCModuleObject[],
	getRelativeRect: (moduleId: string) => RelativeRect | null,
): RelativeRect[] {
	return siblings
		.map((sibling) => getRelativeRect(sibling.meta.id))
		.filter((rect): rect is RelativeRect => rect !== null);
}

export function getSlotMetrics(
	context: SlotPlacementContext,
	getRelativeRect: (moduleId: string) => RelativeRect | null,
): SlotMetrics {
	return {
		slotRect: context.slotRect,
		childRects: collectChildRects(context.siblings, getRelativeRect),
		slotWidth: context.slotRect?.width ?? 0,
		slotHeight: context.slotRect?.height ?? 0,
		childCount: context.siblings.length,
	};
}

function getMirroredAnchor(
	rect: RelativeRect,
	referenceAnchor: { x: number; y: number },
	direction: FlowDirection,
	edge: "before" | "after",
): { x: number; y: number } {
	if (direction === "horizontal") {
		const distanceFromCenter = Math.abs(referenceAnchor.x - rect.centerX);
		const mirroredY =
			referenceAnchor.y >= rect.top && referenceAnchor.y <= rect.bottom
				? referenceAnchor.y
				: rect.centerY;

		return {
			x: edge === "before" ? rect.centerX - distanceFromCenter : rect.centerX + distanceFromCenter,
			y: mirroredY,
		};
	}

	const distanceFromCenter = Math.abs(referenceAnchor.y - rect.centerY);
	const mirroredX =
		referenceAnchor.x >= rect.left && referenceAnchor.x <= rect.right
			? referenceAnchor.x
			: rect.centerX;

	return {
		x: mirroredX,
		y: edge === "before" ? rect.centerY - distanceFromCenter : rect.centerY + distanceFromCenter,
	};
}

export function inferSlotFlowDirection(metrics: SlotMetrics): FlowDirection {
	if (metrics.childRects.length === 0) {
		return "vertical";
	}

	if (metrics.childRects.length === 1) {
		if (!metrics.slotRect) {
			return "vertical";
		}

		const [childRect] = metrics.childRects;
		const fitsSecondBeside = metrics.slotRect.width >= childRect.width * 2 + GAP_ESTIMATE_PX;

		return fitsSecondBeside ? "horizontal" : "vertical";
	}

	for (let index = 0; index < metrics.childRects.length - 1; index += 1) {
		const currentRect = metrics.childRects[index];

		for (let nextIndex = index + 1; nextIndex < metrics.childRects.length; nextIndex += 1) {
			const nextRect = metrics.childRects[nextIndex];

			if (
				hasMeaningfulAxisOverlap(currentRect, nextRect, "horizontal") &&
				nextRect.centerX !== currentRect.centerX
			) {
				return "horizontal";
			}
		}
	}

	return "vertical";
}

export function filterPlacementTargetDefinitionsByMoveValidity(
	definitions: PlacementTargetDefinition[],
	rootNodes: UJLCModuleObject[],
	draggedModuleId: string | null,
): PlacementTargetDefinition[] {
	if (!draggedModuleId) {
		return definitions;
	}

	return definitions.filter((definition) =>
		isValidMoveInsertRequest(rootNodes, draggedModuleId, definition.insertRequest),
	);
}

export function calculatePlacementTargetDefinitions(
	moduleId: string,
	context: SlotPlacementContext,
	getRelativeRect: (moduleId: string) => RelativeRect | null,
): PlacementTargetDefinition[] {
	const currentIndex = context.siblings.findIndex((m) => m.meta.id === moduleId);
	if (currentIndex === -1) return [];

	const currentRect = getRelativeRect(moduleId);
	if (!currentRect) return [];

	const previousModule = context.siblings[currentIndex - 1];
	const nextModule = context.siblings[currentIndex + 1];
	const previousRect = previousModule ? getRelativeRect(previousModule.meta.id) : null;
	const nextRect = nextModule ? getRelativeRect(nextModule.meta.id) : null;
	const direction = inferSlotFlowDirection(getSlotMetrics(context, getRelativeRect));
	const hasPreviousGap = previousRect
		? isFlowNeighbor(previousRect, currentRect, direction)
		: false;
	const hasNextGap = nextRect ? isFlowNeighbor(currentRect, nextRect, direction) : false;
	const beforeGapAnchor =
		hasPreviousGap && previousRect ? getGapAnchor(previousRect, currentRect, direction) : null;
	const afterGapAnchor =
		hasNextGap && nextRect ? getGapAnchor(currentRect, nextRect, direction) : null;

	const definitions: PlacementTargetDefinition[] = [];

	if (beforeGapAnchor) {
		definitions.push({
			key: `before-gap-${moduleId}`,
			sourceModuleId: moduleId,
			insertRequest: { targetId: moduleId, position: "before" },
			x: beforeGapAnchor.x,
			y: beforeGapAnchor.y,
		});
	}

	if (afterGapAnchor) {
		definitions.push({
			key: `after-gap-${moduleId}`,
			sourceModuleId: moduleId,
			insertRequest: { targetId: moduleId, position: "after" },
			x: afterGapAnchor.x,
			y: afterGapAnchor.y,
		});
	}

	if (!hasPreviousGap) {
		const anchor =
			afterGapAnchor && hasNextGap
				? getMirroredAnchor(currentRect, afterGapAnchor, direction, "before")
				: getEdgeAnchor(currentRect, direction, "before");
		definitions.push({
			key: `before-edge-${moduleId}`,
			sourceModuleId: moduleId,
			insertRequest: { targetId: moduleId, position: "before" },
			x: anchor.x,
			y: anchor.y,
		});
	}

	if (!hasNextGap) {
		const anchor =
			beforeGapAnchor && hasPreviousGap
				? getMirroredAnchor(currentRect, beforeGapAnchor, direction, "after")
				: getEdgeAnchor(currentRect, direction, "after");
		definitions.push({
			key: `after-edge-${moduleId}`,
			sourceModuleId: moduleId,
			insertRequest: { targetId: moduleId, position: "after" },
			x: anchor.x,
			y: anchor.y,
		});
	}

	return definitions;
}

export function dedupePlacementTargetDefinitions(
	definitions: PlacementTargetDefinition[],
	getInsertRequestKey: (insertRequest: InsertRequest) => string,
): PlacementTargetDefinition[] {
	const deduped = new Map<string, PlacementTargetDefinition>();

	for (const definition of definitions) {
		const dedupeKey = getInsertRequestKey(definition.insertRequest);
		if (!deduped.has(dedupeKey)) {
			deduped.set(dedupeKey, definition);
		}
	}

	return [...deduped.values()];
}
