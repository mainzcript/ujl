/**
 * UJLC tree manipulation utilities.
 *
 * These helpers are intentionally UI-agnostic and can be reused from
 * different components. They do not depend on Svelte APIs.
 *
 * Provides functions for:
 * - Finding and traversing nodes in UJLC document trees
 * - Immutable tree mutations (insert, remove, update)
 * - Virtual root node handling
 * - Clipboard/paste validation
 * - Node display formatting
 */

import type { UJLCModuleObject } from '@ujl-framework/types';
import { generateUid } from '@ujl-framework/core';

// ============================================
// Constants
// ============================================

/**
 * Constant ID for the virtual root node
 */
export const ROOT_NODE_ID = '__root__';

/**
 * Constant name for the root slot
 */
export const ROOT_SLOT_NAME = 'root';

/**
 * Default length for generated node IDs.
 * Used for generating unique IDs for nodes in copy/paste operations.
 */
export const DEFAULT_NODE_ID_LENGTH = 10;

// ============================================
// Internal Helper Functions
// ============================================

/**
 * Helper to check if a node has non-empty slots.
 * According to the UJLC schema, `slots` is always present (required field),
 * but this function defensively checks for robustness.
 *
 * @internal
 * @param node - The node to check
 * @returns true if the node has slots with at least one entry
 */
function hasNonEmptySlots(node: UJLCModuleObject): boolean {
	return node.slots && Object.keys(node.slots).length > 0;
}

// ============================================
// Tree Traversal
// ============================================

/**
 * Finds a node by its ID in a tree of nodes.
 * Searches recursively through all slots and their children.
 *
 * @param nodes - Array of root nodes to search
 * @param targetId - The ID of the node to find
 * @returns The found node, or null if not found
 */
export function findNodeById(nodes: UJLCModuleObject[], targetId: string): UJLCModuleObject | null {
	for (const node of nodes) {
		if (node.meta.id === targetId) {
			return node;
		}

		if (node.slots) {
			for (const slotContent of Object.values(node.slots)) {
				const found = findNodeById(slotContent, targetId);
				if (found) return found;
			}
		}
	}

	return null;
}

/**
 * Finds the parent of a node by its ID.
 * Returns virtual root node (__root__) as parent for root-level nodes.
 *
 * @param nodes - Array of root nodes to search
 * @param targetId - The ID of the node to find the parent for
 * @param parent - Current parent node (used for recursion, defaults to null)
 * @param slotName - Current slot name (used for recursion, defaults to ROOT_SLOT_NAME)
 * @returns Object with parent node, slot name, and index, or null if not found
 */
export function findParentOfNode(
	nodes: UJLCModuleObject[],
	targetId: string,
	parent: UJLCModuleObject | null = null,
	slotName: string = ROOT_SLOT_NAME
): { parent: UJLCModuleObject | null; slotName: string; index: number } | null {
	for (let i = 0; i < nodes.length; i++) {
		const node = nodes[i];

		if (node.meta.id === targetId) {
			if (parent === null) {
				return {
					parent: createVirtualRootNode(nodes),
					slotName: ROOT_SLOT_NAME,
					index: i
				};
			}
			return {
				parent,
				slotName,
				index: i
			};
		}

		if (node.slots) {
			for (const [currentSlotName, slotContent] of Object.entries(node.slots)) {
				const found = findParentOfNode(slotContent, targetId, node, currentSlotName);
				if (found) return found;
			}
		}
	}

	return null;
}

/**
 * Checks if a node is a descendant of a target node.
 * Recursively checks all slots and their children.
 *
 * @param node - The node to check
 * @param targetId - The target node ID to find
 * @returns true if the target node is found in the subtree, false otherwise
 */
export function isDescendant(node: UJLCModuleObject, targetId: string): boolean {
	if (node.meta.id === targetId) return true;

	if (!node.slots) return false;

	for (const slotContent of Object.values(node.slots)) {
		for (const child of slotContent) {
			if (isDescendant(child, targetId)) return true;
		}
	}

	return false;
}

