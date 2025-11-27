import type { UJLCModuleObject } from '@ujl-framework/types';

/**
 * Finds a node by its ID
 */
export function findNodeById(nodes: UJLCModuleObject[], targetId: string): UJLCModuleObject | null {
	for (const node of nodes) {
		if (node.meta.id === targetId) {
			return node;
		}

		// search recursively in all slots
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
 * Finds the parent of a node by its ID
 */
export function findParentOfNode(
	nodes: UJLCModuleObject[],
	targetId: string,
	parent: UJLCModuleObject | null = null,
	slotName: string = 'root'
): { parent: UJLCModuleObject | null; slotName: string; index: number } | null {
	for (let i = 0; i < nodes.length; i++) {
		const node = nodes[i];

		if (node.meta.id === targetId) {
			return {
				parent,
				slotName,
				index: i
			};
		}

		// search recursively in all slots
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
 * Removes a node from the tree by its ID (immutable)
 */
export function removeNodeFromTree(
	nodes: UJLCModuleObject[],
	targetId: string
): UJLCModuleObject[] {
	return nodes
		.filter((node) => node.meta.id !== targetId)
		.map((node) => {
			// if the node has slots, search recursively in all slots
			if (node.slots && Object.keys(node.slots).length > 0) {
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
 * Adds a node into a specified slot of a parent node (immutable)
 */
export function insertNodeIntoSlot(
	nodes: UJLCModuleObject[],
	parentId: string,
	slotName: string,
	nodeToInsert: UJLCModuleObject
): UJLCModuleObject[] {
	return nodes.map((node) => {
		// if this is the parent node, insert into the specified slot
		if (node.meta.id === parentId) {
			const newSlots = { ...node.slots };

			// Slot exists
			if (newSlots[slotName]) {
				newSlots[slotName] = [...newSlots[slotName], nodeToInsert];
			} else {
				// slot does not exist yet, create it
				newSlots[slotName] = [nodeToInsert];
			}

			return {
				...node,
				slots: newSlots
			};
		}

		// search recursively in all slots
		if (node.slots && Object.keys(node.slots).length > 0) {
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
 * Inserts a node at a specific position in a parent's slot (immutable)
 */
export function insertNodeAtPosition(
	nodes: UJLCModuleObject[],
	parentId: string,
	slotName: string,
	nodeToInsert: UJLCModuleObject,
	position: number
): UJLCModuleObject[] {
	return nodes.map((node) => {
		// if this is the parent node, insert into the specified slot at position
		if (node.meta.id === parentId) {
			const newSlots = { ...node.slots };

			if (newSlots[slotName]) {
				const slotArray = [...newSlots[slotName]];
				// Insert at specific position
				slotArray.splice(position, 0, nodeToInsert);
				newSlots[slotName] = slotArray;
			} else {
				// slot does not exist yet, create it
				newSlots[slotName] = [nodeToInsert];
			}

			return {
				...node,
				slots: newSlots
			};
		}

		// search recursively in all slots
		if (node.slots && Object.keys(node.slots).length > 0) {
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
 * Updates a node in the tree by applying a function to it (immutable)
 * @param nodes - The tree of nodes
 * @param targetId - The ID of the node to update
 * @param updateFn - Function that receives the node and returns updated node
 * @returns Updated tree with the modified node
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
 * Returns the name of the first slot of a node, or null if there are no slots
 */
export function getFirstSlotName(node: UJLCModuleObject): string | null {
	if (!node.slots || Object.keys(node.slots).length === 0) {
		return null;
	}

	return Object.keys(node.slots)[0];
}

/**
 * Checks if a node has slots
 */
export function hasSlots(node: UJLCModuleObject): boolean {
	return node.slots && Object.keys(node.slots).length > 0;
}

/**
 * Returns a display name for a node
 */
export function getDisplayName(node: UJLCModuleObject): string {
	const typeName = formatTypeName(node.type);

	// Title/Labels
	if (node.fields.title) return `${typeName}: ${node.fields.title}`;
	if (node.fields.label) return `${typeName}: ${node.fields.label}`;
	if (node.fields.headline) return `${typeName}: ${node.fields.headline}`;

	// Content-Fields (shortened)
	if (node.fields.content && typeof node.fields.content === 'string') {
		const content = node.fields.content.trim();
		const shortContent = content.length > 40 ? content.substring(0, 40) + '...' : content;
		return `${typeName}: ${shortContent}`;
	}

	// Type only
	return typeName;
}

/**
 * Formats a type string into a more readable format
 */
export function formatTypeName(type: string): string {
	return type
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

/**
 * Returns the children of a node
 */
export function getChildren(node: UJLCModuleObject): UJLCModuleObject[] {
	if (!node.slots) return [];

	// traverse all slots and collect children
	return Object.values(node.slots).flat();
}

/**
 * Checks if a node has children
 */
export function hasChildren(node: UJLCModuleObject): boolean {
	if (!node.slots) return false;
	return Object.values(node.slots).some((slot) => slot.length > 0);
}

/**
 * Checks if a node has multiple slots WITH children
 */
export function hasMultipleSlotsWithChildren(node: UJLCModuleObject): boolean {
	if (!node.slots) return false;
	const slotsWithChildren = Object.values(node.slots).filter((slot) => slot.length > 0);
	return slotsWithChildren.length > 1;
}

/**
 * Returns all slot entries [slotName, children[]] that have children
 */
export function getSlotEntriesWithChildren(node: UJLCModuleObject): [string, UJLCModuleObject[]][] {
	if (!node.slots) return [];
	return Object.entries(node.slots).filter(([, children]) => children.length > 0);
}

/**
 * Checks if a node has multiple slots (regardless of content)
 */
export function hasMultipleSlots(node: UJLCModuleObject): boolean {
	if (!node.slots) return false;
	return Object.keys(node.slots).length > 1;
}

/**
 * Returns ALL slot entries [slotName, children[]] (including empty slots)
 */
export function getAllSlotEntries(node: UJLCModuleObject): [string, UJLCModuleObject[]][] {
	if (!node.slots) return [];
	return Object.entries(node.slots);
}

/**
 * Checks if target has slots (can accept children)
 */
export function canAcceptDrop(targetNode: UJLCModuleObject): boolean {
	return targetNode.slots && Object.keys(targetNode.slots).length > 0;
}

/**
 * Helper to check if a node can accept paste
 */
export function canNodeAcceptPaste(
	node: UJLCModuleObject,
	clipboard:
		| UJLCModuleObject
		| { type: 'slot'; slotName: string; content: UJLCModuleObject[] }
		| null
): boolean {
	if (clipboard === null || !hasSlots(node)) return false;

	// If clipboard is a regular node, check if target has slots
	if ('meta' in clipboard) {
		return true;
	}

	// If clipboard is a slot, check if target has that slot type
	if (clipboard.type === 'slot' && node.slots) {
		return Object.keys(node.slots).includes(clipboard.slotName);
	}

	return false;
}

/**
 * Helper to check if a slot can accept paste
 */
export function canSlotAcceptPaste(
	clipboard:
		| UJLCModuleObject
		| { type: 'slot'; slotName: string; content: UJLCModuleObject[] }
		| null,
	slotName: string
): boolean {
	if (!clipboard) return false;

	// Regular nodes can't be pasted into slots (they go into the parent node)
	if ('meta' in clipboard) return false;

	// Slots can only be pasted if the slot name matches
	if (clipboard.type === 'slot') {
		return clipboard.slotName === slotName;
	}

	return false;
}

/**
 * Format slot name for display
 */
export function formatSlotName(slotName: string): string {
	return slotName
		.split(/[-_]/)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}
