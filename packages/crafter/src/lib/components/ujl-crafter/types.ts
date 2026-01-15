/**
 * Shared type definitions for the Crafter modules.
 *
 * Note: Most types are now defined in the store module.
 * This file re-exports them for convenience and adds UI-specific types.
 *
 * @module types
 */

// Re-export store types for backward compatibility
export type { CrafterMode, ViewportSize, MediaLibraryContext } from '$lib/stores/index.js';
