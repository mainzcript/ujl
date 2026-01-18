/**
 * Scoped DOM Query Utilities
 *
 * Provides container-scoped DOM queries to ensure multiple Crafter instances
 * on the same page don't interfere with each other.
 *
 * @module scoped-dom
 */

/**
 * Creates a container-scoped query selector for a specific Crafter instance.
 *
 * All queries are scoped to the container element marked with
 * `data-crafter-instance="${instanceId}"`.
 *
 * @param instanceId - The unique Crafter instance ID
 * @returns Object with scoped querySelector and querySelectorAll methods
 *
 * @example
 * ```ts
 * const dom = createScopedSelector('crafter-abc123');
 *
 * // Only finds elements within this Crafter instance
 * const element = dom.querySelector('[data-ujl-module-id="123"]');
 * const elements = dom.querySelectorAll('[data-ujl-module-id].ujl-selected');
 * ```
 */
export function createScopedSelector(instanceId: string) {
	/**
	 * Gets the container element for this Crafter instance.
	 * Returns null if the container is not found (e.g., during unmount).
	 */
	const getContainer = (): HTMLElement | null =>
		document.querySelector(`[data-crafter-instance="${instanceId}"]`);

	return {
		/**
		 * Finds the first element matching the selector within this Crafter instance.
		 * @param selector - CSS selector string
		 * @returns The first matching element or null
		 */
		querySelector<T extends Element = Element>(selector: string): T | null {
			const container = getContainer();
			return container?.querySelector<T>(selector) ?? null;
		},

		/**
		 * Finds all elements matching the selector within this Crafter instance.
		 * @param selector - CSS selector string
		 * @returns NodeList of matching elements (empty if container not found)
		 */
		querySelectorAll<T extends Element = Element>(selector: string): NodeListOf<T> {
			const container = getContainer();
			if (!container) {
				// Return empty NodeList by querying for impossible selector
				return document.querySelectorAll<T>(':scope:not(*)');
			}
			return container.querySelectorAll<T>(selector);
		},

		/**
		 * Gets the container element for this Crafter instance.
		 * Useful when you need direct access to the container.
		 * @returns The container element or null
		 */
		getContainer
	};
}

/** Type for the scoped selector returned by createScopedSelector */
export type ScopedSelector = ReturnType<typeof createScopedSelector>;
