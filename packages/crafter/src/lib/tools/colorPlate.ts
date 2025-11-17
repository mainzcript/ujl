import Color from 'colorjs.io';
// @ts-expect-error - apca-w3 doesn't have TypeScript definitions
import { APCAcontrast, sRGBtoY } from 'apca-w3';
import { tailwindColorPlate } from './tailwindColorPlate.js';
import type { UJLTOklch } from '@ujl-framework/types';

// ============================================
// TYPE DEFINITIONS
// ============================================

export type OKLab = {
	L: number;
	a: number;
	b: number;
};

/**
 * A reference color from the Tailwind palette with precomputed color space values
 * Used as a basis for generating custom color palettes
 */
export type ReferenceColor = {
	name: string; // Color family name, e.g. "sky"
	shade: number; // Shade value: 50, 100, 200, ..., 950
	hex: string;
	oklab: OKLab;
	oklch: UJLTOklch;
};

export type GeneratedPalette = {
	baseHex: string;
	baseOklch: UJLTOklch;
	shades: Record<number, { hex: string; oklch: UJLTOklch }>;
	light: { hex: string; oklch: UJLTOklch; shade: number };
	dark: { hex: string; oklch: UJLTOklch; shade: number };
	lightFg: { hex: string; oklch: UJLTOklch };
	darkFg: { hex: string; oklch: UJLTOklch };
	lightText: { hex: string; oklch: UJLTOklch };
	darkText: { hex: string; oklch: UJLTOklch };
};

// ============================================
// REFERENCE COLOR PALETTE
// ============================================

const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

// Shade constants for ambient palette interpolation
const LIGHT_SHADE = 50;
const MID_SHADE = 500;
const DARK_SHADE = 950;
const SHADE_RANGE_TO_MID = MID_SHADE - LIGHT_SHADE; // 450
const SHADE_RANGE_FROM_MID = DARK_SHADE - MID_SHADE; // 450
const LIGHT_DARK_MIX_FACTOR = 0.5; // For 50/50 mix of light and dark

// Blending constant
const BLEND_RADIUS = 5; // Number of shade steps left/right for palette blending and smoothing

// APCA contrast threshold for text colors
const TEXT_CONTRAST_THRESHOLD = 60; // Minimum APCA contrast for text colors on light/dark backgrounds

/**
 * Precomputes all reference colors from the Tailwind palette with OKLab and OKLCH values
 * This is done once at module load for performance
 */
function precomputeReferenceColors(): ReferenceColor[] {
	const colors: ReferenceColor[] = [];

	for (const [colorName, shades] of Object.entries(tailwindColorPlate)) {
		for (const [shadeStr, oklch] of Object.entries(shades)) {
			const shade = Number.parseInt(shadeStr, 10);
			// Convert OKLCH to Color object to get hex and OKLab
			const color = new Color('oklch', [oklch.l, oklch.c, oklch.h]);
			const hex = color.to('srgb').toString({ format: 'hex' });
			const [L, a, b] = color.to('oklab').coords;

			colors.push({
				name: colorName,
				shade,
				hex,
				oklab: { L, a, b },
				oklch: { l: oklch.l, c: oklch.c, h: oklch.h }
			});
		}
	}

	return colors;
}

const REFERENCE_COLORS: ReferenceColor[] = precomputeReferenceColors();

// ============================================
// COLOR CONVERSION
// ============================================

/**
 * Converts HEX color to OKLCH
 */
export function hexToOklch(hex: string): UJLTOklch {
	const color = new Color(hex);
	const [l, c, h] = color.to('oklch').coords;
	return { l, c, h: h ?? 0 };
}

// ============================================
// APCA CONTRAST CALCULATION
// ============================================

/**
 * Converts hex color to RGB array [r, g, b] for APCA (0-255 range)
 */
function hexToRgbArray(hex: string): [number, number, number] {
	const color = new Color(hex);
	const rgb = color.to('srgb').coords;
	return [Math.round(rgb[0] * 255), Math.round(rgb[1] * 255), Math.round(rgb[2] * 255)];
}

