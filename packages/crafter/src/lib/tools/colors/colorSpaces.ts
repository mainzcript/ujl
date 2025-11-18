import Color from 'colorjs.io';
import type { UJLTOklch } from '@ujl-framework/types';

// ============================================
// TYPE DEFINITIONS
// ============================================

/**
 * OKLab color space coordinates.
 * OKLab is a perceptually uniform color space where distances correspond to perceived color differences.
 */
export type OKLab = {
	L: number; // Lightness (0-1)
	a: number; // Green-red axis
	b: number; // Blue-yellow axis
};

// ============================================
// COLOR CONVERSION
// ============================================

/**
 * Converts a HEX color string to OKLCH color space.
 *
 * @param hex - Hex color string (e.g., "#ff0000" or "ff0000")
 * @returns OKLCH color object with l (lightness 0-1), c (chroma >= 0), h (hue in degrees 0-360)
 * @throws {Error} If the hex string is invalid
 *
 * @example
 * ```ts
 * const oklch = hexToOklch("#ff0000");
 * // { l: 0.627, c: 0.258, h: 29.234 }
 * ```
 */
export function hexToOklch(hex: string): UJLTOklch {
	const color = new Color(hex);
	const [l, c, h] = color.to('oklch').coords;
	// Handle NaN for achromatic colors (black, white, gray) - they have no hue
	return { l, c, h: Number.isNaN(h) ? 0 : (h ?? 0) };
}

/**
 * Converts an OKLCH color to a HEX color string.
 * The color is automatically mapped to the sRGB gamut if it's out of bounds.
 *
 * @param oklch - OKLCH color object with l (0-1), c (>= 0), h (degrees)
 * @returns Hex color string (e.g., "#ff0000")
 *
 * @example
 * ```ts
 * const hex = oklchToHex({ l: 0.627, c: 0.258, h: 29.234 });
 * // "#ff0000"
 * ```
 */
export function oklchToHex(oklch: UJLTOklch): string {
	const color = new Color('oklch', [oklch.l, oklch.c, oklch.h]).toGamut();
	return color.to('srgb').toString({ format: 'hex' });
}

// ============================================
// DISTANCE CALCULATION
// ============================================

/**
 * Calculates euclidean distance between two colors in OKLab space.
 * OKLab axes are linear and in similar magnitude, so no weighting is needed.
 * This distance corresponds to perceived color difference.
 *
 * @param a - First OKLab color
 * @param b - Second OKLab color
 * @returns Euclidean distance (lower = more similar)
 */
export function distanceOKLab(a: OKLab, b: OKLab): number {
	const dL = a.L - b.L;
	const da = a.a - b.a;
	const db = a.b - b.b;
	return Math.sqrt(dL * dL + da * da + db * db);
}

/**
 * Calculates circular distance between two hue values (0-360 degrees).
 * Accounts for the circular nature of hue (e.g., 0° and 360° are the same).
 *
 * @param a - First hue in degrees (0-360)
 * @param b - Second hue in degrees (0-360)
 * @returns Circular distance in degrees (0-180)
 *
 * @example
 * ```ts
 * hueDistance(10, 350); // 20 (not 340)
 * ```
 */
export function hueDistance(a: number, b: number): number {
	const diff = Math.abs(a - b);
	return Math.min(diff, 360 - diff);
}
