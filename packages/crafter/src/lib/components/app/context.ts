import type { UJLTTokenSet, UJLCSlotObject } from '@ujl-framework/types';

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

	// Future extensions (planned but not yet implemented):
	// selectModule: (moduleId: string) => void;
	// undo: () => void;
	// redo: () => void;
};

/**
 * Symbol for the Crafter context key
 */
export const CRAFTER_CONTEXT = Symbol('CRAFTER_CONTEXT');
