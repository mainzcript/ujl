import type { ActiveSlotTarget } from "$lib/components/ujl-crafter/canvas/targeting/pointer-targets.js";
import { getContext, setContext } from "svelte";
import type { CanvasDragPointer } from "./canvas-drag-context.svelte.js";

export const CANVAS_INTERACTION_CONTEXT = Symbol("canvas-interaction-context");

export interface CanvasInteractionContext {
	readonly pointer: CanvasDragPointer | null;
	readonly hoveredModuleId: string | null;
	readonly activeSlot: ActiveSlotTarget | null;
	readonly lastValidSlot: ActiveSlotTarget | null;
	readonly nearestModuleId: string | null;
	updateState(next: {
		pointer: CanvasDragPointer | null;
		hoveredModuleId: string | null;
		activeSlot: ActiveSlotTarget | null;
		nearestModuleId: string | null;
	}): void;
	clear(): void;
}

export function createCanvasInteractionContext(): CanvasInteractionContext {
	let pointer = $state<CanvasDragPointer | null>(null);
	let hoveredModuleId = $state<string | null>(null);
	let activeSlot = $state<ActiveSlotTarget | null>(null);
	let lastValidSlot = $state<ActiveSlotTarget | null>(null);
	let nearestModuleId = $state<string | null>(null);

	return {
		get pointer() {
			return pointer;
		},
		get hoveredModuleId() {
			return hoveredModuleId;
		},
		get activeSlot() {
			return activeSlot;
		},
		get lastValidSlot() {
			return lastValidSlot;
		},
		get nearestModuleId() {
			return nearestModuleId;
		},
		updateState(next) {
			pointer = next.pointer;
			hoveredModuleId = next.hoveredModuleId;
			activeSlot = next.activeSlot;
			if (next.activeSlot) {
				lastValidSlot = next.activeSlot;
			}
			nearestModuleId = next.nearestModuleId;
		},
		clear() {
			pointer = null;
			hoveredModuleId = null;
			activeSlot = null;
			lastValidSlot = null;
			nearestModuleId = null;
		},
	};
}

export function getCanvasInteractionContext(): CanvasInteractionContext {
	const context = getContext<CanvasInteractionContext>(CANVAS_INTERACTION_CONTEXT);
	if (!context) {
		throw new Error(
			"CanvasInteractionContext not found. Make sure to call setCanvasInteractionContext() in a parent component.",
		);
	}
	return context;
}

export function setCanvasInteractionContext(context: CanvasInteractionContext) {
	setContext(CANVAS_INTERACTION_CONTEXT, context);
}
