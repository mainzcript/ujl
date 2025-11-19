import type { UJLTTokenSet, UJLCSlotObject, UJLCModuleObject } from '@ujl-framework/types';
import { nanoid } from 'nanoid';
import {
	findNodeById,
	findParentOfNode,
	removeNodeFromTree,
	insertNodeIntoSlot,
	insertNodeAtPosition,
	getFirstSlotName,
	hasSlots
} from './sidebar-left/editor/ujlc-tree-utils.js';

/**
 * Editor context API for managing UJL document state.
 * All mutations go through this API to maintain a single source of truth.
 *
 * This context is provided by `app.svelte` and consumed by child components
 * that need to update the document state (e.g., Designer, Editor).
 *
 * Architecture: Unidirectional data flow
 * - Tokens and documents are owned by app.svelte (Single Source of Truth)
 * - Child components receive tokens as read-only props
 * - Changes flow up via callbacks (onChange handlers) to updateTokenSet/updateRootSlot
 * - No local token copies or two-way bindings - data flows down, events flow up
 */
export type CrafterContext = {
	/**
	 * Updates the token set (theme tokens: colors, radius, etc.).
	 * Implementations are expected to return a new token object (immutable update).
	 *
	 * @param fn - Function that receives the current token set and returns a new one.
	 *             Must not mutate the input object; must return a new object instance.
	 *
	 * @example
	 * ```ts
	 * crafter.updateTokenSet((oldTokens) => ({
	 *   ...oldTokens,
	 *   color: { ...oldTokens.color, primary: newColorSet }
	 * }));
	 * ```
	 */
	updateTokenSet: (fn: (tokens: UJLTTokenSet) => UJLTTokenSet) => void;

	/**
	 * Updates the root slot of the UJL content document.
	 * Implementations are expected to return a new slot object (immutable update).
	 *
	 * @param fn - Function that receives the current root slot and returns a new one.
	 *             Must not mutate the input object; must return a new object instance.
	 *
	 * @example
	 * ```ts
	 * crafter.updateRootSlot((oldSlot) => [...oldSlot, newModule]);
	 * ```
	 */
	updateRootSlot: (fn: (slot: UJLCSlotObject) => UJLCSlotObject) => void;

	/**
	 * High-level operations for document manipulation
	 */
	operations: {
		/**
		 * Copies a node (returns it without removing from tree)
		 * @returns the node or null if operation failed
		 */
		copyNode: (nodeId: string) => UJLCModuleObject | null;

		/**
		 * Moves a node to a target parent's slot
		 * @returns true if successful, false if operation was rejected
		 */
		moveNode: (nodeId: string, targetId: string, slotName?: string) => boolean;

		/**
		 * Reorders a node relative to a sibling
		 * @returns true if successful, false if operation was rejected
		 */
		reorderNode: (nodeId: string, targetId: string, position: 'before' | 'after') => boolean;

		/**
		 * Deletes a node from the tree
		 * @returns true if successful, false if operation was rejected
		 */
		deleteNode: (nodeId: string) => boolean;

		/**
		 * Cuts a node (removes and returns it for clipboard)
		 * @returns the cut node or null if operation failed
		 */
		cutNode: (nodeId: string) => UJLCModuleObject | null;

		/**
		 * Pastes a node into a target node's slot
		 * @returns true if successful, false if operation was rejected
		 */
		pasteNode: (node: UJLCModuleObject, targetId: string, slotName?: string) => boolean;
	};

	// Future extensions (planned but not yet implemented):
	// selectModule: (moduleId: string) => void;
	// undo: () => void;
	// redo: () => void;
};

/**
 * Symbol for the Crafter context key
 */
export const CRAFTER_CONTEXT = Symbol('CRAFTER_CONTEXT');

/**
 * Generates a unique random ID for a node
 */
export function generateNodeId(): string {
	return nanoid(10);
}

/**
 * Helper function to check if a node is a descendant of target
 */
function isDescendant(node: UJLCModuleObject, targetId: string): boolean {
	if (node.meta.id === targetId) return true;

	if (!node.slots) return false;

	for (const slotContent of Object.values(node.slots)) {
		for (const child of slotContent) {
			if (isDescendant(child, targetId)) return true;
		}
	}

	return false;
}

/**
 * Creates operation handlers that work with the provided slot and updateRootSlot function
 */
