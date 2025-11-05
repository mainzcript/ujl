/**
 * Type definitions for UJL Theme JSON schema ('.ujlt.json').
 *
 * This schema describes the structure for design tokens and semantic flavors (e.g. primary, secondary, status colors)
 * for the UJL Framework. Used for theming, design system, and UI adaptation across all UJL adapters and render targets.
 */

/**
 * Complete UJLT theme wrapper object for a '.ujlt.json' file.
 * This root wrapper is used for API responses and file-based theme loading.
 */
export type UJLTDocument = {
	/**
	 * The root UJLT theme object containing all tokens and metadata.
	 */
	ujlt: UJLTObject;
};

/**
 * Root UJLT theme structure containing theme metadata and top-level tokens.
 */
export type UJLTObject = {
	/**
	 * Theme metadata: versioning, title, optional description, etc.
	 */
	meta: UJLTMeta;
	/**
	 * Main theme tokens (colors, radius, etc.) describing the design system.
	 */
	tokens: UJLTTokenSet;
};

/**
 * Theme metadata (recommended for every theme file for documentation/versioning)
 */
export type UJLTMeta = {
	/** Semantic version for the theme specification (required) */
	_version: string;
};

/**
 * Top-level token set describing all visual design system elements.
 */
export type UJLTTokenSet = {
	color: UJLTColorPalette;
	/** CSS border-radius value, maps to --radius */
	radius: string;
};

/**
 * Complete color palette for a theme (backgrounds, text, accents, notifications).
 */
export type UJLTColorPalette = Record<UJLTFlavor, UJLTColorSet>;

/**
 * Flavor-specific OKLCH color set (primary, secondary, accent), with background/foreground and dark/light mode.
 */
export type UJLTColorSet = {
	/** Light mode background color */
	light: UJLTOklch;
	/** Light mode foreground color */
	lightForeground: UJLTOklch;
	/** Dark mode background color */
	dark: UJLTOklch;
	/** Dark mode foreground color */
	darkForeground: UJLTOklch;
	/** Color shades from 50 to 950. */
	shades: UJLTColorShades;
};

/**
 * Color shades from 50 to 950.
 */
export type UJLTColorShades = {
	50: UJLTOklch;
	100: UJLTOklch;
	200: UJLTOklch;
	300: UJLTOklch;
	400: UJLTOklch;
	500: UJLTOklch;
	600: UJLTOklch;
	700: UJLTOklch;
	800: UJLTOklch;
	900: UJLTOklch;
	950: UJLTOklch;
};

/**
 * OKLCH triplet (lightness/chroma/hue)
 * l: 0..1, c >= 0, h: degrees
 */
export type UJLTOklch = {
	l: number;
	c: number;
	h: number;
};

/**
 * List of supported theme flavor keys
 */
export const themeFlavors = ["primary", "secondary", "accent"] as const;
export type UJLTThemeFlavor = (typeof themeFlavors)[number];

/**
 * Supported notification flavor keys
 */
export const notificationFlavors = ["success", "warning", "destructive", "info"] as const;
export type UJLTNotificationFlavor = (typeof notificationFlavors)[number];

/**
 * All supported flavor keys
 */
export const flavors = ["ambient", ...themeFlavors, ...notificationFlavors] as const;
export type UJLTFlavor = (typeof flavors)[number];
