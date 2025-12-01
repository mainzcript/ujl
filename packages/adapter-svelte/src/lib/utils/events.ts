/**
 * Event handling utilities for UJL adapter components
 */

/**
 * Creates a click handler for module selection in editor mode.
 * Prevents default actions and event bubbling when eventCallback is provided.
 *
 * @param moduleId - The module ID to pass to the callback
 * @param eventCallback - Optional callback function to invoke on click
 * @returns A click event handler function, or undefined if no callback is provided
 *
 * @example
 * ```typescript
 * const handleClick = createModuleClickHandler(node.id, eventCallback);
 * // Use in component: onclick={handleClick}
 * ```
 */
export function createModuleClickHandler(
	moduleId: string | undefined,
	eventCallback?: (moduleId: string) => void
): ((event: MouseEvent) => void) | undefined {
	if (!eventCallback || !moduleId) {
		return undefined;
	}

	return (event: MouseEvent) => {
		event.preventDefault();
		event.stopPropagation();
		eventCallback(moduleId);
	};
}
