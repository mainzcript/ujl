import Color from 'colorjs.io';
import { tailwindColorPlate } from './tailwindColorPlate.js';

// ============================================
// TYPE DEFINITIONS
// ============================================

export type OKLCH = {
	l: number;
	c: number;
	h: number;
};

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
	oklch: OKLCH;
};

export type GeneratedPalette = {
	baseHex: string;
	baseOklch: OKLCH;
	shades: Record<number, { hex: string; oklch: OKLCH }>;
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

// Blending constants
const DEFAULT_BLEND_RADIUS = 4; // Default steps for palette blending fade-out
const DEFAULT_LC_SMOOTH_RADIUS = 3; // Default steps for L/C transition smoothing
const BASE_BLEND_RADIUS = 3; // Base radius for dynamic blending
const MAX_EXTRA_BLEND_RADIUS = 4; // Maximum additional steps for dynamic blending
const DELTA_TO_RADIUS_MULTIPLIER = 10; // Multiplier to convert color delta to radius steps

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
export function hexToOklch(hex: string): OKLCH {
	const color = new Color(hex);
	const [l, c, h] = color.to('oklch').coords;
	return { l, c, h: h ?? 0 };
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

	// Optional: Pre-filter by similar lightness for performance
	const candidates = REFERENCE_COLORS.filter((c) => Math.abs(c.oklab.L - inputOklab.L) < 0.25);

	const searchSpace = candidates.length > 0 ? candidates : REFERENCE_COLORS;

	let closest: ReferenceColor | null = null;
	let minDistance = Infinity;

	for (const color of searchSpace) {
		const distance = distanceOKLab(inputOklab, color.oklab);
		if (distance < minDistance) {
			minDistance = distance;
			closest = color;
		}
	}

	if (!closest) {
		throw new Error('No closest reference color found');
	}

	return { color: closest, distance: minDistance };
}

/**
 * Finds a second reference color at the same shade level for interpolation
 * Returns the color that forms a hue pair with the first color around the input hue
 */
function findSecondColorAtSameShade(
	inputOklch: OKLCH,
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
): Record<number, { hex: string; oklch: OKLCH }> {
	const result: Record<number, { hex: string; oklch: OKLCH }> = {};

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

		// Use Color.mix() static method (OO-API) instead of mix from colorjs.io/fn
		// Color.mix() returns a Color object directly
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
 * Finds the closest shade index where the input color should be anchored
 */
function findClosestShadeIndex(palette: Record<number, { oklch: OKLCH }>, input: OKLCH): number {
	let bestShade = MID_SHADE;
	let bestDist = Infinity;
	const inputLab = new Color('oklch', [input.l, input.c, input.h]).to('oklab').coords;
	const [iL, iA, iB] = inputLab;

	for (const shade of SHADES) {
		const p = palette[shade];
		if (!p) continue;

		const lab = new Color('oklch', [p.oklch.l, p.oklch.c, p.oklch.h]).to('oklab').coords;
		const d = Math.sqrt(
			Math.pow(lab[0] - iL, 2) + Math.pow(lab[1] - iA, 2) + Math.pow(lab[2] - iB, 2)
		);

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
	basePalette: Record<number, { oklch: OKLCH }>,
	input: OKLCH,
	anchorShade: number,
	radiusLC = DEFAULT_LC_SMOOTH_RADIUS // how many steps left/right to smooth L/C transition
): Record<number, { oklch: OKLCH; hex: string }> {
	const pureHuePalette: Record<number, { oklch: OKLCH; hex: string }> = {};
	const anchorIndex = SHADES.indexOf(anchorShade as (typeof SHADES)[number]);

	if (anchorIndex === -1) {
		// Fallback: if shade not found, use original behavior
		for (const shade of SHADES) {
			const base = basePalette[shade];
			if (!base) continue;

			const oklch: OKLCH = {
				l: base.oklch.l,
				c: base.oklch.c,
				h: input.h
			};

			const color = new Color('oklch', [oklch.l, oklch.c, oklch.h]).toGamut();
			const hex = color.to('srgb').toString({ format: 'hex' });

			pureHuePalette[shade] = { oklch, hex };
		}
		return pureHuePalette;
	}

	for (let i = 0; i < SHADES.length; i++) {
		const shade = SHADES[i];
		const base = basePalette[shade];
		if (!base) continue;

		const dist = Math.abs(i - anchorIndex);

		// Weight for transitioning L/C values towards input
		// 1 at anchor, 0 at distance >= radiusLC
		const w = Math.max(0, 1 - dist / radiusLC);

		// Smoothly blend L & C from base towards input
		const l = base.oklch.l * (1 - w) + input.l * w;
		const c = base.oklch.c * (1 - w) + input.c * w;
		const h = input.h; // Hue constant everywhere

		const oklch: OKLCH = { l, c, h };

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
	basePalette: Record<number, { oklch: OKLCH; hex: string }>,
	pureHuePalette: Record<number, { oklch: OKLCH; hex: string }>,
	anchorShade: number,
	radius = DEFAULT_BLEND_RADIUS // how many steps left/right fade-out reaches
): Record<number, { oklch: OKLCH; hex: string }> {
	const blended: Record<number, { oklch: OKLCH; hex: string }> = {};
	const anchorIndex = SHADES.indexOf(anchorShade as (typeof SHADES)[number]);

	if (anchorIndex === -1) {
		// Fallback: if shade not found, return base palette
		return basePalette;
	}

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

		// Distance from anchor
		const dist = Math.abs(i - anchorIndex);

		// Use cosine ease for smooth transition instead of linear
		// 1 → full pureHuePalette at center, 0 → full basePalette far away
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
	basePalette: Record<number, { hex: string; oklch: OKLCH }>,
	input: OKLCH
): Record<number, { hex: string; oklch: OKLCH }> {
	// Step 1: Find anchor shade where input color should be placed
	const anchorShade = findClosestShadeIndex(basePalette, input);

	// Step 2: Calculate delta between input and basePalette[anchorShade] in OKLab for dynamic radius
	const baseColorAtAnchor = new Color(basePalette[anchorShade].hex).to('oklab').coords;
	const inputLab = new Color('oklch', [input.l, input.c, input.h]).to('oklab').coords;
	const delta = Math.sqrt(
		Math.pow(baseColorAtAnchor[0] - inputLab[0], 2) +
			Math.pow(baseColorAtAnchor[1] - inputLab[1], 2) +
			Math.pow(baseColorAtAnchor[2] - inputLab[2], 2)
	);

	// Dynamic radius: larger when input is far from basePalette[anchorShade]
	const extra = Math.min(MAX_EXTRA_BLEND_RADIUS, Math.floor(delta * DELTA_TO_RADIUS_MULTIPLIER)); // 0..MAX_EXTRA_BLEND_RADIUS additional steps
	const blendRadius = BASE_BLEND_RADIUS + extra;

	// Step 3: Build hue-constant palette with smooth L/C transition around anchor
	const pureHuePalette = buildPureHuePalette(
		basePalette,
		input,
		anchorShade,
		DEFAULT_LC_SMOOTH_RADIUS
	);

	// Step 4: Blend base and pure hue palettes smoothly with dynamic radius
	const refinedPalette = blendPalettes(basePalette, pureHuePalette, anchorShade, blendRadius);

	// Step 5: Explicitly set refinedPalette[anchorShade] to exact input color
	// Since pureHuePalette and blendPalettes are already smoothed, the difference to neighbors is minimal
	const exactColor = new Color('oklch', [input.l, input.c, input.h]).toGamut();
	refinedPalette[anchorShade] = {
		oklch: input,
		hex: exactColor.to('srgb').toString({ format: 'hex' })
	};

	return refinedPalette;
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
	const shades: Record<number, { hex: string; oklch: OKLCH }> = {};

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

	return {
		baseHex: baseColor.hex,
		baseOklch: baseColor.oklch,
		shades
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
	const result: Record<number, { hex: string; oklch: OKLCH }> = {};

	for (const shade of SHADES) {
		const lightColor = lightPalette.shades[shade];
		const midColor = midPalette.shades[shade];
		const darkColor = darkPalette.shades[shade];

		if (!lightColor || !midColor || !darkColor) {
			continue;
		}

		let mixed: Color;

		if (shade === MID_SHADE) {
			// At shade 500: 25% light + 50% mid + 25% dark
			mixed = mixLightMidDark(lightColor.hex, midColor.hex, darkColor.hex);
		} else if (shade < MID_SHADE) {
			// Interpolate between light (at 50) and the 25/50/25 mix (at 500)
			// Shade 50 -> factor = 0 (100% light)
			// Shade 500 -> factor = 1 (25% light + 50% mid + 25% dark)
			const factor = (shade - LIGHT_SHADE) / SHADE_RANGE_TO_MID;

			// Calculate the target mix at factor=1 (25/50/25)
			const targetMix = mixLightMidDark(lightColor.hex, midColor.hex, darkColor.hex);

			// Interpolate from light to target mix
			mixed = Color.mix(lightColor.hex, targetMix, factor, { space: 'oklab' });
		} else {
			// Interpolate between the 25/50/25 mix (at 500) and dark (at 950)
			// Shade 500 -> factor = 0 (25% light + 50% mid + 25% dark)
			// Shade 950 -> factor = 1 (100% dark)
			const factor = (shade - MID_SHADE) / SHADE_RANGE_FROM_MID;

			// Calculate the source mix at factor=0 (25/50/25)
			const sourceMix = mixLightMidDark(lightColor.hex, midColor.hex, darkColor.hex);

			// Interpolate from source mix to dark
			mixed = Color.mix(sourceMix, darkColor.hex, factor, { space: 'oklab' });
		}

		const srgb = mixed.to('srgb').toGamut();
		const [l, c, h] = srgb.to('oklch').coords;
		const hex = srgb.toString({ format: 'hex' });

		result[shade] = {
			hex,
			oklch: { l, c, h: h ?? 0 }
		};
	}

	// Use the light palette as base for metadata
	return {
		baseHex: lightPalette.baseHex,
		baseOklch: lightPalette.baseOklch,
		shades: result
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
			: // Fallback: use closest color palette directly
				(() => {
					const result: Record<number, { hex: string; oklch: OKLCH }> = {};
					const closestPalette = REFERENCE_COLORS.filter((c) => c.name === closestColor.name);
					for (const color of closestPalette) {
						result[color.shade] = {
							hex: color.hex,
							oklch: color.oklch
						};
					}
					return result;
				})();

	// Step 5: Refine palette with input color (anchor exact color and blend)
	const shades = refinePaletteWithInputColor(basePalette, inputOklch);

	return {
		baseHex: hexColor,
		baseOklch: inputOklch,
		shades
	};
}
