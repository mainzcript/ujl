/**
 * Enhanced Drag & Drop state management with slot dragging support
 * Uses Svelte 5 runes for reactive state
 */

export type DragPosition = "before" | "after" | "into" | null;
export type DragType = "node" | "slot";

export interface DragState {
	draggedNodeId: string | null;
	draggedSlotName: string | null;
	draggedSlotParentId: string | null;
	dragType: DragType | null;
	dropTargetId: string | null;
	dropTargetSlot: string | null;
	dropPosition: DragPosition;
}

export interface DragHandlers {
	handleDragStart: (event: DragEvent, nodeId: string) => void;
	handleSlotDragStart: (event: DragEvent, parentId: string, slotName: string) => void;
	handleDragOver: (event: DragEvent, targetNodeId: string) => void;
	handleDragLeave: () => void;
	handleDrop: (event: DragEvent, targetNodeId: string, slotName?: string) => void;
	handleDragEnd: () => void;
	handleSlotDragOver: (event: DragEvent, parentNodeId: string, slotName: string) => void;
	reset: () => void;
}

export type DragHandler = DragState & DragHandlers;

/**
 * Creates a drag & drop handler with reactive state and event handlers
 */
export function createDragHandler(
	onNodeMove?: (
		nodeId: string,
		targetId: string,
		slotName?: string,
		position?: "before" | "after" | "into",
	) => boolean,
	onSlotMove?: (
		sourceParentId: string,
		sourceSlotName: string,
		targetParentId: string,
		targetSlotName: string,
	) => boolean,
): DragHandler {
	// Reactive state using Svelte 5 runes
	let draggedNodeId = $state<string | null>(null);
	let draggedSlotName = $state<string | null>(null);
	let draggedSlotParentId = $state<string | null>(null);
	let dragType = $state<DragType | null>(null);
	let dropTargetId = $state<string | null>(null);
	let dropTargetSlot = $state<string | null>(null);
	let dropPosition = $state<DragPosition>(null);

	// Track global dragend listener to clean it up if drag ends normally
	let globalDragEndListener: (() => void) | null = null;

	function reset() {
		draggedNodeId = null;
		draggedSlotName = null;
		draggedSlotParentId = null;
		dragType = null;
		dropTargetId = null;
		dropTargetSlot = null;
		dropPosition = null;

		// Clean up global listener if it exists
		if (globalDragEndListener) {
			document.removeEventListener("dragend", globalDragEndListener);
			globalDragEndListener = null;
		}
	}

	function handleDragStart(event: DragEvent, nodeId: string) {
		draggedNodeId = nodeId;
		dragType = "node";
		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = "move";
			event.dataTransfer.setData("text/plain", JSON.stringify({ type: "node", nodeId }));
		}

		// Add global dragend listener as fallback for cancelled drags (ESC, outside window, etc.)
		// This ensures state is always cleaned up even if ondragend on the element doesn't fire
		globalDragEndListener = () => {
			reset();
		};
		document.addEventListener("dragend", globalDragEndListener, { once: true });
	}

	function handleSlotDragStart(event: DragEvent, parentId: string, slotName: string) {
		draggedSlotParentId = parentId;
		draggedSlotName = slotName;
		dragType = "slot";
		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = "move";
			event.dataTransfer.setData(
				"text/plain",
				JSON.stringify({ type: "slot", parentId, slotName }),
			);
		}

		// Add global dragend listener as fallback for cancelled drags (ESC, outside window, etc.)
		// This ensures state is always cleaned up even if ondragend on the element doesn't fire
		globalDragEndListener = () => {
			reset();
		};
		document.addEventListener("dragend", globalDragEndListener, { once: true });
	}

	function handleDragOver(event: DragEvent, targetNodeId: string) {
		// Prevent dropping on itself
		if (dragType === "node" && draggedNodeId === targetNodeId) return;
		if (dragType === "slot" && draggedSlotParentId === targetNodeId) return;

		event.preventDefault();
		event.stopPropagation();

		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = "move";
		}

		// For slot drags on nodes, we only show "into" position
		if (dragType === "slot") {
			dropPosition = "into";
		} else {
			// For node drags, calculate drop position based on mouse Y position
			const target = event.currentTarget as HTMLElement;
			const rect = target.getBoundingClientRect();
			const y = event.clientY - rect.top;
			const height = rect.height;

			// Top 25%: before, Bottom 25%: after, Middle 50%: into
			if (y < height * 0.25) {
				dropPosition = "before";
			} else if (y > height * 0.75) {
				dropPosition = "after";
			} else {
				dropPosition = "into";
			}
		}

		dropTargetId = targetNodeId;
		dropTargetSlot = null;
	}

	function handleDragLeave() {
		dropTargetId = null;
		dropTargetSlot = null;
		dropPosition = null;
	}

	function handleSlotDragOver(event: DragEvent, parentNodeId: string, slotName: string) {
		// Prevent dropping slot on itself
		if (
			dragType === "slot" &&
			draggedSlotParentId === parentNodeId &&
			draggedSlotName === slotName
		) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();

		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = "move";
		}

		dropTargetId = parentNodeId;
		dropTargetSlot = slotName;
		dropPosition = "into";
	}

	/**
	 * Unified drop handler for both nodes and slots
	 * Works for drops on nodes and drops on slots
	 */
	function handleDrop(event: DragEvent, targetNodeId: string, targetSlotName?: string) {
		event.preventDefault();
		event.stopPropagation();

		// Prevent dropping on itself
		if (dragType === "node" && draggedNodeId === targetNodeId && !targetSlotName) {
			reset();
			return;
		}
		if (
			dragType === "slot" &&
			draggedSlotParentId === targetNodeId &&
			draggedSlotName === targetSlotName
		) {
			reset();
			return;
		}

		// Handle node being dragged
		if (dragType === "node" && draggedNodeId && onNodeMove) {
			onNodeMove(draggedNodeId, targetNodeId, targetSlotName, dropPosition || "into");
		}
		// Handle slot being dragged
		else if (dragType === "slot" && draggedSlotParentId && draggedSlotName && onSlotMove) {
			// If targetSlotName is provided, drop into that specific slot
			// Otherwise use the dragged slot's name (matching slot type)
			const finalTargetSlot = targetSlotName || draggedSlotName;
			onSlotMove(draggedSlotParentId, draggedSlotName, targetNodeId, finalTargetSlot);
		}

		reset();
	}

	function handleDragEnd() {
		reset();
	}

	return {
		// State (reactive getters)
		get draggedNodeId() {
			return draggedNodeId;
		},
		get draggedSlotName() {
			return draggedSlotName;
		},
		get draggedSlotParentId() {
			return draggedSlotParentId;
		},
		get dragType() {
			return dragType;
		},
		get dropTargetId() {
			return dropTargetId;
		},
		get dropTargetSlot() {
			return dropTargetSlot;
		},
		get dropPosition() {
			return dropPosition;
		},

		// Handlers
		handleDragStart,
		handleSlotDragStart,
		handleDragOver,
		handleDragLeave,
		handleDrop,
		handleDragEnd,
		handleSlotDragOver,
		reset,
	};
}
