/**
 * Formats an OKLCH color object as a CSS OKLCH string.
 * @param oklch - OKLCH color object with l (0..1), c (>= 0), h (degrees)
 * @returns Formatted OKLCH string for CSS (e.g., "54.6% 0.245 262.881")
 */
export function formatOklch(oklch: { l: number; c: number; h: number }): string {
	const lPercent = oklch.l * 100;
	const lFormatted = Math.max(0, Math.min(100, lPercent)).toFixed(1) + '%';
	const cFormatted = Math.max(0, Math.min(100, oklch.c)).toFixed(3);
	// Handle NaN for achromatic colors (black, white, gray) - they have no hue
	const h = Number.isNaN(oklch.h) ? 0 : oklch.h;
	const hFormatted = Math.max(0, Math.min(360, h)).toFixed(3);
	return `${lFormatted} ${cFormatted} ${hFormatted}`;
}
