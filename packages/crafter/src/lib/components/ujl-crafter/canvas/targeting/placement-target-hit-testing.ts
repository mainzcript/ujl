import type { InsertRequest } from "$lib/stores/features/clipboard.js";
import type { PlacementTargetDefinition } from "./placement-target-definitions.js";
import type { RelativeRect } from "./quick-action-position.js";

export const PLACEMENT_TARGET_BUTTON_VISUAL_SIZE_PX = 36;

export function getInsertRequestKey(insertRequest: InsertRequest): string {
	if (insertRequest.position === "into") {
		return `into:${insertRequest.targetId}:${insertRequest.slotName ?? ""}`;
	}

	return `${insertRequest.position ?? "after"}:${insertRequest.targetId}`;
}

export function getPlacementTargetButtonRect(x: number, y: number): RelativeRect {
	const halfSize = PLACEMENT_TARGET_BUTTON_VISUAL_SIZE_PX / 2;

	return {
		left: x - halfSize,
		right: x + halfSize,
		top: y - halfSize,
		bottom: y + halfSize,
		width: PLACEMENT_TARGET_BUTTON_VISUAL_SIZE_PX,
		height: PLACEMENT_TARGET_BUTTON_VISUAL_SIZE_PX,
		centerX: x,
		centerY: y,
	};
}

export function getPlacementTargetAtPoint(
	definitions: PlacementTargetDefinition[],
	point: { x: number; y: number },
): PlacementTargetDefinition | null {
	for (const definition of definitions) {
		const rect = getPlacementTargetButtonRect(definition.x, definition.y);
		if (
			point.x >= rect.left &&
			point.x <= rect.right &&
			point.y >= rect.top &&
			point.y <= rect.bottom
		) {
			return definition;
		}
	}

	return null;
}

function getDistanceSquared(from: { x: number; y: number }, to: { x: number; y: number }): number {
	const deltaX = from.x - to.x;
	const deltaY = from.y - to.y;
	return deltaX * deltaX + deltaY * deltaY;
}

export function getNearestPlacementTarget(
	definitions: PlacementTargetDefinition[],
	point: { x: number; y: number },
): PlacementTargetDefinition | null {
	let nearestDefinition: PlacementTargetDefinition | null = null;
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

export function doRectsIntersect(a: RelativeRect, b: RelativeRect): boolean {
	return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
}

export function filterPlacementTargetsByActionBarCollision(
	definitions: PlacementTargetDefinition[],
	actionBarRect: RelativeRect | null,
): PlacementTargetDefinition[] {
	if (!actionBarRect) {
		return definitions;
	}

	return definitions.filter((definition) => {
		const buttonRect = getPlacementTargetButtonRect(definition.x, definition.y);
		return !doRectsIntersect(buttonRect, actionBarRect);
	});
}
