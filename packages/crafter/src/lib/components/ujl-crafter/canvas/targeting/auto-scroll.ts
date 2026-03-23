export type AutoScrollEdgeZone = "top" | "bottom" | null;

export interface AutoScrollEdgeState {
	activeZone: AutoScrollEdgeZone;
	zoneEnteredAt: number | null;
}

interface VerticalRect {
	top: number;
	bottom: number;
}

export function getAutoScrollEdgeZone(
	pointerY: number,
	containerRect: VerticalRect,
	edgePx: number,
): AutoScrollEdgeZone {
	const topZoneEnd = containerRect.top + edgePx;
	if (pointerY < topZoneEnd) {
		return "top";
	}

	const bottomZoneStart = containerRect.bottom - edgePx;
	if (pointerY > bottomZoneStart) {
		return "bottom";
	}

	return null;
}

export function getAutoScrollDelta(
	pointerY: number,
	containerRect: VerticalRect,
	edgePx: number,
	maxStepPx: number,
): number {
	const activeZone = getAutoScrollEdgeZone(pointerY, containerRect, edgePx);

	if (activeZone === "top") {
		const distance = containerRect.top + edgePx - pointerY;
		return -(Math.min(distance / edgePx, 1) * maxStepPx);
	}

	if (activeZone === "bottom") {
		const distance = pointerY - (containerRect.bottom - edgePx);
		return Math.min(distance / edgePx, 1) * maxStepPx;
	}

	return 0;
}

export function resolveAutoScrollEdgeState(
	currentZone: AutoScrollEdgeZone,
	previousState: AutoScrollEdgeState,
	now: number,
	delayMs: number,
): { nextState: AutoScrollEdgeState; isScrollActive: boolean } {
	if (currentZone === null) {
		return {
			nextState: { activeZone: null, zoneEnteredAt: null },
			isScrollActive: false,
		};
	}

	if (previousState.activeZone !== currentZone) {
		return {
			nextState: { activeZone: currentZone, zoneEnteredAt: now },
			isScrollActive: false,
		};
	}

	const zoneEnteredAt = previousState.zoneEnteredAt ?? now;

	return {
		nextState: { activeZone: currentZone, zoneEnteredAt },
		isScrollActive: now - zoneEnteredAt >= delayMs,
	};
}
