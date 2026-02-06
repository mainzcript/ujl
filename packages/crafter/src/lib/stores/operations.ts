/**
 * Crafter Operations - High-Level Document Manipulation
 *
 * This module provides high-level operations for manipulating UJLC documents.
 * All operations are immutable and work with functional updates.
 *
 * @module operations
 */

import type { Composer } from "@ujl-framework/core";
import { generateUid } from "@ujl-framework/core";
import type { UJLCModuleObject, UJLCSlotObject } from "@ujl-framework/types";
import { logger } from "../utils/logger.js";
import {
	deepCloneModule,
	deepCloneModuleWithNewIds,
	DEFAULT_NODE_ID_LENGTH,
	findNodeById,
	findParentOfNode,
	getFirstSlotName,
	hasSlots,
	insertNodeAtPosition,
	insertNodeIntoSlot,
	isDescendant,
	isRootNode,
	removeNodeFromTree,
	updateNodeInTree,
} from "../utils/ujlc-tree.js";

// ============================================
// TYPES
// ============================================

/**
 * High-level operations interface for document manipulation.
 * All operations are designed to be atomic and return success status.
 */
export interface CrafterOperations {
	/**
	 * Copies a node (returns it without removing from tree)
	 * @returns the node or null if operation failed
	 */
	copyNode: (nodeId: string) => UJLCModuleObject | null;

	/**
	 * Moves a node to a target parent's slot or position
	 * @param position - 'before' | 'after' inserts relative to target, 'into' inserts into target's slot
	 * @returns true if successful, false if operation was rejected
	 */
	moveNode: (
		nodeId: string,
		targetId: string,
		slotName?: string,
		position?: "before" | "after" | "into",
	) => boolean;

	/**
	 * Reorders a node relative to a sibling
	 * @returns true if successful, false if operation was rejected
	 */
	reorderNode: (nodeId: string, targetId: string, position: "before" | "after") => boolean;

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
	 * @param position - 'before' | 'after' inserts relative to target, 'into' inserts into target's slot. Default is 'after'.
	 * @returns ID of the pasted node if successful, null if operation was rejected
	 */
	pasteNode: (
		node: UJLCModuleObject,
		targetId: string,
		slotName?: string,
		position?: "before" | "after" | "into",
	) => string | null;

	/**
	 * Inserts a new node from Module Registry
	 * @param componentType - The component type from the registry
	 * @param targetId - The target node ID
	 * @param slotName - Optional slot name (uses first slot if not specified)
	 * @param position - 'before' | 'after' inserts relative to target, 'into' inserts into target's slot
	 * @returns ID of the inserted node if successful, null if operation was rejected
	 */
	insertNode: (
		componentType: string,
		targetId: string,
		slotName?: string,
		position?: "before" | "after" | "into",
	) => string | null;

	/**
	 * Copies a complete slot with all its content
	 * @param parentId - The parent node ID
	 * @param slotName - The slot name to copy
	 * @returns Object with slot name and content, or null if operation failed
	 */
	copySlot: (
		parentId: string,
		slotName: string,
	) => { type: "slot"; slotName: string; content: UJLCModuleObject[] } | null;

	/**
	 * Cuts a complete slot (empties it and returns content)
	 * @param parentId - The parent node ID
	 * @param slotName - The slot name to cut
	 * @returns Object with slot name and content, or null if operation failed
	 */
	cutSlot: (
		parentId: string,
		slotName: string,
	) => { type: "slot"; slotName: string; content: UJLCModuleObject[] } | null;

	/**
	 * Pastes slot content into a target node's matching slot
	 * @param slotData - The slot data from clipboard
	 * @param targetParentId - The target parent node ID
	 * @returns true if successful, false if operation was rejected
	 */
	pasteSlot: (
		slotData: { type: "slot"; slotName: string; content: UJLCModuleObject[] },
		targetParentId: string,
	) => boolean;

	/**
	 * Moves an entire slot (with all its content) from one parent to another
	 * @param sourceParentId - Source parent node ID
	 * @param sourceSlotName - Source slot name
	 * @param targetParentId - Target parent node ID
	 * @param targetSlotName - Target slot name
	 * @returns true if successful, false if operation was rejected
	 */
	moveSlot: (
		sourceParentId: string,
		sourceSlotName: string,
		targetParentId: string,
		targetSlotName: string,
	) => boolean;

