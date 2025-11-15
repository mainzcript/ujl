import type { UJLCModuleObject } from '@ujl-framework/types';

/**
 * finds a node by its ID
 */
export function findNodeById(nodes: UJLCModuleObject[], targetId: string): UJLCModuleObject | null {
	for (const node of nodes) {
		if (node.meta.id === targetId) {
			return node;
		}

		// serach recursively in all slots
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
 * finds the parent of a node by its ID
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
 * removes a node from the tree by its ID (immutable)
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
 * adds a node into a specified slot of a parent node (immutable)
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
 * returns the name of the first slot of a node, or null if there are no slots
 */
export function getFirstSlotName(node: UJLCModuleObject): string | null {
	if (!node.slots || Object.keys(node.slots).length === 0) {
		return null;
	}

	return Object.keys(node.slots)[0];
}

/**
 * checks if a node has slots
 */
export function hasSlots(node: UJLCModuleObject): boolean {
	return node.slots && Object.keys(node.slots).length > 0;
}
