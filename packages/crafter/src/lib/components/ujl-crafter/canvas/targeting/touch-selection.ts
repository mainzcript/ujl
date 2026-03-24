export interface TouchTapSession {
	pointerId: number;
	startX: number;
	startY: number;
	targetModuleId: string;
}

export function isTapSelectionPointerType(pointerType: string): boolean {
	return pointerType === "touch" || pointerType === "pen";
}

export function resolveModuleIdFromEventTarget(target: EventTarget | null): string | null {
	return (
		(target as HTMLElement | null)
			?.closest("[data-ujl-module-id]")
			?.getAttribute("data-ujl-module-id") ?? null
	);
}

export function createTouchTapSession(
	pointerId: number,
	point: { clientX: number; clientY: number },
	targetModuleId: string | null,
): TouchTapSession | null {
	if (!targetModuleId) {
		return null;
	}

	return {
		pointerId,
		startX: point.clientX,
		startY: point.clientY,
		targetModuleId,
	};
}

export function shouldCancelTouchTapSession(
	session: TouchTapSession | null,
	point: { clientX: number; clientY: number },
	thresholdPx: number,
): boolean {
	if (!session) {
		return false;
	}

	return (
		Math.abs(point.clientX - session.startX) > thresholdPx ||
		Math.abs(point.clientY - session.startY) > thresholdPx
	);
}

export function resolveTouchTapSelectionTarget(
	session: TouchTapSession | null,
	target: EventTarget | null,
): string | null {
	if (!session) {
		return null;
	}

	const currentTargetModuleId = resolveModuleIdFromEventTarget(target);
	return currentTargetModuleId === session.targetModuleId ? session.targetModuleId : null;
}

export function shouldSuppressSyntheticMouseEvent(
	inputMode: "mouse" | "touch" | "pen" | null,
	lastTouchTimestamp: number | null,
	now: number,
	suppressionMs: number,
): boolean {
	return (
		(inputMode === "touch" || inputMode === "pen") &&
		lastTouchTimestamp !== null &&
		now - lastTouchTimestamp < suppressionMs
	);
}
