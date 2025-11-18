import Color from 'colorjs.io';
// @ts-expect-error - apca-w3 doesn't have TypeScript definitions
import { APCAcontrast, sRGBtoY } from 'apca-w3';
import type { UJLTOklch } from '@ujl-framework/types';
import { hexToOklch, distanceOKLab, type OKLab } from './colorSpaces.js';

// ============================================
// CONSTANTS
// ============================================

/**
 * Minimum APCA contrast threshold for text colors on light/dark backgrounds.
 * APCA contrast values are typically in the range -108 to +108.
 * A threshold of 60 ensures good readability.
 */
const TEXT_CONTRAST_THRESHOLD = 60;

// Shade constants for contrast calculations
const LIGHT_SHADE = 50;
const MID_SHADE = 500;
const DARK_SHADE = 950;

// ============================================
// APCA CONTRAST CALCULATION
// ============================================

/**
 * Converts a hex color to an RGB array [r, g, b] for APCA calculations.
 * APCA expects RGB values in the 0-255 range.
 *
 * @param hex - Hex color string
 * @returns RGB array with values 0-255
 */
function hexToRgbArray(hex: string): [number, number, number] {
	const color = new Color(hex);
	const rgb = color.to('srgb').coords;
	return [Math.round(rgb[0] * 255), Math.round(rgb[1] * 255), Math.round(rgb[2] * 255)];
}

/**
 * Calculates APCA (Advanced Perceptual Contrast Algorithm) contrast between foreground and background colors.
 * APCA is a modern contrast algorithm that better matches human perception than WCAG.
 *
 * @param foreground - Foreground color in hex format
 * @param background - Background color in hex format
 * @returns APCA contrast value:
 *   - Positive values = dark text on light background
 *   - Negative values = light text on dark background
 *   - Absolute value indicates contrast strength (typically -108 to +108)
 *
 * @example
 * ```ts
 * calculateAPCAContrast("#000000", "#ffffff"); // ~106 (high contrast)
 * calculateAPCAContrast("#888888", "#ffffff"); // ~45 (medium contrast)
 * ```
 */
function calculateAPCAContrast(foreground: string, background: string): number {
	// APCA expects RGB arrays (0-255), not hex strings
	const fgRgb = hexToRgbArray(foreground);
	const bgRgb = hexToRgbArray(background);

	// Convert RGB to luminance (Y) values
	const fgY = sRGBtoY(fgRgb);
	const bgY = sRGBtoY(bgRgb);

	// Calculate APCA contrast
	return APCAcontrast(fgY, bgY);
}

/**
 * Determines the best foreground color from an array of candidates based on APCA contrast.
 * Returns the color with the strongest absolute contrast value.
 *
 * @param backgroundHex - Background color in hex format
 * @param candidateColors - Array of foreground color candidates in hex format
 * @returns The hex color with the strongest APCA contrast (absolute value)
 *
 * @example
 * ```ts
 * determineBestForegroundColor("#888888", ["#000000", "#ffffff"]);
 * // Returns whichever has higher contrast
 * ```
 */
function determineBestForegroundColor(backgroundHex: string, candidateColors: string[]): string {
	if (candidateColors.length === 0) return '#000000';

	return candidateColors.reduce((best, candidate) => {
		const candidateContrast = Math.abs(calculateAPCAContrast(candidate, backgroundHex));
		const bestContrast = Math.abs(calculateAPCAContrast(best, backgroundHex));
		return candidateContrast > bestContrast ? candidate : best;
	});
}

/**
 * Finds the best shade that meets contrast requirements while favoring the favorite shade.
 * Searches through shades, prioritizing the favorite shade, then nearby shades by OKLab distance.
 *
 * @param shades - Record of shades to search through (shade number -> color data)
 * @param favoriteShade - The preferred shade (closest to input color)
 * @param contrastColor - The color to contrast against (typically "#ffffff" or "#000000")
 * @param mode - "fg" means shade is foreground, "bg" means shade is background
 * @param threshold - Minimum APCA contrast threshold (absolute value), defaults to TEXT_CONTRAST_THRESHOLD
 * @returns The shade number that meets requirements, or null if none found
 */
