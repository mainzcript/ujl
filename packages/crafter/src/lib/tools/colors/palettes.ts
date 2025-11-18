/**
 * Palette generation and interpolation utilities.
 *
 * This module provides functions for generating Tailwind-like color palettes from a single input color.
 * The algorithmic pipeline:
 * 1. Finds the closest Tailwind reference color family in OKLab space
 * 2. Optionally interpolates between two families based on hue position
 * 3. Refines the palette to anchor the exact input color at the correct shade
 * 4. Derives light/dark + text colors using APCA contrast validation
 *
 * Performance note: generateColorPalette is relatively computationally expensive (involves
 * multiple color space conversions, distance calculations, and palette interpolations).
 * It should not be called in high-frequency loops (e.g., per-frame animations).
 */

import Color from 'colorjs.io';
import { tailwindColorPlate } from './tailwindColorPlate.js';
import type { UJLTOklch } from '@ujl-framework/types';
import { hexToOklch, distanceOKLab, hueDistance } from './colorSpaces.js';
import type { OKLab } from './colorSpaces.js';
import { addLightDarkColorsWithAPCA } from './contrast.js';

// ============================================
// TYPE DEFINITIONS
// ============================================

/**
 * A reference color from the Tailwind palette with precomputed color space values.
 * Used as a basis for generating custom color palettes.
 */
export type ReferenceColor = {
	name: string; // Color family name, e.g. "sky"
	shade: number; // Shade value: 50, 100, 200, ..., 950
	hex: string;
	oklab: OKLab;
	oklch: UJLTOklch;
};

/**
 * A complete generated color palette with shades and light/dark variants.
 * This is the output of generateColorPalette and related functions.
 */
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
// CONSTANTS
// ============================================

const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

// Shade constants
const MID_SHADE = 500;

// Blending constant
const BLEND_RADIUS = 5; // Number of shade steps left/right for palette blending and smoothing

// ============================================
// REFERENCE COLOR PALETTE
// ============================================

/**
 * Precomputes all reference colors from the Tailwind palette with OKLab and OKLCH values.
 * This is done once at module load for performance.
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
// COLOR MATCHING
// ============================================

/**
 * Finds the closest reference color to the input using OKLab distance.
 * Uses a pre-filtering step by lightness for performance.
 *
 * @param inputHex - Input color in hex format
 * @returns The closest reference color and its distance
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
 * Finds a second reference color at the same shade level for interpolation.
 * Returns the color that forms a hue pair with the first color around the input hue.
 *
 * @param inputOklch - Input color in OKLCH
 * @param firstColor - The first (closest) reference color
 * @returns A second reference color at the same shade, or null if not found
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
 * Calculates interpolation factor based on hue position.
 * Determines how much to blend between two reference colors based on where the input hue falls.
 *
 * @param inputHue - Input hue in degrees (0-360)
 * @param hue1 - First reference hue in degrees
 * @param hue2 - Second reference hue in degrees
 * @returns Interpolation factor (0-1), where 0 = use hue1, 1 = use hue2
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

/**
 * Interpolates two reference color palettes in OKLab space.
 * Creates a smooth transition between two color families.
 *
 * @param primaryColorName - Name of the first color family (e.g., "blue")
 * @param secondaryColorName - Name of the second color family (e.g., "purple")
 * @param factor - Interpolation factor (0-1), where 0 = primary, 1 = secondary
 * @returns Interpolated palette with all shades
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

// ============================================
// PALETTE REFINEMENT
// ============================================

/**
 * Finds the closest shade where the input color should be anchored.
 * Uses OKLab distance to find the shade that best matches the input color.
 *
 * @param palette - The palette to search through
 * @param input - Input color in OKLCH
 * @returns The shade number closest to the input color
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
 * Builds a pure hue palette with constant hue = input.h.
 * Smoothly transitions L & C values towards input around anchor shade.
 * This prevents hard edges when blending with the base palette.
 *
 * @param basePalette - The base palette to blend from
 * @param input - Input color in OKLCH
 * @param anchorShade - The shade where the input color should appear
 * @param radius - How many shade steps the transition spans (default: BLEND_RADIUS)
 * @returns A pure hue palette with the input hue throughout
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
 * Cosine ease function for smooth blending transitions.
 * Returns 1 at dist=0, 0 at dist>=radius, smooth C¹-continuous curve.
 *
 * @param dist - Distance from anchor point
 * @param radius - Maximum distance for blending
 * @returns Blend factor (0-1)
 */
function ease(dist: number, radius: number): number {
	if (dist >= radius) return 0;
	const x = dist / radius; // 0..1
	// Cosine curve: 1 at dist=0, 0 at dist=radius
	return 0.5 * (1 + Math.cos(Math.PI * x));
}

/**
 * Blends two palettes smoothly in OKLab space.
 *
 * @param basePalette - The base palette to blend from
 * @param pureHuePalette - The pure hue palette to blend towards
 * @param anchorShade - The shade index where blending is strongest (100% pureHuePalette)
 * @param radius - How many steps left/right the fade-out reaches (default: BLEND_RADIUS)
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
 * Refines a palette by anchoring the input color and blending with a pure hue palette.
 * This ensures the exact input color appears at the correct shade while maintaining
 * smooth transitions and Tailwind-like harmony.
 *
 * @param basePalette - The base palette to refine
 * @param input - The exact input color that should appear in the palette
 * @returns A refined palette with the input color anchored at the correct shade
 */
function refinePaletteWithInputColor(
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
// MAIN FUNCTION
// ============================================

/**
 * Generates a complete Tailwind-like color palette from a single input color.
 *
 * This function implements a sophisticated algorithm that:
 * 1. Finds the closest Tailwind reference family in OKLab space
 * 2. Optionally interpolates between two families based on hue position
 * 3. Refines the palette to anchor the exact input color at the correct shade
 * 4. Derives light/dark + text colors using APCA contrast validation
 *
 * The result is a harmonious palette that maintains Tailwind's visual consistency
 * while incorporating the exact input color.
 *
 * @param hexColor - Input color in hex format (e.g., "#3b82f6")
 * @returns A complete GeneratedPalette with all shades and light/dark variants
 * @throws {Error} If the hex color is invalid
 *
 * Performance note: This function is relatively computationally expensive (involves
 * multiple color space conversions, distance calculations, and palette interpolations).
 * It should not be called in high-frequency loops (e.g., per-frame animations).
 *
 * @example
 * ```ts
 * const palette = generateColorPalette("#3b82f6");
 * // Returns a complete palette with shades 50-950, light/dark variants, and text colors
 * ```
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
