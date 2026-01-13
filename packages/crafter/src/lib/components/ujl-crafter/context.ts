import type {
	UJLTTokenSet,
	UJLCSlotObject,
	UJLCModuleObject,
	UJLCMediaLibrary,
	UJLCDocumentMeta
} from '@ujl-framework/types';
import { generateUid } from '@ujl-framework/core';
import type { MediaService } from '$lib/services/index.js';
import {
	findNodeById,
	findParentOfNode,
	removeNodeFromTree,
	insertNodeIntoSlot,
	insertNodeAtPosition,
	getFirstSlotName,
	hasSlots,
	updateNodeInTree,
	isDescendant,
	isRootNode,
	deepCloneModule,
	deepCloneModuleWithNewIds,
	DEFAULT_NODE_ID_LENGTH
} from '$lib/utils/ujlc-tree.js';
import type { Composer } from '@ujl-framework/core';
import { logger } from '$lib/utils/logger.js';

/**
 * Editor context API for managing UJL document state.
 * All mutations go through this API to maintain a single source of truth.
 *
 * This context is provided by `ujl-crafter.svelte` and consumed by child components
 * that need to update the document state (e.g., Designer, Editor).
 *
 * Architecture: Unidirectional data flow
 * - Tokens and documents are owned by ujl-crafter.svelte (Single Source of Truth)
 * - Child components receive tokens as read-only props
 * - Changes flow up via callbacks (onChange handlers) to updateTokenSet/updateRootSlot
 * - No local token copies or two-way bindings - data flows down, events flow up
 */
export type MediaLibraryContext = {
	fieldName: string;
	nodeId: string;
	currentValue: string | number | null;
} | null;

