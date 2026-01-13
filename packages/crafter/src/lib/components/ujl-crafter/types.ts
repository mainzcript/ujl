/**
 * Shared type definitions for the Crafter modules.
 */

/**
 * Crafter mode identifier.
 * 'editor' corresponds to the content editor (UJLC) view.
 * 'designer' corresponds to the theme designer (UJLT) view.
 */
export type CrafterMode = 'editor' | 'designer';

/**
 * Viewport size for preview simulation.
 * null = full width (responsive)
 * 1024 = desktop viewport
 * 768 = tablet viewport
 * 375 = mobile viewport
 */
export type ViewportSize = 1024 | 768 | 375 | null;
