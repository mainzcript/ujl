import type { InsertRequest } from "$lib/stores/features/clipboard.js";
import type { UJLCModuleObject } from "@ujl-framework/types";
import type { FlowDirection, RelativeRect } from "./quick-action-position.js";
import { getEdgeAnchor, getGapAnchor } from "./quick-action-position.js";

export interface QuickActionSourceState {
	selectedModuleId?: string | null;
	hoveredModuleId?: string | null;
	nearestModuleId?: string | null;
}

export interface QuickActionDefinition {
	key: string;
	sourceModuleId: string;
	insertRequest: InsertRequest;
	x: number;
	y: number;
}

export interface SlotQuickActionContext {
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

export interface QuickActionVisibilityResolution {
	effectiveTrackedModuleIds: string[];
	nextHeldTransientModuleIds: string[];
	shouldScheduleHide: boolean;
}

const GAP_ESTIMATE_PX = 24;
const FLOW_LINE_OVERLAP_THRESHOLD = 0.3;
export const INSERT_BUTTON_VISUAL_SIZE_PX = 36;
export const QUICK_ACTION_HOLD_MS = 160;

export function getTrackedModuleIds(state: QuickActionSourceState): string[] {
	const ordered = [state.selectedModuleId, state.hoveredModuleId, state.nearestModuleId];
	const unique = new Set<string>();

	for (const moduleId of ordered) {
		if (moduleId) {
			unique.add(moduleId);
		}
	}

	return [...unique];
}

export function getTransientTrackedModuleIds(
	state: Pick<QuickActionSourceState, "hoveredModuleId" | "nearestModuleId">,
): string[] {
	return getTrackedModuleIds({
		hoveredModuleId: state.hoveredModuleId,
		nearestModuleId: state.nearestModuleId,
	});
}

export function getEffectiveTrackedModuleIds(
	selectedModuleId: string | null | undefined,
	transientModuleIds: string[],
): string[] {
	return getTrackedModuleIds({
		selectedModuleId,
		hoveredModuleId: transientModuleIds[0] ?? null,
		nearestModuleId: transientModuleIds[1] ?? null,
	});
}

export function resolveQuickActionVisibility(params: {
	selectedModuleId?: string | null;
	liveTransientModuleIds: string[];
	heldTransientModuleIds: string[];
	isQuickActionsHovered: boolean;
}): QuickActionVisibilityResolution {
	const {
		selectedModuleId = null,
		liveTransientModuleIds,
		heldTransientModuleIds,
		isQuickActionsHovered,
	} = params;

	if (liveTransientModuleIds.length > 0) {
		return {
			effectiveTrackedModuleIds: getEffectiveTrackedModuleIds(
				selectedModuleId,
				liveTransientModuleIds,
			),
			nextHeldTransientModuleIds: liveTransientModuleIds,
			shouldScheduleHide: false,
		};
	}

	if (selectedModuleId) {
		return {
			effectiveTrackedModuleIds: getEffectiveTrackedModuleIds(selectedModuleId, []),
			nextHeldTransientModuleIds: [],
			shouldScheduleHide: false,
		};
	}

	if (heldTransientModuleIds.length === 0) {
		return {
			effectiveTrackedModuleIds: [],
			nextHeldTransientModuleIds: [],
			shouldScheduleHide: false,
		};
	}

	return {
		effectiveTrackedModuleIds: getEffectiveTrackedModuleIds(null, heldTransientModuleIds),
		nextHeldTransientModuleIds: heldTransientModuleIds,
		shouldScheduleHide: !isQuickActionsHovered,
	};
}

export function getInsertRequestKey(insertRequest: InsertRequest): string {
	if (insertRequest.position === "into") {
		return `into:${insertRequest.targetId}:${insertRequest.slotName ?? ""}`;
	}

	return `${insertRequest.position ?? "after"}:${insertRequest.targetId}`;
}

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
	context: SlotQuickActionContext,
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

		return {
			x: edge === "before" ? rect.centerX - distanceFromCenter : rect.centerX + distanceFromCenter,
			y: referenceAnchor.y,
		};
	}

	const distanceFromCenter = Math.abs(referenceAnchor.y - rect.centerY);

	return {
		x: referenceAnchor.x,
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

export function getInsertButtonRect(x: number, y: number): RelativeRect {
	const halfSize = INSERT_BUTTON_VISUAL_SIZE_PX / 2;

	return {
		left: x - halfSize,
		right: x + halfSize,
		top: y - halfSize,
		bottom: y + halfSize,
		width: INSERT_BUTTON_VISUAL_SIZE_PX,
		height: INSERT_BUTTON_VISUAL_SIZE_PX,
		centerX: x,
		centerY: y,
	};
}

export function doRectsIntersect(a: RelativeRect, b: RelativeRect): boolean {
	return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
}

export function filterQuickActionDefinitionsByIslandCollision(
	definitions: QuickActionDefinition[],
	islandRect: RelativeRect | null,
): QuickActionDefinition[] {
	if (!islandRect) {
		return definitions;
	}

	return definitions.filter((definition) => {
		const buttonRect = getInsertButtonRect(definition.x, definition.y);
		return !doRectsIntersect(buttonRect, islandRect);
	});
}

export function calculateQuickActionDefinitions(
	moduleId: string,
	context: SlotQuickActionContext,
	getRelativeRect: (moduleId: string) => RelativeRect | null,
): QuickActionDefinition[] {
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

	const definitions: QuickActionDefinition[] = [];

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

export function dedupeQuickActionDefinitions(
	definitions: QuickActionDefinition[],
): QuickActionDefinition[] {
	const deduped = new Map<string, QuickActionDefinition>();

	for (const definition of definitions) {
		const dedupeKey = getInsertRequestKey(definition.insertRequest);
		if (!deduped.has(dedupeKey)) {
			deduped.set(dedupeKey, definition);
		}
	}

	return [...deduped.values()];
}
