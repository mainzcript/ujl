/**
 * Drag & Drop state management and handlers for nav-tree
 * Uses Svelte 5 runes for reactive state
 */

export type DragPosition = 'before' | 'after' | 'into' | null;

export interface DragState {
	draggedNodeId: string | null;
	dropTargetId: string | null;
	dropTargetSlot: string | null;
	dropPosition: DragPosition;
}

export interface DragHandlers {
	handleDragStart: (event: DragEvent, nodeId: string) => void;
	handleDragOver: (event: DragEvent, targetNodeId: string) => void;
	handleDragLeave: () => void;
	handleDrop: (event: DragEvent, targetNodeId: string, slotName?: string) => void;
	handleDragEnd: () => void;
	handleSlotDragOver: (event: DragEvent, parentNodeId: string, slotName: string) => void;
	handleSlotDrop: (event: DragEvent, parentNodeId: string, slotName: string) => void;
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
		position?: 'before' | 'after' | 'into'
	) => boolean
): DragHandler {
	// Reactive state using Svelte 5 runes
	let draggedNodeId = $state<string | null>(null);
	let dropTargetId = $state<string | null>(null);
	let dropTargetSlot = $state<string | null>(null);
	let dropPosition = $state<DragPosition>(null);

	function reset() {
		draggedNodeId = null;
		dropTargetId = null;
		dropTargetSlot = null;
		dropPosition = null;
	}

	function handleDragStart(event: DragEvent, nodeId: string) {
		draggedNodeId = nodeId;
		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = 'move';
			event.dataTransfer.setData('text/plain', nodeId);
		}
		console.log('Drag started:', nodeId);
	}

	function handleDragOver(event: DragEvent, targetNodeId: string) {
		if (!draggedNodeId || draggedNodeId === targetNodeId) return;

		event.preventDefault();
		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = 'move';
		}

		// Calculate drop position based on mouse Y position
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

		dropTargetId = targetNodeId;
	}

	function handleDragLeave() {
		dropTargetId = null;
		dropTargetSlot = null;
		dropPosition = null;
	}

	function handleDrop(event: DragEvent, targetNodeId: string, slotName?: string) {
		event.preventDefault();

		if (!draggedNodeId || draggedNodeId === targetNodeId) {
			reset();
			return;
		}

		console.log('Drop:', draggedNodeId, dropPosition, targetNodeId, 'slot:', slotName);

		let success = false;

		if (onNodeMove) {
			success = onNodeMove(draggedNodeId, targetNodeId, slotName, dropPosition || 'into');
			if (!success) {
				console.log('Move rejected - node returned to original position');
			}
		}

		reset();
	}

	function handleDragEnd() {
		reset();
	}

	function handleSlotDragOver(event: DragEvent, parentNodeId: string, slotName: string) {
		if (!draggedNodeId) return;

		event.preventDefault();
		event.stopPropagation();

		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = 'move';
		}

		dropTargetId = parentNodeId;
		dropTargetSlot = slotName;
		dropPosition = 'into';
	}

	function handleSlotDrop(event: DragEvent, parentNodeId: string, slotName: string) {
		event.preventDefault();
		event.stopPropagation();

		if (!draggedNodeId || draggedNodeId === parentNodeId) {
			reset();
			return;
		}

		console.log('Drop into slot:', draggedNodeId, 'into', parentNodeId, 'slot:', slotName);

		if (onNodeMove) {
			const success = onNodeMove(draggedNodeId, parentNodeId, slotName, 'into');
			if (!success) {
				console.log('Drop into slot rejected');
			}
		}

		reset();
	}

	return {
		// State (reactive getters)
		get draggedNodeId() {
			return draggedNodeId;
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
		handleDragOver,
		handleDragLeave,
		handleDrop,
		handleDragEnd,
		handleSlotDragOver,
		handleSlotDrop,
		reset
	};
}