// ============================================
// Virtual Root Node
// ============================================

/**
 * Checks if a node ID is the root node.
 *
 * @param nodeId - The node ID to check
 * @returns true if the node ID is the root node ID
 */
export function isRootNode(nodeId: string): boolean {
	return nodeId === ROOT_NODE_ID;
}

/**
 * Creates a virtual root node representation.
 * This wraps the root-level nodes in a virtual document node to enable
 * operations on root-level nodes (which now have a parent: __root__).
 *
 * @param nodes - Array of root-level nodes to wrap
 * @returns A virtual root node with the nodes in its root slot
 */
export function createVirtualRootNode(nodes: UJLCModuleObject[]): UJLCModuleObject {
	return {
		type: 'document',
		meta: {
			id: ROOT_NODE_ID,
			updated_at: new Date().toISOString(),
			_embedding: []
		},
		fields: {},
		slots: {
			[ROOT_SLOT_NAME]: nodes
		}
	};
}

// ============================================
// Tree Mutations (Immutable)
// ============================================

/**
 * Removes a node from the tree by its ID (immutable operation).
 * Recursively searches through all slots and removes the node if found.
 *
 * @param nodes - The tree of nodes to search
 * @param targetId - The ID of the node to remove
 * @returns A new tree with the target node removed
 */
export function removeNodeFromTree(
	nodes: UJLCModuleObject[],
	targetId: string
): UJLCModuleObject[] {
	return nodes
		.filter((node) => node.meta.id !== targetId)
		.map((node) => {
			if (hasNonEmptySlots(node)) {
				const newSlots: Record<string, UJLCModuleObject[]> = {};

				for (const [slotName, slotContent] of Object.entries(node.slots)) {
					newSlots[slotName] = removeNodeFromTree(slotContent, targetId);
				}

				return {
					...node,
					slots: newSlots
				};
			}

			return node;
		});
}

/**
 * Adds a node into a specified slot of a parent node (immutable operation).
 * If the slot does not exist, it will be created.
 *
 * @param nodes - The tree of nodes to search
 * @param parentId - The ID of the parent node
 * @param slotName - The name of the slot to insert into
 * @param nodeToInsert - The node to insert
 * @returns A new tree with the node inserted
 */
export function insertNodeIntoSlot(
	nodes: UJLCModuleObject[],
	parentId: string,
	slotName: string,
	nodeToInsert: UJLCModuleObject
): UJLCModuleObject[] {
	return nodes.map((node) => {
		if (node.meta.id === parentId) {
			const newSlots = { ...node.slots };

			if (newSlots[slotName]) {
				newSlots[slotName] = [...newSlots[slotName], nodeToInsert];
			} else {
				newSlots[slotName] = [nodeToInsert];
			}

			return {
				...node,
				slots: newSlots
			};
		}

		if (hasNonEmptySlots(node)) {
			const newSlots: Record<string, UJLCModuleObject[]> = {};

			for (const [currentSlotName, slotContent] of Object.entries(node.slots)) {
				newSlots[currentSlotName] = insertNodeIntoSlot(
					slotContent,
					parentId,
					slotName,
					nodeToInsert
				);
			}

			return {
				...node,
				slots: newSlots
			};
		}

		return node;
	});
}

/**
 * Inserts a node at a specific position in a parent's slot (immutable operation).
 * If the slot does not exist, it will be created.
 *
 * @param nodes - The tree of nodes to search
 * @param parentId - The ID of the parent node
 * @param slotName - The name of the slot to insert into
 * @param nodeToInsert - The node to insert
 * @param position - The index position to insert at
 * @returns A new tree with the node inserted at the specified position
 */