export type CrafterContext = {
	/**
	 * Get whether the media library view is active
	 */
	isMediaLibraryViewActive: () => boolean;

	/**
	 * Set whether the media library view is active
	 * @param active - Whether to show the media library
	 * @param context - Optional context for which field is being edited
	 */
	setMediaLibraryViewActive: (active: boolean, context?: MediaLibraryContext) => void;

	/**
	 * Get the current media library context (which field is being edited)
	 */
	getMediaLibraryContext: () => MediaLibraryContext;

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
	 * Updates the media library in the UJL content document.
	 * Implementations are expected to return a new media library object (immutable update).
	 *
	 * @param fn - Function that receives the current media library and returns a new one.
	 *             Must not mutate the input object; must return a new object instance.
	 *
	 * @example
	 * ```ts
	 * crafter.updateMedia((oldMedia) => ({
	 *   ...oldMedia,
	 *   [mediaId]: { dataUrl: "...", metadata: { ... } }
	 * }));
	 * ```
	 */
	updateMedia: (fn: (media: UJLCMediaLibrary) => UJLCMediaLibrary) => void;

	/**
	 * Get the current media library (reactive getter for media operations).
	 * Returns the current state of the media library for read-only access.
	 *
	 * @returns The current media library object
	 */
	getMedia: () => UJLCMediaLibrary;

	/**
	 * Get the media service for the current storage configuration
	 * @returns The media service instance
	 */
	getMediaService: () => MediaService;

	/**
	 * Get the document metadata (for accessing media library config)
	 * @returns The document metadata
	 */
	getMeta: () => UJLCDocumentMeta;

	/**
	 * Get the current root slot (reactive getter for property panel).
	 * Returns the current state of the root slot for read-only access.
	 *
	 * @returns The current root slot array
	 *
	 * @example
	 * ```ts
	 * const rootSlot = crafter.getRootSlot();
	 * const node = findNodeById(rootSlot, nodeId);
	 * ```
	 */
	getRootSlot: () => UJLCSlotObject;

	/**
	 * Set the currently selected node ID
	 * This triggers navigation and updates the URL
	 */
	setSelectedNodeId: (nodeId: string | null) => void;

	/**
	 * Get the set of expanded node IDs in the navigation tree
	 * Returns a reactive getter function
	 */
	getExpandedNodeIds: () => Set<string>;

	/**
	 * Toggle a node's expanded state
	 * @param nodeId - The node ID to toggle
	 * @param expanded - Whether the node should be expanded
	 */
	setNodeExpanded: (nodeId: string, expanded: boolean) => void;

	/**
	 * Expand all parent nodes to make a target node visible
	 * @param nodeId - The target node ID
	 */
	expandToNode: (nodeId: string) => void;

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
		 * Moves a node to a target parent's slot or position
		 * @param position - 'before' | 'after' inserts relative to target, 'into' inserts into target's slot
		 * @returns true if successful, false if operation was rejected
		 */
		moveNode: (
			nodeId: string,
			targetId: string,
			slotName?: string,
			position?: 'before' | 'after' | 'into'
		) => boolean;

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
		 * @param position - 'before' | 'after' inserts relative to target, 'into' inserts into target's slot. Default is 'after'.
		 * @returns ID of the pasted node if successful, null if operation was rejected
		 */
		pasteNode: (
			node: UJLCModuleObject,
			targetId: string,
			slotName?: string,
			position?: 'before' | 'after' | 'into'
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
			position?: 'before' | 'after' | 'into'
		) => string | null;

		/**
		 * Copies a complete slot with all its content
		 * @param parentId - The parent node ID
		 * @param slotName - The slot name to copy
		 * @returns Object with slot name and content, or null if operation failed
		 */
		copySlot: (
			parentId: string,
			slotName: string
		) => { type: 'slot'; slotName: string; content: UJLCModuleObject[] } | null;

		/**
		 * Cuts a complete slot (empties it and returns content)
		 * @param parentId - The parent node ID
		 * @param slotName - The slot name to cut
		 * @returns Object with slot name and content, or null if operation failed
		 */
		cutSlot: (
			parentId: string,
			slotName: string
		) => { type: 'slot'; slotName: string; content: UJLCModuleObject[] } | null;

		/**
		 * Pastes slot content into a target node's matching slot
		 * @param slotData - The slot data from clipboard
		 * @param targetParentId - The target parent node ID
		 * @returns true if successful, false if operation was rejected
		 */
		pasteSlot: (
			slotData: { type: 'slot'; slotName: string; content: UJLCModuleObject[] },
			targetParentId: string
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
			targetSlotName: string
		) => boolean;

		/**
		 * Updates a single field of a node (for property panel).
		 * Performs immutable update and updates the updated_at timestamp.
		 *
		 * @param nodeId - The node ID to update
		 * @param fieldName - The field name to update
		 * @param value - The new value for the field
		 * @returns true if successful, false if node not found
		 *
		 * @example
		 * ```ts
		 * crafter.operations.updateNodeField('node-123', 'title', 'New Title');
		 * ```
		 */
		updateNodeField: (nodeId: string, fieldName: string, value: unknown) => boolean;

		/**
		 * Updates multiple fields of a node at once (bulk update).
		 * More efficient than multiple updateNodeField calls.
		 *
		 * @param nodeId - The node ID to update
		 * @param updates - Record of field names to new values
		 * @returns true if successful, false if node not found
		 *
		 * @example
		 * ```ts
		 * crafter.operations.updateNodeFields('node-123', {
		 *   title: 'New Title',
		 *   description: 'New Description'
		 * });
		 * ```
		 */
		updateNodeFields: (nodeId: string, updates: Record<string, unknown>) => boolean;
	};

	// Future extensions (planned but not yet implemented):
	// selectModule: (moduleId: string) => void;
	// undo: () => void;
	// redo: () => void;
};

/**
 * Symbol for the Crafter context key
 */
export const CRAFTER_CONTEXT = Symbol.for('CRAFTER_CONTEXT');
export const COMPOSER_CONTEXT = Symbol.for('COMPOSER_CONTEXT');

/**
 * Generates a unique random ID for a node.
 * Uses the framework's centralized ID generator from @ujl-framework/core.
 * Uses a shorter ID length (10 characters) for better UX in URLs and UI.
 *
 * @returns A unique random ID string
 *
 * @example
 * ```ts
 * const id = generateNodeId(); // "V1StGXR8_Z"
 * ```
 */
export function generateNodeId(): string {
	return generateUid(DEFAULT_NODE_ID_LENGTH);
}

/**
 * Finds the path from root to target node.
 * Returns an array of all parent node IDs leading to the target.
 *
 * @param nodes - Array of root nodes to search
 * @param targetId - The node ID to find
 * @param currentPath - Current path (used for recursion)
 * @returns Array of parent node IDs, or null if not found
 *
 * @example
 * ```ts
 * const path = findPathToNode(rootNodes, 'child-node-id');
 * // Returns: ['parent-id', 'grandparent-id']
 * ```
 */
export function findPathToNode(
	nodes: UJLCModuleObject[],
	targetId: string,
	currentPath: string[] = []
): string[] | null {
	for (const node of nodes) {
		// Check if this is the target node
		if (node.meta.id === targetId) {
			return currentPath;
		}

		// Check children in all slots
		if (node.slots) {
			for (const slotContent of Object.values(node.slots)) {
				const newPath = [...currentPath, node.meta.id];
				const result = findPathToNode(slotContent, targetId, newPath);
				if (result !== null) {
					return result;
				}
			}
		}
	}

	return null;
}

