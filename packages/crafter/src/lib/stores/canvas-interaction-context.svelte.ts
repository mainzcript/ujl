import type { ActiveSlotTarget } from "$lib/components/ujl-crafter/canvas/targeting/pointer-targets.js";
import { getContext, setContext } from "svelte";
import type { CanvasDragPointer } from "./canvas-drag-context.svelte.js";

export const CANVAS_INTERACTION_CONTEXT = Symbol("canvas-interaction-context");

export type CanvasInputMode = "mouse" | "touch" | "pen";

export interface CanvasInteractionContext {
	readonly pointer: CanvasDragPointer | null;
	readonly inputMode: CanvasInputMode | null;
	readonly hoveredModuleId: string | null;
	readonly activeSlot: ActiveSlotTarget | null;
	readonly activePlaceholderSlot: ActiveSlotTarget | null;
	readonly isHoveringDraggedSource: boolean;
	readonly lastValidSlot: ActiveSlotTarget | null;
	readonly nearestModuleId: string | null;
	updateState(next: {
		pointer: CanvasDragPointer | null;
		inputMode?: CanvasInputMode | null;
		hoveredModuleId: string | null;
		activeSlot: ActiveSlotTarget | null;
		activePlaceholderSlot?: ActiveSlotTarget | null;
		isHoveringDraggedSource?: boolean;
		nearestModuleId: string | null;
	}): void;
	clear(): void;
}

export function createCanvasInteractionContext(): CanvasInteractionContext {
	let pointer = $state<CanvasDragPointer | null>(null);
	let inputMode = $state<CanvasInputMode | null>(null);
	let hoveredModuleId = $state<string | null>(null);
	let activeSlot = $state<ActiveSlotTarget | null>(null);
	let activePlaceholderSlot = $state<ActiveSlotTarget | null>(null);
	let isHoveringDraggedSource = $state(false);
	let lastValidSlot = $state<ActiveSlotTarget | null>(null);
	let nearestModuleId = $state<string | null>(null);

	return {
		get pointer() {
			return pointer;
		},
		get inputMode() {
			return inputMode;
		},
		get hoveredModuleId() {
			return hoveredModuleId;
		},
		get activeSlot() {
			return activeSlot;
		},
		get activePlaceholderSlot() {
			return activePlaceholderSlot;
		},
		get isHoveringDraggedSource() {
			return isHoveringDraggedSource;
		},
		get lastValidSlot() {
			return lastValidSlot;
		},
		get nearestModuleId() {
			return nearestModuleId;
		},
		updateState(next) {
			pointer = next.pointer;
			if (next.inputMode !== undefined) {
				inputMode = next.inputMode;
			}
			hoveredModuleId = next.hoveredModuleId;
			activeSlot = next.activeSlot;
			activePlaceholderSlot = next.activePlaceholderSlot ?? null;
			isHoveringDraggedSource = next.isHoveringDraggedSource ?? false;
			if (next.activeSlot) {
				lastValidSlot = next.activeSlot;
			}
			nearestModuleId = next.nearestModuleId;
		},
		clear() {
			pointer = null;
			inputMode = null;
			hoveredModuleId = null;
			activeSlot = null;
			activePlaceholderSlot = null;
			isHoveringDraggedSource = false;
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
