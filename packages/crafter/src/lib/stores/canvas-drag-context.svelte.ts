import { getContext, setContext } from "svelte";
import type { InsertRequest } from "./features/clipboard.js";

export const CANVAS_DRAG_CONTEXT = Symbol("canvas-drag-context");

export interface CanvasDragPointer {
	clientX: number;
	clientY: number;
}

export interface CanvasDragMetadata {
	dragDisplayName: string;
	dragIconSvg: string | null;
}

export interface CanvasDragSnapshot {
	draggedModuleId: string | null;
	dragDisplayName: string | null;
	dragIconSvg: string | null;
	activeDropRequest: InsertRequest | null;
}

export interface CanvasDragContext {
	readonly draggedModuleId: string | null;
	readonly pointerId: number | null;
	readonly pointer: CanvasDragPointer | null;
	readonly dragDisplayName: string | null;
	readonly dragIconSvg: string | null;
	readonly activeDropRequest: InsertRequest | null;
	readonly isDragging: boolean;
	startDrag(
		moduleId: string,
		pointerId: number,
		point: CanvasDragPointer,
		metadata?: Partial<CanvasDragMetadata>,
	): void;
	updatePointer(point: CanvasDragPointer): void;
	setActiveDropRequest(request: InsertRequest | null): void;
	endDrag(): CanvasDragSnapshot;
	cancelDrag(): void;
}

export function createCanvasDragContext(): CanvasDragContext {
	let draggedModuleId = $state<string | null>(null);
	let pointerId = $state<number | null>(null);
	let pointer = $state<CanvasDragPointer | null>(null);
	let dragDisplayName = $state<string | null>(null);
	let dragIconSvg = $state<string | null>(null);
	let activeDropRequest = $state<InsertRequest | null>(null);

	function reset() {
		draggedModuleId = null;
		pointerId = null;
		pointer = null;
		dragDisplayName = null;
		dragIconSvg = null;
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
		get dragDisplayName() {
			return dragDisplayName;
		},
		get dragIconSvg() {
			return dragIconSvg;
		},
		get activeDropRequest() {
			return activeDropRequest;
		},
		get isDragging() {
			return draggedModuleId !== null;
		},
		startDrag(
			moduleId: string,
			nextPointerId: number,
			point: CanvasDragPointer,
			metadata: Partial<CanvasDragMetadata> = {},
		) {
			draggedModuleId = moduleId;
			pointerId = nextPointerId;
			pointer = point;
			dragDisplayName = metadata.dragDisplayName?.trim() || moduleId;
			dragIconSvg = metadata.dragIconSvg?.trim() || null;
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
				dragDisplayName,
				dragIconSvg,
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
