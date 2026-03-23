export interface RelativeRect {
	left: number;
	right: number;
	top: number;
	bottom: number;
	width: number;
	height: number;
	centerX: number;
	centerY: number;
}

export type FlowDirection = "horizontal" | "vertical";

function areIntervalsDisjoint(startA: number, endA: number, startB: number, endB: number): boolean {
	return endA < startB || endB < startA;
}

function getUnionCenterOrFallback(
	startA: number,
	endA: number,
	startB: number,
	endB: number,
	fallback: number,
): number {
	if (areIntervalsDisjoint(startA, endA, startB, endB)) {
		return fallback;
	}

	const unionStart = Math.min(startA, startB);
	const unionEnd = Math.max(endA, endB);

	return unionStart + (unionEnd - unionStart) / 2;
}

export function getGapAnchor(
	fromRect: RelativeRect,
	toRect: RelativeRect,
	direction: FlowDirection,
): { x: number; y: number } {
	if (direction === "horizontal") {
		return {
			x: (fromRect.right + toRect.left) / 2,
			y: getUnionCenterOrFallback(
				fromRect.top,
				fromRect.bottom,
				toRect.top,
				toRect.bottom,
				fromRect.centerY,
			),
		};
	}

	return {
		x: getUnionCenterOrFallback(
			fromRect.left,
			fromRect.right,
			toRect.left,
			toRect.right,
			fromRect.centerX,
		),
		y: (fromRect.bottom + toRect.top) / 2,
	};
}

export function getEdgeAnchor(
	rect: RelativeRect,
	direction: FlowDirection,
	edge: "before" | "after",
): { x: number; y: number } {
	if (direction === "horizontal") {
		return {
			x: edge === "before" ? rect.left : rect.right,
			y: rect.centerY,
		};
	}

	return {
		x: rect.centerX,
		y: edge === "before" ? rect.top : rect.bottom,
	};
}
