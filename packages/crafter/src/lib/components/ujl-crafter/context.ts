/**
 * Context API for Crafter
 *
 * Design Decision: Context IS Store
 *
 * Why no separate interface?
 * - YAGNI: Store interface is already perfect for Context
 * - DRY: No duplication of type definitions
 * - KISS: Simplest possible solution
 * - Testability: Store can be tested directly
 *
 * @module context
 */

import type { CrafterStore } from '$lib/stores/index.js';

// ============================================
// CONTEXT TYPE
// ============================================

/**
 * Context type is identical to Store type.
 * This ensures consistency and avoids type duplication.
 */
export type CrafterContext = CrafterStore;

// ============================================
// CONTEXT KEY
// ============================================

/**
 * Symbol for type-safe context access.
 * Using Symbol.for() allows the same symbol to be retrieved across modules.
 */
export const CRAFTER_CONTEXT = Symbol.for('ujl:crafter-context');

/**
 * Symbol for Composer context.
 * The Composer is part of the CrafterContext, but this symbol
 * can be used for direct Composer access if needed.
 */
export const COMPOSER_CONTEXT = Symbol.for('ujl:composer-context');

/**
 * Symbol for Shadow Root context access.
 * Used to provide the Shadow Root reference to child components
 * for scoped DOM queries within the Shadow DOM.
 */
export const SHADOW_ROOT_CONTEXT = Symbol.for('ujl:shadow-root-context');

/**
 * Context type for Shadow Root access.
 * Uses a getter to satisfy Svelte 5's reactivity warnings.
 */
export type ShadowRootContext = { readonly value: ShadowRoot | undefined };

// ============================================
// TYPE GUARDS
// ============================================

/**
 * Type guard for runtime context validation.
 * Useful for debugging and ensuring context is properly provided.
 *
 * @param value - Value to check
 * @returns true if value is a valid CrafterContext
 *
 * @example
 * ```ts
 * const maybeContext = getContext(CRAFTER_CONTEXT);
 * if (!isCrafterContext(maybeContext)) {
 *   throw new Error('CrafterContext not found. Is this component inside <UJLCrafter>?');
 * }
 * ```
 */
export function isCrafterContext(value: unknown): value is CrafterContext {
	return (
		typeof value === 'object' &&
		value !== null &&
		'mode' in value &&
		'selectedNodeId' in value &&
		'operations' in value &&
		'rootSlot' in value &&
		'testMode' in value &&
		'setSelectedNodeId' in value &&
		typeof (value as CrafterContext).setSelectedNodeId === 'function'
	);
}

/**
 * Helper function to get CrafterContext with runtime validation.
 * Throws an error if context is not found or invalid.
 *
 * @param getContextFn - Svelte's getContext function
 * @returns The CrafterContext
 * @throws Error if context is not found or invalid
 *
 * @example
 * ```ts
 * import { getContext } from 'svelte';
 * const crafter = getCrafterContext(getContext);
 * ```
 */
export function getCrafterContext(getContextFn: <T>(key: symbol) => T | undefined): CrafterContext {
	const context = getContextFn<CrafterContext>(CRAFTER_CONTEXT);

	if (!context) {
		throw new Error(
			'CrafterContext not found. Make sure this component is used inside <UJLCrafter>.'
		);
	}

	if (!isCrafterContext(context)) {
		throw new Error('Invalid CrafterContext. The context object does not match expected shape.');
	}

	return context;
}

// ============================================
// RE-EXPORTS FOR CONVENIENCE
// ============================================

// Re-export types that components might need
export type {
	CrafterMode,
	ViewportSize,
	MediaLibraryContext
} from '$lib/stores/crafter-store.svelte.js';

export type { CrafterOperations } from '$lib/stores/operations.js';
