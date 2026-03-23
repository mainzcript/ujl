import { getContext, setContext } from "svelte";

export const HOVER_TARGET_CONTEXT = Symbol("hover-target-context");

export interface HoverTargetContext {
	readonly hoveredModuleId: string | null;
	setHoveredModuleId(moduleId: string | null): void;
}

export function createHoverTargetContext(): HoverTargetContext {
	let hoveredModuleId = $state<string | null>(null);

	return {
		get hoveredModuleId() {
			return hoveredModuleId;
		},
		setHoveredModuleId(moduleId: string | null) {
			hoveredModuleId = moduleId;
		},
	};
}

export function getHoverTargetContext(): HoverTargetContext {
	const context = getContext<HoverTargetContext>(HOVER_TARGET_CONTEXT);
	if (!context) {
		throw new Error(
			"HoverTargetContext not found. Make sure to call setHoverTargetContext() in a parent component.",
		);
	}
	return context;
}

export function setHoverTargetContext(context: HoverTargetContext) {
	setContext(HOVER_TARGET_CONTEXT, context);
}