export function createOperations(
	getSlot: () => UJLCSlotObject,
	updateRootSlot: (fn: (slot: UJLCSlotObject) => UJLCSlotObject) => void
): CrafterContext['operations'] {
	return {
		copyNode(nodeId: string): UJLCModuleObject | null {
			const slot = getSlot();
			const node = findNodeById(slot, nodeId);

			if (!node) {
				console.warn('Node not found');
				return null;
			}

			// Check if node is root
			const parentInfo = findParentOfNode(slot, nodeId);
			if (!parentInfo || !parentInfo.parent) {
				console.warn('Cannot copy root node');
				return null;
			}

			// Generate new unique ID for the copy
			let newId = generateNodeId();
			let attempts = 0;
			while (findNodeById(slot, newId) !== null && attempts < 10) {
				newId = generateNodeId();
				attempts++;
			}

			if (attempts >= 10) {
				console.error('Failed to generate unique ID after 10 attempts');
				return null;
			}

			// Create duplicate with new ID
			const duplicatedNode: UJLCModuleObject = {
				...node,
				meta: {
					...node.meta,
					id: newId
				}
			};

			console.log('Copied node:', nodeId, 'as:', newId);
			return duplicatedNode;
		},

		moveNode(nodeId: string, targetId: string, slotName?: string): boolean {
			const slot = getSlot();
			const node = findNodeById(slot, nodeId);
			const targetNode = findNodeById(slot, targetId);

			if (!node || !targetNode) {
				console.warn('Node or target not found');
				return false;
			}

			// Check if node is root
			const parentInfo = findParentOfNode(slot, nodeId);
			if (!parentInfo || !parentInfo.parent) {
				console.warn('Cannot move root node');
				return false;
			}

			// Check if target can accept children
			if (!hasSlots(targetNode)) {
				console.warn('Target node has no slots - cannot accept children');
				return false;
			}

			// Check if trying to move node into itself or its descendants
			if (isDescendant(node, targetId)) {
				console.warn('Cannot move node into itself or its descendants');
				return false;
			}

			// Determine target slot
			const targetSlotName = slotName ?? getFirstSlotName(targetNode);

			if (!targetSlotName) {
				console.warn('Target node has no valid slot');
				return false;
			}

			// Verify slot exists
			if (!targetNode.slots || !targetNode.slots[targetSlotName]) {
				console.warn('Specified slot does not exist on target node:', targetSlotName);
				return false;
			}

			// Perform move
			updateRootSlot((currentSlot) => {
				const removedTree = removeNodeFromTree(currentSlot, nodeId);
				return insertNodeIntoSlot(removedTree, targetId, targetSlotName!, node);
			});

			console.log('Moved node:', nodeId, 'into:', targetId, 'slot:', targetSlotName);
			return true;
		},

		reorderNode(nodeId: string, targetId: string, position: 'before' | 'after'): boolean {
			const slot = getSlot();
			const node = findNodeById(slot, nodeId);
			const targetNode = findNodeById(slot, targetId);

			if (!node || !targetNode) {
				console.warn('Node or target not found');
				return false;
			}

			// Get parent info for both nodes
			const nodeParentInfo = findParentOfNode(slot, nodeId);
			const targetParentInfo = findParentOfNode(slot, targetId);

			if (!nodeParentInfo || !nodeParentInfo.parent) {
				console.warn('Cannot reorder root node');
				return false;
			}

			if (!targetParentInfo || !targetParentInfo.parent) {
				console.warn('Cannot reorder relative to root node');
				return false;
			}

			// Check if nodes are siblings
			if (
				nodeParentInfo.parent.meta.id !== targetParentInfo.parent.meta.id ||
				nodeParentInfo.slotName !== targetParentInfo.slotName
			) {
				console.warn('Nodes must be siblings to reorder');
				return false;
			}

			// Calculate new position
			let newPosition = targetParentInfo.index;
			if (position === 'after') {
				newPosition += 1;
			}

			// Adjust if moving down
			if (nodeParentInfo.index < newPosition) {
				newPosition -= 1;
			}

			// Perform reorder
			updateRootSlot((currentSlot) => {
				const removedTree = removeNodeFromTree(currentSlot, nodeId);
				return insertNodeAtPosition(
					removedTree,
					nodeParentInfo.parent!.meta.id,
					nodeParentInfo.slotName,
					node,
					newPosition
				);
			});

			console.log('Reordered node:', nodeId, position, targetId, 'at position:', newPosition);
			return true;
		},

		deleteNode(nodeId: string): boolean {
			const slot = getSlot();
			const node = findNodeById(slot, nodeId);

			if (!node) {
				console.warn('Node not found');
				return false;
			}

			// Check if node is root
			const parentInfo = findParentOfNode(slot, nodeId);
			if (!parentInfo || !parentInfo.parent) {
				console.warn('Cannot delete root node');
				return false;
			}

			// Remove node
			updateRootSlot((currentSlot) => {
				return removeNodeFromTree(currentSlot, nodeId);
			});

			console.log('Deleted node:', nodeId);
			return true;
		},

		cutNode(nodeId: string): UJLCModuleObject | null {
			const slot = getSlot();
			const node = findNodeById(slot, nodeId);

			if (!node) {
				console.warn('Node not found');
				return null;
			}

			// Check if node is root
			const parentInfo = findParentOfNode(slot, nodeId);
			if (!parentInfo || !parentInfo.parent) {
				console.warn('Cannot cut root node');
				return null;
			}

			// Remove node from tree
			updateRootSlot((currentSlot) => {
				return removeNodeFromTree(currentSlot, nodeId);
			});

			console.log('Cut node:', nodeId);
			return node;
		},

		pasteNode(node: UJLCModuleObject, targetId: string, slotName?: string): boolean {
			const slot = getSlot();
			const targetNode = findNodeById(slot, targetId);

			if (!targetNode) {
				console.warn('Target node not found');
				return false;
			}

			// Check if node already exists (prevents duplicates)
			const existingNode = findNodeById(slot, node.meta.id);
			if (existingNode) {
				console.warn('Cannot paste: Node already exists in tree');
				return false;
			}

			// Check if target has slots
			if (!hasSlots(targetNode)) {
				console.warn('Target node has no slots');
				return false;
			}

			// Determine target slot
			const targetSlotName = slotName ?? getFirstSlotName(targetNode);

			if (!targetSlotName) {
				console.warn('Target node has no valid slot');
				return false;
			}

			// Insert node
			updateRootSlot((currentSlot) => {
				return insertNodeIntoSlot(currentSlot, targetId, targetSlotName!, node);
			});

			console.log('Pasted node into:', targetId, 'slot:', targetSlotName);
			return true;
		}
	};
}
