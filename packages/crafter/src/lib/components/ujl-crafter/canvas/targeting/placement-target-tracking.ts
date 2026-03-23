export interface PlacementTargetSourceState {
	selectedModuleId?: string | null;
	hoveredModuleId?: string | null;
	nearestModuleId?: string | null;
}

export interface PlacementTargetVisibilityResolution {
	effectiveTrackedModuleIds: string[];
	nextHeldTransientModuleIds: string[];
	shouldScheduleHide: boolean;
}

export const PLACEMENT_TARGET_HOLD_MS = 160;

export function resolveTrackedModuleIds(state: PlacementTargetSourceState): string[] {
	const ordered = [state.selectedModuleId, state.hoveredModuleId, state.nearestModuleId];
	const unique = new Set<string>();

	for (const moduleId of ordered) {
		if (moduleId) {
			unique.add(moduleId);
		}
	}

	return [...unique];
}

export function resolveTransientTrackedModuleIds(
	state: Pick<PlacementTargetSourceState, "hoveredModuleId" | "nearestModuleId">,
): string[] {
	return resolveTrackedModuleIds({
		hoveredModuleId: state.hoveredModuleId,
		nearestModuleId: state.nearestModuleId,
	});
}

export function resolveEffectiveTrackedModuleIds(
	selectedModuleId: string | null | undefined,
	transientModuleIds: string[],
): string[] {
	return resolveTrackedModuleIds({
		selectedModuleId,
		hoveredModuleId: transientModuleIds[0] ?? null,
		nearestModuleId: transientModuleIds[1] ?? null,
	});
}

export function resolvePlacementTargetVisibility(params: {
	selectedModuleId?: string | null;
	liveTransientModuleIds: string[];
	heldTransientModuleIds: string[];
	isPlacementTargetsHovered: boolean;
}): PlacementTargetVisibilityResolution {
	const {
		selectedModuleId = null,
		liveTransientModuleIds,
		heldTransientModuleIds,
		isPlacementTargetsHovered,
	} = params;

	if (liveTransientModuleIds.length > 0) {
		return {
			effectiveTrackedModuleIds: resolveEffectiveTrackedModuleIds(
				selectedModuleId,
				liveTransientModuleIds,
			),
			nextHeldTransientModuleIds: liveTransientModuleIds,
			shouldScheduleHide: false,
		};
	}

	if (selectedModuleId) {
		return {
			effectiveTrackedModuleIds: resolveEffectiveTrackedModuleIds(selectedModuleId, []),
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
		effectiveTrackedModuleIds: resolveEffectiveTrackedModuleIds(null, heldTransientModuleIds),
		nextHeldTransientModuleIds: heldTransientModuleIds,
		shouldScheduleHide: !isPlacementTargetsHovered,
	};
}