export function insertNodeAtPosition(
	nodes: UJLCModuleObject[],
	parentId: string,
	slotName: string,
	nodeToInsert: UJLCModuleObject,
	position: number
): UJLCModuleObject[] {
	return nodes.map((node) => {
		if (node.meta.id === parentId) {
			const newSlots = { ...node.slots };

			if (newSlots[slotName]) {
				const slotArray = [...newSlots[slotName]];
				slotArray.splice(position, 0, nodeToInsert);
				newSlots[slotName] = slotArray;
			} else {
				newSlots[slotName] = [nodeToInsert];
			}

			return {
				...node,
				slots: newSlots
			};
		}

		if (hasNonEmptySlots(node)) {
			const newSlots: Record<string, UJLCModuleObject[]> = {};

			for (const [currentSlotName, slotContent] of Object.entries(node.slots)) {
				newSlots[currentSlotName] = insertNodeAtPosition(
					slotContent,
					parentId,
					slotName,
					nodeToInsert,
					position
				);
			}

			return {
				...node,
				slots: newSlots
			};
		}

		return node;
	});
}

/**
 * Updates a node in the tree by applying a function to it (immutable operation).
 *
 * @param nodes - The tree of nodes to search
 * @param targetId - The ID of the node to update
 * @param updateFn - Function that receives the node and returns updated node
 * @returns A new tree with the modified node
 */
export function updateNodeInTree(
	nodes: UJLCModuleObject[],
	targetId: string,
	updateFn: (node: UJLCModuleObject) => UJLCModuleObject
): UJLCModuleObject[] {
	return nodes.map((node) => {
		if (node.meta.id === targetId) {
			return updateFn(node);
		}

		if (node.slots) {
			const updatedSlots: Record<string, UJLCModuleObject[]> = {};
			for (const [slotName, children] of Object.entries(node.slots)) {
				updatedSlots[slotName] = updateNodeInTree(children, targetId, updateFn);
			}
			return { ...node, slots: updatedSlots };
		}

		return node;
	});
}

/**
 * Deep clones a module and all its nested children, preserving all IDs.
 * Used for copy/cut operations. New IDs are assigned at paste time.
 *
 * @param node - The module to clone
 * @returns A deep clone of the module with all IDs preserved
 *
 * @example
 * ```ts
 * const original = { type: 'container', meta: { id: 'old-id', ... }, slots: { body: [...] } };
 * const cloned = deepCloneModule(original);
 * // cloned.meta.id === original.meta.id
 * // All children in cloned.slots.body also have same IDs
 * ```
 */
export function deepCloneModule(node: UJLCModuleObject): UJLCModuleObject {
	const clonedNode: UJLCModuleObject = {
		...node,
		meta: {
			...node.meta
		},
		fields: { ...node.fields },
		slots: {}
	};

	if (node.slots) {
		for (const [slotName, slotContent] of Object.entries(node.slots)) {
			clonedNode.slots[slotName] = slotContent.map((child) => deepCloneModule(child));
		}
	}

	return clonedNode;
}

/**
 * Deep clones a module and all its nested children, assigning new IDs to every node.
 * Used at paste time to ensure ID uniqueness and enable multiple pastes.
 *
 * @param node - The module to clone
 * @returns A deep clone of the module with all IDs regenerated
 *
 * @example
 * ```ts
 * const original = { type: 'container', meta: { id: 'old-id', ... }, slots: { body: [...] } };
 * const cloned = deepCloneModuleWithNewIds(original);
 * // cloned.meta.id !== original.meta.id
 * // All children in cloned.slots.body also have new IDs
 * ```
 */
export function deepCloneModuleWithNewIds(node: UJLCModuleObject): UJLCModuleObject {
	const clonedNode: UJLCModuleObject = {
		...node,
		meta: {
			...node.meta,
			id: generateUid(DEFAULT_NODE_ID_LENGTH)
		},
		fields: { ...node.fields },
		slots: {}
	};

	if (node.slots) {
		for (const [slotName, slotContent] of Object.entries(node.slots)) {
			clonedNode.slots[slotName] = slotContent.map((child) => deepCloneModuleWithNewIds(child));
		}
	}

	return clonedNode;
}

