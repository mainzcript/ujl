/**
 * Utility functions for conditional test attributes.
 *
 * Note: Test mode is currently disabled. The test infrastructure will be
 * rebuilt after the framework-agnostic refactoring is complete.
 *
 * Usage:
 * ```svelte
 * <div {...testId('my-component')}>
 * <div {...test('my-component', { 'node-id': '123' })}>
 * ```
 */

// Test mode disabled - will be rebuilt with new test infrastructure
const isTestMode = false;

/**
 * Returns data-testid attribute only in test mode
 * @param id - The test ID to use
 * @returns Object with data-testid attribute or empty object
 *
 * @example
 * ```svelte
 * <div {...testId('nav-tree')}>Content</div>
 * ```
 */
export function testId(id: string): Record<string, string> {
	if (!isTestMode) return {};
	return { 'data-testid': id };
}

/**
 * Returns custom data-* attributes only in test mode
 * @param attrs - Record of attribute names and values
 * @returns Object with data-* attributes or empty object
 *
 * @example
 * ```svelte
 * <div {...testAttrs({ 'node-id': '123', 'node-type': 'text' })}>
 * ```
 */
export function testAttrs(
	attrs: Record<string, string | boolean | number>
): Record<string, string> {
	if (!isTestMode) return {};
	return Object.fromEntries(
		Object.entries(attrs).map(([key, value]) => [`data-${key}`, String(value)])
	);
}

/**
 * Returns both data-testid and custom data-* attributes
 * @param id - The test ID to use
 * @param attrs - Optional record of additional attributes
 * @returns Combined object with all attributes or empty object
 *
 * @example
 * ```svelte
 * <div {...test('nav-tree-item', { 'node-id': node.meta.id })}>
 * ```
 */
export function test(
	id: string,
	attrs?: Record<string, string | boolean | number>
): Record<string, string> {
	if (!isTestMode) return {};

	return {
		'data-testid': id,
		...(attrs ? testAttrs(attrs) : {})
	};
}

/**
 * Returns a function that prefixes test IDs with a given namespace
 * Useful for scoping test IDs within a component
 *
 * @example
 * ```svelte
 * <script>
 * const tid = createTestIdNamespace('nav-tree');
 * </script>
 * <div {...tid('container')}>  <!-- data-testid="nav-tree-container" -->
 * <div {...tid('item')}>       <!-- data-testid="nav-tree-item" -->
 * ```
 */
export function createTestIdNamespace(namespace: string) {
	return (id: string, attrs?: Record<string, string | boolean | number>) => {
		return test(`${namespace}-${id}`, attrs);
	};
}

/**
 * Helper to conditionally add test attributes based on a condition
 * Useful for optional test markers
 *
 * @example
 * ```svelte
 * <div {...testIf(isSelected, 'selected-item')}>
 * ```
 */
export function testIf(
	condition: boolean,
	id: string,
	attrs?: Record<string, string | boolean | number>
): Record<string, string> {
	if (!condition) return {};
	return test(id, attrs);
}