	/**
	 * Updates a single field of a node (for property panel).
	 * Performs immutable update and updates the updated_at timestamp.
	 *
	 * @param nodeId - The node ID to update
	 * @param fieldName - The field name to update
	 * @param value - The new value for the field
	 * @returns true if successful, false if node not found
	 */
	updateNodeField: (nodeId: string, fieldName: string, value: unknown) => boolean;

	/**
	 * Updates multiple fields of a node at once (bulk update).
	 * More efficient than multiple updateNodeField calls.
	 *
	 * @param nodeId - The node ID to update
	 * @param updates - Record of field names to new values
	 * @returns true if successful, false if node not found
	 */
	updateNodeFields: (nodeId: string, updates: Record<string, unknown>) => boolean;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generates a unique random ID for a node.
 * Uses the framework's centralized ID generator from @ujl-framework/core.
 * Uses a shorter ID length (10 characters) for better UX in URLs and UI.
 *
 * @returns A unique random ID string
 */
function generateNodeId(): string {
	return generateUid(DEFAULT_NODE_ID_LENGTH);
}

// ============================================
// OPERATIONS FACTORY
// ============================================

/**
 * Creates operation handlers that work with the provided slot and updateRootSlot function.
 *
 * This factory function creates all high-level document operations.
 * Operations are designed to:
 * - Be atomic (all or nothing)
 * - Return success/failure status
 * - Validate inputs before making changes
 * - Use immutable updates
 *
 * @param getSlot - Function to get current root slot
 * @param updateRootSlot - Function to update root slot immutably
 * @param composer - Composer instance for creating new modules
 * @returns Object with all operations
 */
export function createOperations(
	getSlot: () => UJLCSlotObject,
	updateRootSlot: (fn: (slot: UJLCSlotObject) => UJLCSlotObject) => void,
	composer: Composer,
): CrafterOperations {
	return {
		copyNode(nodeId: string): UJLCModuleObject | null {
			const slot = getSlot();
			const node = findNodeById(slot, nodeId);

			if (!node) {
				logger.warn("Node not found");
				return null;
			}

			if (isRootNode(nodeId)) {
				logger.warn("Cannot copy root node");
				return null;
			}

			return deepCloneModule(node);
		},

		moveNode(
			nodeId: string,
			targetId: string,
			slotName?: string,
			position?: "before" | "after" | "into",
		): boolean {
			const slot = getSlot();
			const node = findNodeById(slot, nodeId);
			const targetNode = findNodeById(slot, targetId);

			if (!node || !targetNode) {
				logger.warn("Node or target not found");
				return false;
			}

			if (isRootNode(nodeId)) {
				logger.warn("Cannot move root node");
				return false;
			}

			const parentInfo = findParentOfNode(slot, nodeId);
			if (!parentInfo) {
				logger.warn("Cannot find parent of node");
				return false;
			}

			if (position === "before" || position === "after") {
				const targetParentInfo = findParentOfNode(slot, targetId);

				if (!targetParentInfo) {
					logger.warn("Cannot find parent of target node");
					return false;
				}

				if (isRootNode(targetId)) {
					logger.warn("Cannot move relative to root node");
					return false;
				}

				if (isDescendant(node, targetId)) {
					logger.warn("Cannot move node into itself or its descendants");
					return false;
				}

				let newPosition = targetParentInfo.index;
				if (position === "after") {
					newPosition += 1;
				}
				if (
					parentInfo.parent &&
					targetParentInfo.parent &&
					parentInfo.parent.meta.id === targetParentInfo.parent.meta.id &&
					parentInfo.slotName === targetParentInfo.slotName &&
					parentInfo.index < newPosition
				) {
					newPosition -= 1;
				}

				if (targetParentInfo.parent && isRootNode(targetParentInfo.parent.meta.id)) {
					updateRootSlot((currentSlot) => {
						const removedTree = removeNodeFromTree(currentSlot, nodeId);
						const newArray = [...removedTree];
						newArray.splice(newPosition, 0, node);
						return newArray;
					});
				} else {
					if (!targetParentInfo.parent) {
						logger.warn("Cannot find parent of target node");
						return false;
					}
					const targetParentId = targetParentInfo.parent.meta.id;
					updateRootSlot((currentSlot) => {
						const removedTree = removeNodeFromTree(currentSlot, nodeId);
						return insertNodeAtPosition(
							removedTree,
							targetParentId,
							targetParentInfo.slotName,
							node,
							newPosition,
						);
					});
				}
				return true;
			}

			if (isRootNode(targetId)) {
				updateRootSlot((currentSlot) => {
					const removedTree = removeNodeFromTree(currentSlot, nodeId);
					return [...removedTree, node];
				});
				return true;
			}

			if (!hasSlots(targetNode)) {
				logger.warn("Target node has no slots - cannot accept children");
				return false;
			}

			if (isDescendant(node, targetId)) {
				logger.warn("Cannot move node into itself or its descendants");
				return false;
			}

			const targetSlotName = slotName ?? getFirstSlotName(targetNode);

			if (!targetSlotName) {
				logger.warn("Target node has no valid slot");
				return false;
			}

			if (!targetNode.slots?.[targetSlotName]) {
				logger.warn("Specified slot does not exist on target node", targetSlotName);
				return false;
			}
			const validSlotName = targetSlotName;
			updateRootSlot((currentSlot) => {
				const removedTree = removeNodeFromTree(currentSlot, nodeId);
				return insertNodeIntoSlot(removedTree, targetId, validSlotName, node);
			});
			return true;
		},

		reorderNode(nodeId: string, targetId: string, position: "before" | "after"): boolean {
			const slot = getSlot();
			const node = findNodeById(slot, nodeId);
			const targetNode = findNodeById(slot, targetId);

			if (!node || !targetNode) {
				logger.warn("Node or target not found");
				return false;
			}

			const nodeParentInfo = findParentOfNode(slot, nodeId);
			const targetParentInfo = findParentOfNode(slot, targetId);

			if (!nodeParentInfo || !targetParentInfo) {
				logger.warn("Cannot find parent info");
				return false;
			}

			if (!nodeParentInfo.parent || !targetParentInfo.parent) {
				logger.warn("Cannot find parent info");
				return false;
			}
			if (
				nodeParentInfo.parent.meta.id !== targetParentInfo.parent.meta.id ||
				nodeParentInfo.slotName !== targetParentInfo.slotName
			) {
				logger.warn("Nodes must be siblings to reorder");
				return false;
			}

			let newPosition = targetParentInfo.index;
			if (position === "after") {
				newPosition += 1;
			}

			if (nodeParentInfo.index < newPosition) {
				newPosition -= 1;
			}
			if (isRootNode(nodeParentInfo.parent.meta.id)) {
				updateRootSlot((currentSlot) => {
					const removedTree = removeNodeFromTree(currentSlot, nodeId);
					const newArray = [...removedTree];
					newArray.splice(newPosition, 0, node);
					return newArray;
				});
			} else {
				if (!nodeParentInfo.parent) {
					logger.warn("Cannot find parent of node");
					return false;
				}
				const nodeParentId = nodeParentInfo.parent.meta.id;
				updateRootSlot((currentSlot) => {
					const removedTree = removeNodeFromTree(currentSlot, nodeId);
					return insertNodeAtPosition(
						removedTree,
						nodeParentId,
						nodeParentInfo.slotName,
						node,
						newPosition,
					);
				});
			}
			return true;
		},

		deleteNode(nodeId: string): boolean {
			const slot = getSlot();
			const node = findNodeById(slot, nodeId);

			if (!node) {
				logger.warn("Node not found");
				return false;
			}

			if (isRootNode(nodeId)) {
				logger.warn("Cannot delete root node");
				return false;
			}
			updateRootSlot((currentSlot) => {
				return removeNodeFromTree(currentSlot, nodeId);
			});
			return true;
		},

		cutNode(nodeId: string): UJLCModuleObject | null {
			const copiedNode = this.copyNode(nodeId);
			if (!copiedNode) {
				return null;
			}
			const deleted = this.deleteNode(nodeId);
			if (!deleted) {
				return null;
			}
			return copiedNode;
		},

		pasteNode(
			node: UJLCModuleObject,
			targetId: string,
			slotName?: string,
			position?: "before" | "after" | "into",
		): string | null {
			const slot = getSlot();

			// Assign new IDs at paste time (ensures uniqueness, enables multiple pastes)
			const clonedNode = deepCloneModuleWithNewIds(node);

			const pastePosition = position ?? "after";

			if (isRootNode(targetId)) {
				updateRootSlot((currentSlot) => {
					return [...currentSlot, clonedNode];
				});
				return clonedNode.meta.id;
			}

			const targetNode = findNodeById(slot, targetId);
			if (!targetNode) {
				logger.warn("Target node not found");
				return null;
			}

			if (pastePosition === "before" || pastePosition === "after") {
				const targetParentInfo = findParentOfNode(slot, targetId);

				if (!targetParentInfo) {
					logger.warn("Cannot find parent of target node");
					return null;
				}

				if (!targetParentInfo.parent) {
					logger.warn("Cannot find parent of target node");
					return null;
				}

				const targetParentId = targetParentInfo.parent.meta.id;
				if (isRootNode(targetParentId)) {
					let insertPosition = targetParentInfo.index;
					if (pastePosition === "after") {
						insertPosition += 1;
					}

					updateRootSlot((currentSlot) => {
						const newArray = [...currentSlot];
						newArray.splice(insertPosition, 0, clonedNode);
						return newArray;
					});
				} else {
					let insertPosition = targetParentInfo.index;
					if (pastePosition === "after") {
						insertPosition += 1;
					}

					updateRootSlot((currentSlot) => {
						return insertNodeAtPosition(
							currentSlot,
							targetParentId,
							targetParentInfo.slotName,
							clonedNode,
							insertPosition,
						);
					});
				}
				return clonedNode.meta.id;
			}

			if (!hasSlots(targetNode)) {
				logger.warn("Target node has no slots");
				return null;
			}

			const targetSlotName = slotName ?? getFirstSlotName(targetNode);

			if (!targetSlotName) {
				logger.warn("Target node has no valid slot");
				return null;
			}

			if (!targetNode.slots?.[targetSlotName]) {
				logger.warn("Specified slot does not exist on target node", targetSlotName);
				return null;
			}

			const validSlotName = targetSlotName;
			updateRootSlot((currentSlot) => {
				return insertNodeIntoSlot(currentSlot, targetId, validSlotName, clonedNode);
			});
			return clonedNode.meta.id;
		},

		insertNode(
			componentType: string,
			targetId: string,
			slotName?: string,
			position?: "before" | "after" | "into",
		): string | null {
			const slot = getSlot();

			let newNode: UJLCModuleObject;
			try {
				newNode = composer.createModuleFromType(componentType, generateNodeId());
			} catch {
				logger.warn("Component type not found in registry", componentType);
				return null;
			}

			if (isRootNode(targetId)) {
				updateRootSlot((currentSlot) => {
					return [...currentSlot, newNode];
				});
				return newNode.meta.id;
			}

			const targetNode = findNodeById(slot, targetId);

			if (!targetNode) {
				logger.warn("Target node not found");
				return null;
			}

			if (position === "before" || position === "after") {
				const targetParentInfo = findParentOfNode(slot, targetId);

				if (!targetParentInfo) {
					logger.warn("Cannot find parent of target node");
					return null;
				}

				if (!targetParentInfo.parent) {
					logger.warn("Cannot find parent of target node");
					return null;
				}

				const targetParentId = targetParentInfo.parent.meta.id;
				if (isRootNode(targetParentId)) {
					let insertPosition = targetParentInfo.index;
					if (position === "after") {
						insertPosition += 1;
					}

					updateRootSlot((currentSlot) => {
						const newArray = [...currentSlot];
						newArray.splice(insertPosition, 0, newNode);
						return newArray;
					});
				} else {
					let insertPosition = targetParentInfo.index;
					if (position === "after") {
						insertPosition += 1;
					}

					updateRootSlot((currentSlot) => {
						return insertNodeAtPosition(
							currentSlot,
							targetParentId,
							targetParentInfo.slotName,
							newNode,
							insertPosition,
						);
					});
				}
				return newNode.meta.id;
			}

			if (!hasSlots(targetNode)) {
				logger.warn("Target node has no slots - cannot accept children");
				return null;
			}

			const targetSlotName = slotName ?? getFirstSlotName(targetNode);

			if (!targetSlotName) {
				logger.warn("Target node has no valid slot");
				return null;
			}

			if (!targetNode.slots?.[targetSlotName]) {
				logger.warn("Specified slot does not exist on target node", targetSlotName);
				return null;
			}
			const validSlotName = targetSlotName;
			updateRootSlot((currentSlot) => {
				return insertNodeIntoSlot(currentSlot, targetId, validSlotName, newNode);
			});
			return newNode.meta.id;
		},

		copySlot(
			parentId: string,
			slotName: string,
		): { type: "slot"; slotName: string; content: UJLCModuleObject[] } | null {
			const slot = getSlot();
			const parentNode = findNodeById(slot, parentId);

			if (!parentNode?.slots?.[slotName]) {
				logger.warn("Slot not found", slotName);
				return null;
			}

			// Clone preserving IDs (new IDs assigned at paste time)
			const slotData = {
				type: "slot" as const,
				slotName,
				content: parentNode.slots[slotName].map((module) => deepCloneModule(module)),
			};
			return slotData;
		},

		cutSlot(
			parentId: string,
			slotName: string,
		): { type: "slot"; slotName: string; content: UJLCModuleObject[] } | null {
			const copiedSlot = this.copySlot(parentId, slotName);
			if (!copiedSlot) {
				return null;
			}
			updateRootSlot((currentSlot) => {
				return updateNodeInTree(currentSlot, parentId, (node: UJLCModuleObject) => ({
					...node,
					slots: {
						...node.slots,
						[slotName]: [],
					},
				}));
			});
			return copiedSlot;
		},

		pasteSlot(
			slotData: { type: "slot"; slotName: string; content: UJLCModuleObject[] },
			targetParentId: string,
		): boolean {
			const slot = getSlot();
			const targetNode = findNodeById(slot, targetParentId);

			if (!targetNode || !hasSlots(targetNode)) {
				logger.warn("Target node has no slots");
				return false;
			}

			if (!Object.keys(targetNode.slots).includes(slotData.slotName)) {
				logger.warn("Target does not have slot", slotData.slotName);
				return false;
			}

			// Assign new IDs at paste time (ensures uniqueness, enables multiple pastes)
			const clonedContent = slotData.content.map((module) => deepCloneModuleWithNewIds(module));

			updateRootSlot((currentSlot) => {
				return updateNodeInTree(currentSlot, targetParentId, (node: UJLCModuleObject) => ({
					...node,
					slots: {
						...node.slots,
						[slotData.slotName]: [...clonedContent],
					},
				}));
			});
			return true;
		},

		moveSlot(
			sourceParentId: string,
			sourceSlotName: string,
			targetParentId: string,
			targetSlotName: string,
		): boolean {
			const slot = getSlot();

			if (sourceParentId === targetParentId && sourceSlotName === targetSlotName) {
				logger.warn("Cannot move slot to itself");
				return false;
			}

			const sourceParent = findNodeById(slot, sourceParentId);
			const targetParent = findNodeById(slot, targetParentId);

			if (!sourceParent?.slots?.[sourceSlotName]) {
				logger.warn("Source slot not found", sourceSlotName);
				return false;
			}

			if (!targetParent || !hasSlots(targetParent)) {
				logger.warn("Target node has no slots");
				return false;
			}

			if (!targetParent.slots?.[targetSlotName]) {
				logger.warn(
					`Target node doesn't have slot "${targetSlotName}". Available slots:`,
					Object.keys(targetParent.slots),
				);
				return false;
			}

			const slotContent = [...sourceParent.slots[sourceSlotName]];

			updateRootSlot((currentSlot) => {
				let updatedSlot = updateNodeInTree(
					currentSlot,
					sourceParentId,
					(node: UJLCModuleObject) => ({
						...node,
						slots: {
							...node.slots,
							[sourceSlotName]: [],
						},
					}),
				);
				updatedSlot = updateNodeInTree(updatedSlot, targetParentId, (node: UJLCModuleObject) => {
					const newSlots = { ...node.slots };
					newSlots[targetSlotName] = [...slotContent];

					return {
						...node,
						slots: newSlots,
					};
				});

				return updatedSlot;
			});
			return true;
		},

		updateNodeField(nodeId: string, fieldName: string, value: unknown): boolean {
			const slot = getSlot();
			const node = findNodeById(slot, nodeId);

			if (!node) {
				logger.warn("Node not found for updateNodeField", nodeId);
				return false;
			}

			// Update field immutably with new timestamp
			updateRootSlot((currentSlot) => {
				return updateNodeInTree(currentSlot, nodeId, (node: UJLCModuleObject) => ({
					...node,
					fields: {
						...node.fields,
						[fieldName]: value,
					},
					meta: {
						...node.meta,
						updated_at: new Date().toISOString(),
					},
				}));
			});

			return true;
		},

		updateNodeFields(nodeId: string, updates: Record<string, unknown>): boolean {
			const slot = getSlot();
			const node = findNodeById(slot, nodeId);

			if (!node) {
				logger.warn("Node not found for updateNodeFields", nodeId);
				return false;
			}

			// Update all fields immutably with new timestamp
			updateRootSlot((currentSlot) => {
				return updateNodeInTree(currentSlot, nodeId, (node: UJLCModuleObject) => ({
					...node,
					fields: {
						...node.fields,
						...updates,
					},
					meta: {
						...node.meta,
						updated_at: new Date().toISOString(),
					},
				}));
			});

			return true;
		},
	};
}