// ============================================
// Node Queries
// ============================================

/**
 * Returns the name of the first slot of a node, or null if there are no slots.
 * Note: According to the UJLC schema, `slots` is always present (required field),
 * but this function defensively checks for empty slots.
 *
 * @param node - The node to check
 * @returns The first slot name, or null if no slots exist
 */
export function getFirstSlotName(node: UJLCModuleObject): string | null {
	if (!node.slots || Object.keys(node.slots).length === 0) {
		return null;
	}

	return Object.keys(node.slots)[0];
}

/**
 * Checks if a node has slots (non-empty slots object).
 * Note: According to the UJLC schema, `slots` is always present (required field),
 * but this function checks if it has any entries. The defensive check for `node.slots`
 * is included for robustness, though it should never be undefined in valid UJLC documents.
 *
 * @param node - The node to check
 * @returns true if the node has at least one slot with entries
 */
export function hasSlots(node: UJLCModuleObject): boolean {
	return node.slots && Object.keys(node.slots).length > 0;
}

/**
 * Returns the children of a node (all modules from all slots).
 * Note: According to the UJLC schema, `slots` is always present (required field),
 * but this function defensively handles the case where it might be missing.
 *
 * @param node - The node to get children from
 * @returns Array of all child modules from all slots
 */
export function getChildren(node: UJLCModuleObject): UJLCModuleObject[] {
	if (!node.slots) return [];

	return Object.values(node.slots).flat();
}

/**
 * Checks if a node has children (any non-empty slot).
 * Note: According to the UJLC schema, `slots` is always present (required field),
 * but this function defensively handles the case where it might be missing.
 *
 * @param node - The node to check
 * @returns true if the node has at least one child in any slot
 */
export function hasChildren(node: UJLCModuleObject): boolean {
	if (!node.slots) return false;
	return Object.values(node.slots).some((slot) => slot.length > 0);
}

/**
 * Checks if a node has multiple slots (regardless of content).
 * Note: According to the UJLC schema, `slots` is always present (required field),
 * but this function defensively handles the case where it might be missing.
 *
 * @param node - The node to check
 * @returns true if the node has more than one slot
 */
export function hasMultipleSlots(node: UJLCModuleObject): boolean {
	if (!node.slots) return false;
	return Object.keys(node.slots).length > 1;
}

/**
 * Returns ALL slot entries [slotName, children[]] (including empty slots).
 * Note: According to the UJLC schema, `slots` is always present (required field),
 * but this function defensively handles the case where it might be missing.
 *
 * @param node - The node to get slot entries from
 * @returns Array of [slotName, children[]] tuples for all slots
 */
export function getAllSlotEntries(node: UJLCModuleObject): [string, UJLCModuleObject[]][] {
	if (!node.slots) return [];
	return Object.entries(node.slots);
}

/**
 * Checks if target has slots (can accept children).
 * Note: According to the UJLC schema, `slots` is always present (required field),
 * but this function checks if it has any entries. The defensive check for `targetNode.slots`
 * is included for robustness, though it should never be undefined in valid UJLC documents.
 *
 * @param targetNode - The target node to check
 * @returns true if the target node can accept children (has non-empty slots)
 */
export function canAcceptDrop(targetNode: UJLCModuleObject): boolean {
	return targetNode.slots && Object.keys(targetNode.slots).length > 0;
}

// ============================================
// Display & Formatting
// ============================================

/**
 * Returns a display name for a node.
 * Tries to use title, label, or headline fields first, then falls back to content
 * (shortened if too long), and finally just the formatted type name.
 *
 * @param node - The node to get a display name for
 * @returns A human-readable display name for the node
 */