export function findBestContrastShade(
	shades: Record<number, { hex: string; oklch: UJLTOklch }>,
	favoriteShade: number,
	contrastColor: string,
	mode: 'bg' | 'fg',
	threshold: number = TEXT_CONTRAST_THRESHOLD
): number | null {
	if (Object.keys(shades).length === 0) {
		return null;
	}

	const favoriteShadeColor = shades[favoriteShade];
	if (!favoriteShadeColor) {
		// Fallback to shade 500 if favorite not found
		const fallbackShade = shades[MID_SHADE]
			? MID_SHADE
			: Number.parseInt(Object.keys(shades)[0], 10);
		return findBestContrastShade(shades, fallbackShade, contrastColor, mode, threshold);
	}

	// Calculate contrast for favorite shade first
	const favoriteForeground = mode === 'fg' ? favoriteShadeColor.hex : contrastColor;
	const favoriteBackground = mode === 'fg' ? contrastColor : favoriteShadeColor.hex;
	const favoriteContrast = Math.abs(calculateAPCAContrast(favoriteForeground, favoriteBackground));

	if (favoriteContrast >= threshold) {
		return favoriteShade;
	}

	// Get favorite shade OKLCH for distance calculation
	const favoriteOklch = favoriteShadeColor.oklch;
	const favoriteLab = new Color('oklch', [favoriteOklch.l, favoriteOklch.c, favoriteOklch.h]).to(
		'oklab'
	).coords;
	const favoriteOklab: OKLab = { L: favoriteLab[0], a: favoriteLab[1], b: favoriteLab[2] };

	// Sort all shades by OKLab distance from favorite
	const shadeEntries = Object.entries(shades).map(([shadeStr, color]) => {
		const shade = Number.parseInt(shadeStr, 10);
		const lab = new Color('oklch', [color.oklch.l, color.oklch.c, color.oklch.h]).to(
			'oklab'
		).coords;
		const oklab: OKLab = { L: lab[0], a: lab[1], b: lab[2] };
		const distance = distanceOKLab(favoriteOklab, oklab);

		const foreground = mode === 'fg' ? color.hex : contrastColor;
		const background = mode === 'fg' ? contrastColor : color.hex;
		const contrast = Math.abs(calculateAPCAContrast(foreground, background));

		return { shade, distance, contrast, color };
	});

	// Sort by distance (closest first)
	shadeEntries.sort((a, b) => a.distance - b.distance);

	// Find first shade that meets threshold
	for (const entry of shadeEntries) {
		if (entry.contrast >= threshold) {
			return entry.shade;
		}
	}

	// Fallback: return shade with highest contrast
	shadeEntries.sort((a, b) => b.contrast - a.contrast);

	return shadeEntries[0]?.shade ?? null;
}

/**
 * Gets a text color with fallback to a default shade.
 * Used when a specific shade is not available or doesn't meet contrast requirements.
 *
 * @param shade - The desired shade number, or null if not found
 * @param shades - Record of available shades
 * @param fallbackShade - The fallback shade to use (e.g., DARK_SHADE or LIGHT_SHADE)
 * @returns Color data for the text color
 */
export function getTextColorWithFallback(
	shade: number | null,
	shades: Record<number, { hex: string; oklch: UJLTOklch }>,
	fallbackShade: number
): { hex: string; oklch: UJLTOklch } {
	if (shade !== null && shades[shade]) {
		return shades[shade];
	}
	const fallback = shades[fallbackShade];
	if (fallback) return fallback;
	const shadeValues = Object.values(shades);
	return shadeValues[fallbackShade === DARK_SHADE ? shadeValues.length - 1 : 0];
}

/**
 * Adds light and dark colors to a palette based on APCA contrast validation.
 * Determines the best shades for light/dark backgrounds and foregrounds, ensuring
 * sufficient contrast for readability.
 *
 * @param shades - The shades record to search through
 * @param favoriteShade - The preferred shade (closest to input color)
 * @returns Object with light, dark, lightFg, darkFg, lightText, and darkText color information
 */
export function addLightDarkColorsWithAPCA(
	shades: Record<number, { hex: string; oklch: UJLTOklch }>,
	favoriteShade: number
): {
	light: { hex: string; oklch: UJLTOklch; shade: number };
	dark: { hex: string; oklch: UJLTOklch; shade: number };
	lightFg: { hex: string; oklch: UJLTOklch };
	darkFg: { hex: string; oklch: UJLTOklch };
	lightText: { hex: string; oklch: UJLTOklch };
	darkText: { hex: string; oklch: UJLTOklch };
} {
	const lightShade = findBestContrastShade(shades, favoriteShade, '#ffffff', 'fg', 5);
	const darkShade = findBestContrastShade(shades, favoriteShade, '#000000', 'fg', 5);

	// Get light and dark color data with fallbacks
	const lightColor =
		lightShade !== null && shades[lightShade]
			? shades[lightShade]
			: (shades[LIGHT_SHADE] ?? Object.values(shades)[0]);
	const darkColor =
		darkShade !== null && shades[darkShade]
			? shades[darkShade]
			: (shades[DARK_SHADE] ?? Object.values(shades)[Object.values(shades).length - 1]);

	// Determine best foreground colors (black or white)
	const foregroundCandidates = ['#000000', '#ffffff'];
	const lightFgHex = determineBestForegroundColor(lightColor.hex, foregroundCandidates);
	const darkFgHex = determineBestForegroundColor(darkColor.hex, foregroundCandidates);

	// Find text colors with minimum APCA contrast threshold
	const lightTextShade = findBestContrastShade(
		shades,
		favoriteShade,
		'#ffffff',
		'fg',
		TEXT_CONTRAST_THRESHOLD
	);
	const darkTextShade = findBestContrastShade(
		shades,
		favoriteShade,
		'#000000',
		'fg',
		TEXT_CONTRAST_THRESHOLD
	);

	const lightTextColor = getTextColorWithFallback(lightTextShade, shades, DARK_SHADE);
	const darkTextColor = getTextColorWithFallback(darkTextShade, shades, LIGHT_SHADE);

	return {
		light: {
			hex: lightColor.hex,
			oklch: lightColor.oklch,
			shade: lightShade ?? LIGHT_SHADE
		},
		dark: {
			hex: darkColor.hex,
			oklch: darkColor.oklch,
			shade: darkShade ?? DARK_SHADE
		},
		lightFg: {
			hex: lightFgHex,
			oklch: hexToOklch(lightFgHex)
		},
		darkFg: {
			hex: darkFgHex,
			oklch: hexToOklch(darkFgHex)
		},
		lightText: {
			hex: lightTextColor.hex,
			oklch: lightTextColor.oklch
		},
		darkText: {
			hex: darkTextColor.hex,
			oklch: darkTextColor.oklch
		}
	};
}
