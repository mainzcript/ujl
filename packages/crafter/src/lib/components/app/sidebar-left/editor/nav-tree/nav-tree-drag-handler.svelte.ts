/**
 * Enhanced Drag & Drop state management with slot dragging support
 * Uses Svelte 5 runes for reactive state
 */

export type DragPosition = 'before' | 'after' | 'into' | null;
export type DragType = 'node' | 'slot';

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
	handleSlotDrop: (event: DragEvent, parentNodeId: string, slotName: string) => void;
	reset: () => void;
}

export type DragHandler = DragState & DragHandlers;

// Updated nav-tree-slot-group.svelte component below
// Make the slot header draggable by adding these attributes to the main div:

/**
 * Creates a drag & drop handler with reactive state and event handlers
 */
export function createDragHandler(
	onNodeMove?: (
		nodeId: string,
		targetId: string,
		slotName?: string,
		position?: 'before' | 'after' | 'into'
	) => boolean,
	onSlotMove?: (
		sourceParentId: string,
		sourceSlotName: string,
		targetParentId: string,
		targetSlotName: string
	) => boolean
): DragHandler {
	// Reactive state using Svelte 5 runes
	let draggedNodeId = $state<string | null>(null);
	let draggedSlotName = $state<string | null>(null);
	let draggedSlotParentId = $state<string | null>(null);
	let dragType = $state<DragType | null>(null);
	let dropTargetId = $state<string | null>(null);
	let dropTargetSlot = $state<string | null>(null);
	let dropPosition = $state<DragPosition>(null);

	function reset() {
		draggedNodeId = null;
		draggedSlotName = null;
		draggedSlotParentId = null;
		dragType = null;
		dropTargetId = null;
		dropTargetSlot = null;
		dropPosition = null;
	}

	function handleDragStart(event: DragEvent, nodeId: string) {
		draggedNodeId = nodeId;
		dragType = 'node';
		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = 'move';
			event.dataTransfer.setData('text/plain', JSON.stringify({ type: 'node', nodeId }));
		}
		console.log('Node drag started:', nodeId);
	}

	function handleSlotDragStart(event: DragEvent, parentId: string, slotName: string) {
		draggedSlotParentId = parentId;
		draggedSlotName = slotName;
		dragType = 'slot';
		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = 'move';
			event.dataTransfer.setData(
				'text/plain',
				JSON.stringify({ type: 'slot', parentId, slotName })
			);
		}
		console.log('Slot drag started:', parentId, slotName);
	}

	function handleDragOver(event: DragEvent, targetNodeId: string) {
		// Prevent dropping on itself
		if (dragType === 'node' && draggedNodeId === targetNodeId) return;
		if (dragType === 'slot' && draggedSlotParentId === targetNodeId) return;

		event.preventDefault();
		event.stopPropagation();

		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = 'move';
		}

		// For slot drags on nodes, we only show "into" position
		// (we'll move the slot content into the matching slot type)
		if (dragType === 'slot') {
			dropPosition = 'into';
		} else {
			// For node drags, calculate drop position based on mouse Y position
			const target = event.currentTarget as HTMLElement;
			const rect = target.getBoundingClientRect();
			const y = event.clientY - rect.top;
			const height = rect.height;

			// Top 25%: before, Bottom 25%: after, Middle 50%: into
			if (y < height * 0.25) {
				dropPosition = 'before';
			} else if (y > height * 0.75) {
				dropPosition = 'after';
			} else {
				dropPosition = 'into';
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

	function handleDrop(event: DragEvent, targetNodeId: string, slotName?: string) {
		event.preventDefault();
		event.stopPropagation();

		// Prevent dropping on itself
		if (dragType === 'node' && draggedNodeId === targetNodeId) {
			reset();
			return;
		}
		if (dragType === 'slot' && draggedSlotParentId === targetNodeId) {
			reset();
			return;
		}

		console.log('Drop:', dragType, dropPosition, 'target:', targetNodeId, 'slot:', slotName);

		let success = false;

		if (dragType === 'node' && draggedNodeId && onNodeMove) {
			success = onNodeMove(draggedNodeId, targetNodeId, slotName, dropPosition || 'into');
			if (!success) {
				console.log('Node move rejected');
			}
		} else if (dragType === 'slot' && draggedSlotParentId && draggedSlotName && onSlotMove) {
			// Slot dropped on a node - try to move slot to matching slot type on target node
			console.log('Slot dropped on node - looking for matching slot type:', draggedSlotName);

			// Use the dragged slot name as the target slot name
			// This means: move header slot to header slot, body to body, etc.
			success = onSlotMove(draggedSlotParentId, draggedSlotName, targetNodeId, draggedSlotName);

			if (!success) {
				console.log('Slot move to node rejected - target might not have matching slot type');
			}
		}

		reset();
	}

	function handleDragEnd() {
		reset();
	}

	function handleSlotDragOver(event: DragEvent, parentNodeId: string, slotName: string) {
		// Prevent dropping slot on itself
		if (
			dragType === 'slot' &&
			draggedSlotParentId === parentNodeId &&
			draggedSlotName === slotName
		) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();

		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = 'move';
		}

		dropTargetId = parentNodeId;
		dropTargetSlot = slotName;
		dropPosition = 'into';
	}

	function handleSlotDrop(event: DragEvent, parentNodeId: string, targetSlotName: string) {
		event.preventDefault();
		event.stopPropagation();

		console.log('Slot drop:', dragType, 'target:', parentNodeId, targetSlotName);

		let success = false;

		if (dragType === 'slot' && draggedSlotParentId && draggedSlotName && onSlotMove) {
			// Prevent dropping slot on itself
			if (draggedSlotParentId === parentNodeId && draggedSlotName === targetSlotName) {
				reset();
				return;
			}

			success = onSlotMove(draggedSlotParentId, draggedSlotName, parentNodeId, targetSlotName);
			if (!success) {
				console.log('Slot move rejected');
			}
		} else if (dragType === 'node' && draggedNodeId && onNodeMove) {
			success = onNodeMove(draggedNodeId, parentNodeId, targetSlotName, 'into');
			if (!success) {
				console.log('Node move into slot rejected');
			}
		}

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
		handleSlotDrop,
		reset
	};
}
