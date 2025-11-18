import type { UJLTOklch } from '@ujl-framework/types';

/**
 * Formats an OKLCH color object as a CSS OKLCH string.
 *
 * The returned string is formatted for use in CSS `oklch()` functions.
 * Values are clamped to valid ranges and formatted with appropriate precision.
 *
 * @param oklch - OKLCH color object with l (lightness 0-1), c (chroma >= 0), h (hue in degrees 0-360)
 * @returns Formatted OKLCH string for CSS, e.g., "54.6% 0.245 262.881"
 *
 * @example
 * ```ts
 * const css = formatOklch({ l: 0.546, c: 0.245, h: 262.881 });
 * // Returns: "54.6% 0.245 262.881"
 * // Can be used in CSS: `background-color: oklch(54.6% 0.245 262.881);`
 * ```
 */
export function formatOklch(oklch: UJLTOklch): string {
	const lPercent = oklch.l * 100;
	const lFormatted = Math.max(0, Math.min(100, lPercent)).toFixed(1) + '%';
	const cFormatted = Math.max(0, Math.min(100, oklch.c)).toFixed(3);
	// Handle NaN for achromatic colors (black, white, gray) - they have no hue
	const h = Number.isNaN(oklch.h) ? 0 : oklch.h;
	const hFormatted = Math.max(0, Math.min(360, h)).toFixed(3);
	return `${lFormatted} ${cFormatted} ${hFormatted}`;
}
