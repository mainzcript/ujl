import type { UJLTColorShades, UJLTShadeKey, UJLTOklch, UJLTColorSet } from '@ujl-framework/types';
import { colorShades } from '@ujl-framework/types';
import Color from 'colorjs.io';
import type { ColorShades } from './types.ts';

/**
 * Converts a UJLTOklch color to a Color object.
 *
 * @param ujltColor - UJLTOklch color object
 * @returns Color object
 */
export function toColor(ujltColor: UJLTOklch): Color {
	return new Color('oklch', [ujltColor.l, ujltColor.c, ujltColor.h]);
}

/**
 * Converts UJLTColorShades (OKLCH objects) to ColorShades (Color objects).
 *
 * @param ujltShades - Color shades in UJLT format (OKLCH objects)
 * @returns Color shades as Color objects
 */
export function toColorShades(ujltShades: UJLTColorShades): ColorShades {
	const result: ColorShades = {} as ColorShades;
	colorShades.forEach((shade: UJLTShadeKey) => {
		result[shade] = toColor(ujltShades[shade]);
	});
	return result;
}

/**
 * Converts a Color object to a UJLTOklch color object.
 * Normalizes and rounds values to ensure consistent, clean token values.
 *
 * @param color - Color object
 * @returns UJLTOklch color object with normalized and rounded values
 */
export function toUJLTOklch(color: Color): UJLTOklch {
	// Ensure the color is within the sRGB gamut before conversion
	const gamutMapped = color.toGamut();
	const [l, c, h] = gamutMapped.to('oklch').coords;

	// Round lightness (0-1) to 4 decimal places for precision
	const lRounded = Number(Math.max(0, Math.min(1, l)).toFixed(4));

	// Round chroma (>= 0) to 4 decimal places
	const cRounded = Number(Math.max(0, c).toFixed(4));

	// Normalize hue (0-360) and round to 3 decimal places
	// Achromatic colors (black, white, gray) have no hue - default to 0
	const safeHue = Number.isNaN(h) ? 0 : (h ?? 0);
	const normalizedHue = ((safeHue % 360) + 360) % 360;
	const hRounded = Number(normalizedHue.toFixed(3));

	return { l: lRounded, c: cRounded, h: hRounded };
}

/**
 * Converts ColorShades (Color objects) to UJLTColorShades (OKLCH objects).
 * Extracts OKLCH coordinates from Color objects.
 * Maps colors to sRGB gamut if they're out of bounds.
 *
 * @param shades - Color shades as Color objects
 * @returns Color shades in UJLT format (OKLCH objects)
 */
export function toUJLTColorShades(shades: ColorShades): UJLTColorShades {
	const ujltShades: UJLTColorShades = {} as UJLTColorShades;
	colorShades.forEach((shade: UJLTShadeKey) => {
		ujltShades[shade] = toUJLTOklch(shades[shade]);
	});
	return ujltShades;
}

/**
 * Converts a UJLTOklch color to a hex string.
 * Ensures the color is within the sRGB gamut before conversion.
 *
 * @param ujltColor - UJLTOklch color object
 * @returns Hex color string (e.g., "#3b82f6")
 */
export function oklchToHex(ujltColor: UJLTOklch): string {
	const color = toColor(ujltColor);
	const gamutMapped = color.toGamut();
	return gamutMapped.to('srgb').toString({ format: 'hex' });
}

/**
 * Formats an OKLCH color object as a CSS OKLCH string.
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
	// Achromatic colors (black, white, gray) have no hue - default to 0
	const h = Number.isNaN(oklch.h) ? 0 : oklch.h;
	const hFormatted = Math.max(0, Math.min(360, h)).toFixed(3);
	return `${lFormatted} ${cFormatted} ${hFormatted}`;
}

/**
 * Extracts the base hex color from a UJLTColorSet.
 * For standard flavors, uses _original.hex.
 * For ambient flavor, uses _original.lightHex as the base color.
 *
 * @param colorSet - The color set to extract from
 * @returns Hex color string (e.g., "#3b82f6")
 *
 * @example
 * ```ts
 * const hex = getBaseHexFromColorSet(colorSet);
 * // Result: "#3b82f6" for standard flavors, or lightHex for ambient
 * ```
 */
export function getBaseHexFromColorSet(colorSet: UJLTColorSet): string {
	return 'hex' in colorSet._original ? colorSet._original.hex : colorSet._original.lightHex;
}
