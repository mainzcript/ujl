import type { UJLTTokenSet, UJLCSlotObject } from '@ujl-framework/types';

/**
 * Editor context API for managing UJL document state
 * All mutations go through this API to maintain a single source of truth
 */
export type CrafterContext = {
	/**
	 * Updates the token set (theme tokens)
	 * @param fn - Function that receives the current token set and returns a new one
	 */
	updateTokenSet: (fn: (tokens: UJLTTokenSet) => UJLTTokenSet) => void;

	/**
	 * Updates the content slot (root slot of the UJL content document)
	 * @param fn - Function that receives the current slot and returns a new one
	 */
	updateSlot: (fn: (slot: UJLCSlotObject) => UJLCSlotObject) => void;

	// Future extensions:
	// selectModule: (moduleId: string) => void;
	// undo: () => void;
	// redo: () => void;
};

/**
 * Symbol for the Crafter context key
 */
export const CRAFTER_CONTEXT = Symbol('CRAFTER_CONTEXT');