export function getDisplayName(node: UJLCModuleObject): string {
	const typeName = formatTypeName(node.type);

	if (node.fields.title) return `${typeName}: ${node.fields.title}`;
	if (node.fields.label) return `${typeName}: ${node.fields.label}`;
	if (node.fields.headline) return `${typeName}: ${node.fields.headline}`;

	if (node.fields.content && typeof node.fields.content === 'string') {
		const content = node.fields.content.trim();
		const shortContent = content.length > 40 ? content.substring(0, 40) + '...' : content;
		return `${typeName}: ${shortContent}`;
	}

	return typeName;
}

/**
 * Formats a type string into a more readable format.
 * Converts kebab-case or snake_case to Title Case.
 *
 * @param type - The type string to format (e.g., "call-to-action" or "call_to_action")
 * @returns Formatted type string (e.g., "Call To Action")
 */
export function formatTypeName(type: string): string {
	return type
		.split(/[-_]/)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

/**
 * Formats a slot name for display.
 * Converts kebab-case or snake_case to Title Case.
 *
 * @param slotName - The slot name to format (e.g., "body-content" or "body_content")
 * @returns Formatted slot name (e.g., "Body Content")
 */
export function formatSlotName(slotName: string): string {
	return slotName
		.split(/[-_]/)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

// ============================================
// Clipboard & Paste Validation
// ============================================

/**
 * Parses a slot selection string (format: "parentId:slotName").
 * Returns null if the string is not a valid slot selection.
 *
 * @param selectedId - The selected ID string (may be a node ID or slot selection)
 * @returns Object with parentId and slotName, or null if not a slot selection
 *
 * @example
 * ```ts
 * const info = parseSlotSelection('parent-id:slot-name');
 * // Returns: { parentId: 'parent-id', slotName: 'slot-name' }
 *
 * const info = parseSlotSelection('node-id');
 * // Returns: null
 * ```
 */
export function parseSlotSelection(
	selectedId: string | null
): { parentId: string; slotName: string } | null {
	if (!selectedId) return null;

	const parts = selectedId.split(':');
	if (parts.length === 2) {
		return {
			parentId: parts[0],
			slotName: parts[1]
		};
	}

	return null;
}

/**
 * Checks if a node can accept paste operations.
 * Validates that the clipboard item can be pasted into the target node.
 *
 * @param node - The target node to check
 * @param clipboard - The clipboard item (node or slot) to paste
 * @returns true if the clipboard can be pasted into the node
 */
export function canNodeAcceptPaste(
	node: UJLCModuleObject,
	clipboard:
		| UJLCModuleObject
		| { type: 'slot'; slotName: string; content: UJLCModuleObject[] }
		| null
): boolean {
	if (clipboard === null || !hasSlots(node)) return false;

	if (isModuleObject(clipboard)) {
		return true;
	}

	if (clipboard.type === 'slot' && node.slots) {
		return Object.keys(node.slots).includes(clipboard.slotName);
	}

	return false;
}

/**
 * Checks if a slot can accept paste operations.
 * Note: Regular nodes CAN be pasted into slots (they are inserted into the slot).
 * This is consistent with the implementation in editor.svelte.
 *
 * @param clipboard - The clipboard item (node or slot) to paste
 * @param slotName - The target slot name
 * @returns true if the clipboard can be pasted into the slot
 */
export function canSlotAcceptPaste(
	clipboard:
		| UJLCModuleObject
		| { type: 'slot'; slotName: string; content: UJLCModuleObject[] }
		| null,
	slotName: string
): boolean {
	if (!clipboard) return false;

	if (isModuleObject(clipboard)) {
		return true;
	}

	if (clipboard.type === 'slot') {
		return clipboard.slotName === slotName;
	}

	return false;
}

// ============================================
// Type Guards
// ============================================

/**
 * Type guard to check if a clipboard item is a module object.
 *
 * @param item - The clipboard item to check
 * @returns true if the item is a UJLCModuleObject, false otherwise
 */
export function isModuleObject(
	item: UJLCModuleObject | { type: 'slot'; slotName: string; content: UJLCModuleObject[] } | null
): item is UJLCModuleObject {
	return item !== null && 'meta' in item;
}