/**
 * Creates operation handlers that work with the provided slot and updateRootSlot function
 */
export function createOperations(
	getSlot: () => UJLCSlotObject,
	updateRootSlot: (fn: (slot: UJLCSlotObject) => UJLCSlotObject) => void,
	composer: Composer
): CrafterContext['operations'] {
	return {
		copyNode(nodeId: string): UJLCModuleObject | null {
			const slot = getSlot();
			const node = findNodeById(slot, nodeId);

			if (!node) {
				logger.warn('Node not found');
				return null;
			}

			if (isRootNode(nodeId)) {
				logger.warn('Cannot copy root node');
				return null;
			}

			return deepCloneModule(node);
		},

		moveNode(
			nodeId: string,
			targetId: string,
			slotName?: string,
			position?: 'before' | 'after' | 'into'
		): boolean {
			const slot = getSlot();
			const node = findNodeById(slot, nodeId);
			const targetNode = findNodeById(slot, targetId);

			if (!node || !targetNode) {
				logger.warn('Node or target not found');
				return false;
			}

			if (isRootNode(nodeId)) {
				logger.warn('Cannot move root node');
				return false;
			}

			const parentInfo = findParentOfNode(slot, nodeId);
			if (!parentInfo) {
				logger.warn('Cannot find parent of node');
				return false;
			}

			if (position === 'before' || position === 'after') {
				const targetParentInfo = findParentOfNode(slot, targetId);

				if (!targetParentInfo) {
					logger.warn('Cannot find parent of target node');
					return false;
				}

				if (isRootNode(targetId)) {
					logger.warn('Cannot move relative to root node');
					return false;
				}

				if (isDescendant(node, targetId)) {
					logger.warn('Cannot move node into itself or its descendants');
					return false;
				}

				let newPosition = targetParentInfo.index;
				if (position === 'after') {
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
						logger.warn('Cannot find parent of target node');
						return false;
					}
					updateRootSlot((currentSlot) => {
						const removedTree = removeNodeFromTree(currentSlot, nodeId);
						return insertNodeAtPosition(
							removedTree,
							targetParentInfo.parent!.meta.id,
							targetParentInfo.slotName,
							node,
							newPosition
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
				logger.warn('Target node has no slots - cannot accept children');
				return false;
			}

			if (isDescendant(node, targetId)) {
				logger.warn('Cannot move node into itself or its descendants');
				return false;
			}

			const targetSlotName = slotName ?? getFirstSlotName(targetNode);

			if (!targetSlotName) {
				logger.warn('Target node has no valid slot');
				return false;
			}

			if (!targetNode.slots?.[targetSlotName]) {
				logger.warn('Specified slot does not exist on target node', targetSlotName);
				return false;
			}
			updateRootSlot((currentSlot) => {
				const removedTree = removeNodeFromTree(currentSlot, nodeId);
				return insertNodeIntoSlot(removedTree, targetId, targetSlotName!, node);
			});
			return true;
		},

		reorderNode(nodeId: string, targetId: string, position: 'before' | 'after'): boolean {
			const slot = getSlot();
			const node = findNodeById(slot, nodeId);
			const targetNode = findNodeById(slot, targetId);

			if (!node || !targetNode) {
				logger.warn('Node or target not found');
				return false;
			}

			const nodeParentInfo = findParentOfNode(slot, nodeId);
			const targetParentInfo = findParentOfNode(slot, targetId);

			if (!nodeParentInfo || !targetParentInfo) {
				logger.warn('Cannot find parent info');
				return false;
			}

			if (!nodeParentInfo.parent || !targetParentInfo.parent) {
				logger.warn('Cannot find parent info');
				return false;
			}
			if (
				nodeParentInfo.parent.meta.id !== targetParentInfo.parent.meta.id ||
				nodeParentInfo.slotName !== targetParentInfo.slotName
			) {
				logger.warn('Nodes must be siblings to reorder');
				return false;
			}

			let newPosition = targetParentInfo.index;
			if (position === 'after') {
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
					logger.warn('Cannot find parent of node');
					return false;
				}
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
			}
			return true;
		},

		deleteNode(nodeId: string): boolean {
			const slot = getSlot();
			const node = findNodeById(slot, nodeId);

			if (!node) {
				logger.warn('Node not found');
				return false;
			}

			if (isRootNode(nodeId)) {
				logger.warn('Cannot delete root node');
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
			position?: 'before' | 'after' | 'into'
		): string | null {
			const slot = getSlot();

			// Assign new IDs at paste time (ensures uniqueness, enables multiple pastes)
			const clonedNode = deepCloneModuleWithNewIds(node);

			const pastePosition = position ?? 'after';

			if (isRootNode(targetId)) {
				updateRootSlot((currentSlot) => {
					return [...currentSlot, clonedNode];
				});
				return clonedNode.meta.id;
			}

			const targetNode = findNodeById(slot, targetId);
			if (!targetNode) {
				logger.warn('Target node not found');
				return null;
			}

			if (pastePosition === 'before' || pastePosition === 'after') {
				const targetParentInfo = findParentOfNode(slot, targetId);

				if (!targetParentInfo) {
					logger.warn('Cannot find parent of target node');
					return null;
				}

				if (!targetParentInfo.parent) {
					logger.warn('Cannot find parent of target node');
					return null;
				}

				if (isRootNode(targetParentInfo.parent.meta.id)) {
					let insertPosition = targetParentInfo.index;
					if (pastePosition === 'after') {
						insertPosition += 1;
					}

					updateRootSlot((currentSlot) => {
						const newArray = [...currentSlot];
						newArray.splice(insertPosition, 0, clonedNode);
						return newArray;
					});
				} else {
					let insertPosition = targetParentInfo.index;
					if (pastePosition === 'after') {
						insertPosition += 1;
					}

					updateRootSlot((currentSlot) => {
						return insertNodeAtPosition(
							currentSlot,
							targetParentInfo.parent!.meta.id,
							targetParentInfo.slotName,
							clonedNode,
							insertPosition
						);
					});
				}
				return clonedNode.meta.id;
			}

			if (!hasSlots(targetNode)) {
				logger.warn('Target node has no slots');
				return null;
			}

			const targetSlotName = slotName ?? getFirstSlotName(targetNode);

			if (!targetSlotName) {
				logger.warn('Target node has no valid slot');
				return null;
			}

			if (!targetNode.slots?.[targetSlotName]) {
				logger.warn('Specified slot does not exist on target node', targetSlotName);
				return null;
			}

			updateRootSlot((currentSlot) => {
				return insertNodeIntoSlot(currentSlot, targetId, targetSlotName!, clonedNode);
			});
			return clonedNode.meta.id;
		},

		insertNode(
			componentType: string,
			targetId: string,
			slotName?: string,
			position?: 'before' | 'after' | 'into'
		): string | null {
			const slot = getSlot();

			let newNode: UJLCModuleObject;
			try {
				newNode = composer.createModuleFromType(componentType, generateNodeId());
			} catch {
				logger.warn('Component type not found in registry', componentType);
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
				logger.warn('Target node not found');
				return null;
			}

			if (position === 'before' || position === 'after') {
				const targetParentInfo = findParentOfNode(slot, targetId);

				if (!targetParentInfo) {
					logger.warn('Cannot find parent of target node');
					return null;
				}

				if (!targetParentInfo.parent) {
					logger.warn('Cannot find parent of target node');
					return null;
				}

				if (isRootNode(targetParentInfo.parent.meta.id)) {
					let insertPosition = targetParentInfo.index;
					if (position === 'after') {
						insertPosition += 1;
					}

					updateRootSlot((currentSlot) => {
						const newArray = [...currentSlot];
						newArray.splice(insertPosition, 0, newNode);
						return newArray;
					});
				} else {
					let insertPosition = targetParentInfo.index;
					if (position === 'after') {
						insertPosition += 1;
					}

					updateRootSlot((currentSlot) => {
						return insertNodeAtPosition(
							currentSlot,
							targetParentInfo.parent!.meta.id,
							targetParentInfo.slotName,
							newNode,
							insertPosition
						);
					});
				}
				return newNode.meta.id;
			}

			if (!hasSlots(targetNode)) {
				logger.warn('Target node has no slots - cannot accept children');
				return null;
			}

			const targetSlotName = slotName ?? getFirstSlotName(targetNode);

			if (!targetSlotName) {
				logger.warn('Target node has no valid slot');
				return null;
			}

			if (!targetNode.slots?.[targetSlotName]) {
				logger.warn('Specified slot does not exist on target node', targetSlotName);
				return null;
			}
			updateRootSlot((currentSlot) => {
				return insertNodeIntoSlot(currentSlot, targetId, targetSlotName!, newNode);
			});
			return newNode.meta.id;
		},

		copySlot(
			parentId: string,
			slotName: string
		): { type: 'slot'; slotName: string; content: UJLCModuleObject[] } | null {
			const slot = getSlot();
			const parentNode = findNodeById(slot, parentId);

			if (!parentNode?.slots?.[slotName]) {
				logger.warn('Slot not found', slotName);
				return null;
			}

			// Clone preserving IDs (new IDs assigned at paste time)
			const slotData = {
				type: 'slot' as const,
				slotName,
				content: parentNode.slots[slotName].map((module) => deepCloneModule(module))
			};
			return slotData;
		},

		cutSlot(
			parentId: string,
			slotName: string
		): { type: 'slot'; slotName: string; content: UJLCModuleObject[] } | null {
			const copiedSlot = this.copySlot(parentId, slotName);
			if (!copiedSlot) {
				return null;
			}
			updateRootSlot((currentSlot) => {
				return updateNodeInTree(currentSlot, parentId, (node: UJLCModuleObject) => ({
					...node,
					slots: {
						...node.slots,
						[slotName]: []
					}
				}));
			});
			return copiedSlot;
		},

		pasteSlot(
			slotData: { type: 'slot'; slotName: string; content: UJLCModuleObject[] },
			targetParentId: string
		): boolean {
			const slot = getSlot();
			const targetNode = findNodeById(slot, targetParentId);

			if (!targetNode || !hasSlots(targetNode)) {
				logger.warn('Target node has no slots');
				return false;
			}

			if (!Object.keys(targetNode.slots).includes(slotData.slotName)) {
				logger.warn('Target does not have slot', slotData.slotName);
				return false;
			}

			// Assign new IDs at paste time (ensures uniqueness, enables multiple pastes)
			const clonedContent = slotData.content.map((module) => deepCloneModuleWithNewIds(module));

			updateRootSlot((currentSlot) => {
				return updateNodeInTree(currentSlot, targetParentId, (node: UJLCModuleObject) => ({
					...node,
					slots: {
						...node.slots,
						[slotData.slotName]: [...clonedContent]
					}
				}));
			});
			return true;
		},

		moveSlot(
			sourceParentId: string,
			sourceSlotName: string,
			targetParentId: string,
			targetSlotName: string
		): boolean {
			const slot = getSlot();

			if (sourceParentId === targetParentId && sourceSlotName === targetSlotName) {
				logger.warn('Cannot move slot to itself');
				return false;
			}

			const sourceParent = findNodeById(slot, sourceParentId);
			const targetParent = findNodeById(slot, targetParentId);

			if (!sourceParent?.slots?.[sourceSlotName]) {
				logger.warn('Source slot not found', sourceSlotName);
				return false;
			}

			if (!targetParent || !hasSlots(targetParent)) {
				logger.warn('Target node has no slots');
				return false;
			}

			if (!targetParent.slots?.[targetSlotName]) {
				logger.warn(
					`Target node doesn't have slot "${targetSlotName}". Available slots:`,
					Object.keys(targetParent.slots)
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
							[sourceSlotName]: []
						}
					})
				);
				updatedSlot = updateNodeInTree(updatedSlot, targetParentId, (node: UJLCModuleObject) => {
					const newSlots = { ...node.slots };
					newSlots[targetSlotName] = [...slotContent];

					return {
						...node,
						slots: newSlots
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
				logger.warn('Node not found for updateNodeField', nodeId);
				return false;
			}

			// Update field immutably with new timestamp
			updateRootSlot((currentSlot) => {
				return updateNodeInTree(currentSlot, nodeId, (node: UJLCModuleObject) => ({
					...node,
					fields: {
						...node.fields,
						[fieldName]: value
					},
					meta: {
						...node.meta,
						updated_at: new Date().toISOString()
					}
				}));
			});

			return true;
		},

		updateNodeFields(nodeId: string, updates: Record<string, unknown>): boolean {
			const slot = getSlot();
			const node = findNodeById(slot, nodeId);

			if (!node) {
				logger.warn('Node not found for updateNodeFields', nodeId);
				return false;
			}

			// Update all fields immutably with new timestamp
			updateRootSlot((currentSlot) => {
				return updateNodeInTree(currentSlot, nodeId, (node: UJLCModuleObject) => ({
					...node,
					fields: {
						...node.fields,
						...updates
					},
					meta: {
						...node.meta,
						updated_at: new Date().toISOString()
					}
				}));
			});

			return true;
		}
	};
}
