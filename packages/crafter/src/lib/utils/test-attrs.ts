/**
 * Utility functions for conditional test attributes.
 *
 * Test mode is controlled via UJLCrafterOptions.testMode and read from the Crafter context.
 * When enabled, data-testid attributes are rendered for E2E testing.
 *
 * Usage:
 * ```svelte
 * <div {...testId('my-component')}>
 * <div {...test('my-component', { 'node-id': '123' })}>
 * ```
 */

import { getContext } from 'svelte';
import { CRAFTER_CONTEXT, type CrafterContext } from '../components/ujl-crafter/context.js';

/**
 * Gets the current test mode from the Crafter context.
 * Returns false if called outside of a Crafter context (e.g., in unit tests).
 */
function getTestMode(): boolean {
	try {
		const context = getContext<CrafterContext | undefined>(CRAFTER_CONTEXT);
		return context?.testMode ?? false;
	} catch {
		// getContext throws if called outside of component initialization
		return false;
	}
}

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
	if (!getTestMode()) return {};
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
	if (!getTestMode()) return {};
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
	if (!getTestMode()) return {};

	return {
		'data-testid': id,
		...(attrs ? testAttrsInternal(attrs) : {})
	};
}

/**
 * Internal helper that doesn't check test mode (used by test() to avoid double-checking)
 */
function testAttrsInternal(
	attrs: Record<string, string | boolean | number>
): Record<string, string> {
	return Object.fromEntries(
		Object.entries(attrs).map(([key, value]) => [`data-${key}`, String(value)])
	);
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
