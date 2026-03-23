import { getContext, setContext } from "svelte";
import type { InsertRequest } from "./features/clipboard.js";

export const CANVAS_DRAG_CONTEXT = Symbol("canvas-drag-context");

export interface CanvasDragPointer {
	clientX: number;
	clientY: number;
}

export interface CanvasDragSnapshot {
	draggedModuleId: string | null;
	activeDropRequest: InsertRequest | null;
}

export interface CanvasDragContext {
	readonly draggedModuleId: string | null;
	readonly pointerId: number | null;
	readonly pointer: CanvasDragPointer | null;
	readonly activeDropRequest: InsertRequest | null;
	readonly isDragging: boolean;
	startDrag(moduleId: string, pointerId: number, point: CanvasDragPointer): void;
	updatePointer(point: CanvasDragPointer): void;
	setActiveDropRequest(request: InsertRequest | null): void;
	endDrag(): CanvasDragSnapshot;
	cancelDrag(): void;
}

export function createCanvasDragContext(): CanvasDragContext {
	let draggedModuleId = $state<string | null>(null);
	let pointerId = $state<number | null>(null);
	let pointer = $state<CanvasDragPointer | null>(null);
	let activeDropRequest = $state<InsertRequest | null>(null);

	function reset() {
		draggedModuleId = null;
		pointerId = null;
		pointer = null;
		activeDropRequest = null;
	}

	return {
		get draggedModuleId() {
			return draggedModuleId;
		},
		get pointerId() {
			return pointerId;
		},
		get pointer() {
			return pointer;
		},
		get activeDropRequest() {
			return activeDropRequest;
		},
		get isDragging() {
			return draggedModuleId !== null;
		},
		startDrag(moduleId: string, nextPointerId: number, point: CanvasDragPointer) {
			draggedModuleId = moduleId;
			pointerId = nextPointerId;
			pointer = point;
			activeDropRequest = null;
		},
		updatePointer(point: CanvasDragPointer) {
			pointer = point;
		},
		setActiveDropRequest(request: InsertRequest | null) {
			activeDropRequest = request;
		},
		endDrag() {
			const snapshot = {
				draggedModuleId,
				activeDropRequest,
			};
			reset();
			return snapshot;
		},
		cancelDrag() {
			reset();
		},
	};
}

export function getCanvasDragContext(): CanvasDragContext {
	const context = getContext<CanvasDragContext>(CANVAS_DRAG_CONTEXT);
	if (!context) {
		throw new Error(
			"CanvasDragContext not found. Make sure to call setCanvasDragContext() in a parent component.",
		);
	}
	return context;
}

export function setCanvasDragContext(context: CanvasDragContext) {
	setContext(CANVAS_DRAG_CONTEXT, context);
}