/**
 * Calculates APCA contrast between foreground and background colors
 * @param foreground - Foreground color in hex format
 * @param background - Background color in hex format
 * @returns APCA contrast value (positive = dark-on-light, negative = light-on-dark)
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
 * Determines the best foreground color from an array of candidates based on APCA contrast
 * @param backgroundHex - Background color in hex format
 * @param candidateColors - Array of foreground color candidates in hex format
 * @returns The hex color with the strongest APCA contrast (absolute value)
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
 * Finds the best shade that meets contrast requirements while favoring the favorite shade
 * @param shades - Record of shades to search through
 * @param favoriteShade - The preferred shade (closest to input color)
 * @param contrastColor - The color to contrast against (white or black)
 * @param mode - "fg" means shade is foreground, "bg" means shade is background
 * @param threshold - Minimum APCA contrast threshold (absolute value)
 * @returns The shade number that meets requirements, or null if none found
 */
function findBestContrastShade(
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

// ============================================
// DISTANCE CALCULATION
// ============================================

/**
 * Calculates euclidean distance in OKLab space
 * OKLab axes are linear and in similar magnitude, so no weighting needed
 */
function distanceOKLab(a: OKLab, b: OKLab): number {
	const dL = a.L - b.L;
	const da = a.a - b.a;
	const db = a.b - b.b;
	return Math.sqrt(dL * dL + da * da + db * db);
}

/**
 * Calculates circular distance between two hues (0-360)
 */
function hueDistance(a: number, b: number): number {
	const diff = Math.abs(a - b);
	return Math.min(diff, 360 - diff);
}

// ============================================
// COLOR MATCHING
// ============================================

/**
 * Finds the closest reference color to the input using OKLab distance
 */
function findClosestReferenceColor(inputHex: string): {
	color: ReferenceColor;
	distance: number;
} {
	const inputColor = new Color(inputHex);
	const [inputL, inputA, inputB] = inputColor.to('oklab').coords;
	const inputOklab: OKLab = { L: inputL, a: inputA, b: inputB };

	// Pre-filter by similar lightness for performance
	const candidates = REFERENCE_COLORS.filter((c) => Math.abs(c.oklab.L - inputOklab.L) < 0.25);
	const searchSpace = candidates.length > 0 ? candidates : REFERENCE_COLORS;

	let closest: ReferenceColor = searchSpace[0];
	let minDistance = distanceOKLab(inputOklab, closest.oklab);

	for (let i = 1; i < searchSpace.length; i++) {
		const color = searchSpace[i];
		const distance = distanceOKLab(inputOklab, color.oklab);
		if (distance < minDistance) {
			minDistance = distance;
			closest = color;
		}
	}

	return { color: closest, distance: minDistance };
}

/**
 * Finds a second reference color at the same shade level for interpolation
 * Returns the color that forms a hue pair with the first color around the input hue
 */
function findSecondColorAtSameShade(
	inputOklch: UJLTOklch,
	firstColor: ReferenceColor
): ReferenceColor | null {
	// Get all reference colors at the same shade
	const candidates = REFERENCE_COLORS.filter((c) => c.shade === firstColor.shade);

	if (candidates.length < 2) {
		return null;
	}

	// Sort by hue
	const sorted = candidates.slice().sort((a, b) => a.oklch.h - b.oklch.h);

	// Find the neighbor pair where inputHue falls between them
	let bestPair: { a: ReferenceColor; b: ReferenceColor } | null = null;
	let minSumDistance = Infinity;

	for (let i = 0; i < sorted.length; i++) {
		const a = sorted[i];
		const b = sorted[(i + 1) % sorted.length];

		// Check if firstColor is part of this pair
		if (a.name !== firstColor.name && b.name !== firstColor.name) {
			continue;
		}

		// Calculate if inputHue is between a and b on the shorter path
		const distA = hueDistance(inputOklch.h, a.oklch.h);
		const distB = hueDistance(inputOklch.h, b.oklch.h);
		const distAB = hueDistance(a.oklch.h, b.oklch.h);

		// Check if inputHue is between a and b
		if (distA + distB <= distAB + 0.1) {
			// Small tolerance for floating point
			const sumDistance = distA + distB;
			if (sumDistance < minSumDistance) {
				minSumDistance = sumDistance;
				bestPair = { a, b };
			}
		}
	}

	if (!bestPair) {
		return null;
	}

	// Return the one that's not firstColor
	return bestPair.a.name === firstColor.name ? bestPair.b : bestPair.a;
}

// ============================================
// INTERPOLATION
// ============================================

/**
 * Interpolates two reference color palettes in OKLab space
 * Creates a smooth transition between two color families
 */
function interpolateReferencePalettes(
	primaryColorName: string,
	secondaryColorName: string,
	factor: number
): Record<number, { hex: string; oklch: UJLTOklch }> {
	const result: Record<number, { hex: string; oklch: UJLTOklch }> = {};

	for (const shade of SHADES) {
		const primaryColor = REFERENCE_COLORS.find(
			(c) => c.name === primaryColorName && c.shade === shade
		);
		const secondaryColor = REFERENCE_COLORS.find(
			(c) => c.name === secondaryColorName && c.shade === shade
		);

		if (!primaryColor || !secondaryColor) {
			continue;
		}

		const mixed = Color.mix(primaryColor.hex, secondaryColor.hex, factor, { space: 'oklab' });

		// Map to sRGB gamut and convert to sRGB
		const srgb = mixed.to('srgb').toGamut();

		const [l, c, h] = srgb.to('oklch').coords;
		const hex = srgb.toString({ format: 'hex' });

		result[shade] = {
			hex,
			oklch: { l, c, h: h ?? 0 }
		};
	}

	return result;
}

/**
 * Calculates interpolation factor based on hue position
 */
function calculateInterpolationFactor(inputHue: number, hue1: number, hue2: number): number {
	// Normalize hues to 0-360
	const h1 = ((hue1 % 360) + 360) % 360;
	const h2 = ((hue2 % 360) + 360) % 360;
	const input = ((inputHue % 360) + 360) % 360;

	// Find shorter path between h1 and h2
	const dist1 = hueDistance(input, h1);
	const dist2 = hueDistance(input, h2);
	const dist12 = hueDistance(h1, h2);

	// If input is between h1 and h2
	if (dist1 + dist2 <= dist12 + 0.1) {
		// Linear interpolation based on distances
		return dist1 / (dist1 + dist2);
	}

	// If input is closer to h1
	if (dist1 < dist2) {
		return 0;
	}

	// If input is closer to h2
	return 1;
}

// ============================================
// PALETTE REFINEMENT
// ============================================

/**
 * Finds the closest shade where the input color should be anchored
 */
function findClosestShade(palette: Record<number, { oklch: UJLTOklch }>, input: UJLTOklch): number {
	let bestShade = MID_SHADE;
	let bestDist = Infinity;
	const inputLab = new Color('oklch', [input.l, input.c, input.h]).to('oklab').coords;
	const inputOklab: OKLab = { L: inputLab[0], a: inputLab[1], b: inputLab[2] };

	for (const shade of SHADES) {
		const p = palette[shade];
		if (!p) continue;

		const lab = new Color('oklch', [p.oklch.l, p.oklch.c, p.oklch.h]).to('oklab').coords;
		const paletteOklab: OKLab = { L: lab[0], a: lab[1], b: lab[2] };
		const d = distanceOKLab(inputOklab, paletteOklab);

		if (d < bestDist) {
			bestDist = d;
			bestShade = shade;
		}
	}

	return bestShade;
}

/**
 * Builds a pure hue palette with constant hue = input.h
 * Smoothly transitions L & C values towards input around anchor shade
 * This prevents hard edges when blending with the base palette
 */
function buildPureHuePalette(
	basePalette: Record<number, { oklch: UJLTOklch }>,
	input: UJLTOklch,
	anchorShade: number,
	radius = BLEND_RADIUS
): Record<number, { oklch: UJLTOklch; hex: string }> {
	const pureHuePalette: Record<number, { oklch: UJLTOklch; hex: string }> = {};
	const anchorIndex = SHADES.indexOf(anchorShade as (typeof SHADES)[number]);

	for (let i = 0; i < SHADES.length; i++) {
		const shade = SHADES[i];
		const base = basePalette[shade];
		if (!base) continue;

		const dist = Math.abs(i - anchorIndex);
		const w = Math.max(0, 1 - dist / radius);

		const l = base.oklch.l * (1 - w) + input.l * w;
		const c = base.oklch.c * (1 - w) + input.c * w;
		const h = input.h;

		const oklch: UJLTOklch = { l, c, h };

		const color = new Color('oklch', [oklch.l, oklch.c, oklch.h]).toGamut();
		const hex = color.to('srgb').toString({ format: 'hex' });

		pureHuePalette[shade] = { oklch, hex };
	}

	return pureHuePalette;
}

/**
 * Cosine ease function for smooth blending transitions
 * Returns 1 at dist=0, 0 at dist>=radius, smooth C¹-continuous curve
 */
function ease(dist: number, radius: number): number {
	if (dist >= radius) return 0;
	const x = dist / radius; // 0..1
	// Cosine curve: 1 at dist=0, 0 at dist=radius
	return 0.5 * (1 + Math.cos(Math.PI * x));
}

/**
 * Blends two palettes smoothly in OKLab space
 * @param basePalette - The base palette to blend from
 * @param pureHuePalette - The pure hue palette to blend towards
 * @param anchorShade - The shade index where blending is strongest (100% pureHuePalette)
 * @param radius - How many steps left/right the fade-out reaches
 * @returns A blended palette with smooth transitions
 */
function blendPalettes(
	basePalette: Record<number, { oklch: UJLTOklch; hex: string }>,
	pureHuePalette: Record<number, { oklch: UJLTOklch; hex: string }>,
	anchorShade: number,
	radius = BLEND_RADIUS
): Record<number, { oklch: UJLTOklch; hex: string }> {
	const blended: Record<number, { oklch: UJLTOklch; hex: string }> = {};
	const anchorIndex = SHADES.indexOf(anchorShade as (typeof SHADES)[number]);

	for (let i = 0; i < SHADES.length; i++) {
		const shade = SHADES[i];
		const baseEntry = basePalette[shade];
		const pureHueEntry = pureHuePalette[shade];

		// Skip if either palette doesn't have this shade
		if (!baseEntry || !pureHueEntry) {
			continue;
		}

		const baseColor = new Color(baseEntry.hex);
		const pureHueColor = new Color(pureHueEntry.hex);
		const dist = Math.abs(i - anchorIndex);
		const blendFactor = ease(dist, radius);

		const mixed = Color.mix(baseColor, pureHueColor, blendFactor, { space: 'oklab' }).toGamut();
		const [l, c, h] = mixed.to('oklch').coords;

		blended[shade] = {
			oklch: { l, c, h: h ?? 0 },
			hex: mixed.to('srgb').toString({ format: 'hex' })
		};
	}

	return blended;
}

/**
 * Refines a palette by anchoring the input color and blending with a pure hue palette
 * This ensures the exact input color appears at the correct shade while maintaining
 * smooth transitions and Tailwind-like harmony
 */
export function refinePaletteWithInputColor(
	basePalette: Record<number, { hex: string; oklch: UJLTOklch }>,
	input: UJLTOklch
): Record<number, { hex: string; oklch: UJLTOklch }> {
	const anchorShade = findClosestShade(basePalette, input);
	const pureHuePalette = buildPureHuePalette(basePalette, input, anchorShade);
	const refinedPalette = blendPalettes(basePalette, pureHuePalette, anchorShade);

	// Explicitly set exact input color at anchor shade
	const exactColor = new Color('oklch', [input.l, input.c, input.h]).toGamut();
	refinedPalette[anchorShade] = {
		oklch: input,
		hex: exactColor.to('srgb').toString({ format: 'hex' })
	};

	return refinedPalette;
}

// ============================================
// PALETTE ENRICHMENT (Light/Dark Colors)
// ============================================

/**
 * Gets a text color with fallback to a default shade
 */
function getTextColorWithFallback(
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
 * Adds light and dark colors to a palette based on APCA contrast validation
 * @param shades - The shades record to search through
 * @param favoriteShade - The preferred shade (closest to input color)
 * @returns Object with light, dark, lightFg, darkFg, lightText, and darkText color information
 */
function addLightDarkColorsWithAPCA(
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

/**
 * Adds light and dark colors to a palette using the extreme shades
 * Used for reference palettes where APCA validation is not needed
 * @param shades - The shades record
 * @returns Object with light, dark, lightFg, darkFg, lightText, and darkText color information
 */
function addLightDarkColorsFromExtremes(
	shades: Record<number, { hex: string; oklch: UJLTOklch }>
): {
	light: { hex: string; oklch: UJLTOklch; shade: number };
	dark: { hex: string; oklch: UJLTOklch; shade: number };
	lightFg: { hex: string; oklch: UJLTOklch };
	darkFg: { hex: string; oklch: UJLTOklch };
	lightText: { hex: string; oklch: UJLTOklch };
	darkText: { hex: string; oklch: UJLTOklch };
} {
	const lightColor = shades[LIGHT_SHADE] ?? Object.values(shades)[0];
	const darkColor = shades[DARK_SHADE] ?? Object.values(shades)[Object.values(shades).length - 1];

	// Determine best foreground colors (black or white)
	const foregroundCandidates = ['#000000', '#ffffff'];
	const lightFgHex = determineBestForegroundColor(lightColor.hex, foregroundCandidates);
	const darkFgHex = determineBestForegroundColor(darkColor.hex, foregroundCandidates);

	// Find text colors with minimum APCA contrast threshold
	const favoriteShade = MID_SHADE;
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
			shade: LIGHT_SHADE
		},
		dark: {
			hex: darkColor.hex,
			oklch: darkColor.oklch,
			shade: DARK_SHADE
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

// ============================================
// PALETTE INTERPOLATION
// ============================================

/**
 * Creates a 25% light + 50% mid + 25% dark color mix
 * This is achieved by first mixing light and dark 50/50, then mixing the result with mid 50/50
 */
function mixLightMidDark(lightColor: string, midColor: string, darkColor: string): Color {
	const lightDarkMix = Color.mix(lightColor, darkColor, LIGHT_DARK_MIX_FACTOR, { space: 'oklab' });
	return Color.mix(lightDarkMix, midColor, LIGHT_DARK_MIX_FACTOR, { space: 'oklab' });
}

/**
 * Gets a reference palette (e.g., zinc) as a GeneratedPalette
 * @param colorName - Name of the reference color family (e.g., "zinc")
 * @returns A GeneratedPalette from the reference colors
 */
export function getReferencePalette(colorName: string): GeneratedPalette {
	const referenceColors = REFERENCE_COLORS.filter((c) => c.name === colorName);
	const shades: Record<number, { hex: string; oklch: UJLTOklch }> = {};

	for (const color of referenceColors) {
		shades[color.shade] = {
			hex: color.hex,
			oklch: color.oklch
		};
	}

	// Use mid shade (500) as base color
	const baseColor = referenceColors.find((c) => c.shade === MID_SHADE);
	if (!baseColor) {
		throw new Error(`Reference palette "${colorName}" does not have shade ${MID_SHADE}`);
	}

	// For reference palettes, use extreme shades (no APCA needed)
	const { light, dark, lightFg, darkFg, lightText, darkText } =
		addLightDarkColorsFromExtremes(shades);

	return {
		baseHex: baseColor.hex,
		baseOklch: baseColor.oklch,
		shades,
		light,
		dark,
		lightFg,
		darkFg,
		lightText,
		darkText
	};
}

/**
 * Interpolates three palettes (light, mid, dark) into a single ambient palette
 * Shade 50 uses 100% light palette
 * Shade 500 uses 25% light + 50% mid + 25% dark
 * Shade 950 uses 100% dark palette
 * Intermediate shades are linearly interpolated between the appropriate pairs
 * @param lightPalette - The light palette (used at shade 50)
 * @param midPalette - The mid palette (contributes 50% at shade 500)
 * @param darkPalette - The dark palette (used at shade 950)
 * @returns A new interpolated ambient palette
 */
export function interpolateAmbientPalette(
	lightPalette: GeneratedPalette,
	midPalette: GeneratedPalette,
	darkPalette: GeneratedPalette
): GeneratedPalette {
	const result: Record<number, { hex: string; oklch: UJLTOklch }> = {};

	for (const shade of SHADES) {
		const lightColor = lightPalette.shades[shade];
		const midColor = midPalette.shades[shade];
		const darkColor = darkPalette.shades[shade];

		if (!lightColor || !midColor || !darkColor) {
			continue;
		}

		const midMix = mixLightMidDark(lightColor.hex, midColor.hex, darkColor.hex);
		let mixed: Color;

		if (shade === MID_SHADE) {
			mixed = midMix;
		} else if (shade < MID_SHADE) {
			const factor = (shade - LIGHT_SHADE) / SHADE_RANGE_TO_MID;
			mixed = Color.mix(lightColor.hex, midMix, factor, { space: 'oklab' });
		} else {
			const factor = (shade - MID_SHADE) / SHADE_RANGE_FROM_MID;
			mixed = Color.mix(midMix, darkColor.hex, factor, { space: 'oklab' });
		}

		const srgb = mixed.to('srgb').toGamut();
		const [l, c, h] = srgb.to('oklch').coords;
		const hex = srgb.toString({ format: 'hex' });

		result[shade] = {
			hex,
			oklch: { l, c, h: h ?? 0 }
		};
	}

	// Calculate light and dark colors with APCA contrast validation
	const favoriteShade = MID_SHADE;
	const { light, dark, lightFg, darkFg, lightText, darkText } = addLightDarkColorsWithAPCA(
		result,
		favoriteShade
	);

	// Use the light palette as base for metadata
	return {
		baseHex: lightPalette.baseHex,
		baseOklch: lightPalette.baseOklch,
		shades: result,
		light,
		dark,
		lightFg,
		darkFg,
		lightText,
		darkText
	};
}

// ============================================
// MAIN FUNCTION
// ============================================

/**
 * Generates a complete color palette from a single input color
 */
export function generateColorPalette(hexColor: string): GeneratedPalette {
	const inputOklch = hexToOklch(hexColor);

	// Step 1: Find closest reference color
	const { color: closestColor } = findClosestReferenceColor(hexColor);

	// Step 2: Find second reference color at same shade for interpolation
	const interpolationColor = findSecondColorAtSameShade(inputOklch, closestColor);

	// Step 3: Calculate interpolation factor
	let interpolationFactor = 0;
	let primaryColorName = closestColor.name;
	let secondaryColorName = closestColor.name;

	if (interpolationColor) {
		interpolationFactor = calculateInterpolationFactor(
			inputOklch.h,
			closestColor.oklch.h,
			interpolationColor.oklch.h
		);
		primaryColorName = closestColor.name;
		secondaryColorName = interpolationColor.name;
	}

	// Step 4: Interpolate reference palettes
	const basePalette =
		interpolationColor && interpolationFactor > 0 && interpolationFactor < 1
			? interpolateReferencePalettes(primaryColorName, secondaryColorName, interpolationFactor)
			: Object.fromEntries(
					REFERENCE_COLORS.filter((c) => c.name === closestColor.name).map((c) => [
						c.shade,
						{ hex: c.hex, oklch: c.oklch }
					])
				);

	// Step 5: Refine palette with input color (anchor exact color and blend)
	const shades = refinePaletteWithInputColor(basePalette, inputOklch);

	// Step 6: Find favorite shade (closest to input color)
	const favoriteShade = findClosestShade(shades, inputOklch);

	// Step 7: Calculate light and dark colors with APCA contrast validation
	const { light, dark, lightFg, darkFg, lightText, darkText } = addLightDarkColorsWithAPCA(
		shades,
		favoriteShade
	);

	return {
		baseHex: hexColor,
		baseOklch: inputOklch,
		shades,
		light,
		dark,
		lightFg,
		darkFg,
		lightText,
		darkText
	};
}
