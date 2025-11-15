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

export type TailwindColor = {
	name: string; // "sky"
	shade: number; // 50 .. 950
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
// PRECOMPUTED TAILWIND COLORS
// ============================================

const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

/**
 * Precomputes all Tailwind colors with OKLab and OKLCH values
 * This is done once at module load for performance
 */
function precomputeTailwindColors(): TailwindColor[] {
	const colors: TailwindColor[] = [];

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

const TAILWIND_COLORS: TailwindColor[] = precomputeTailwindColors();

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

/**
 * Converts OKLCH to OKLab
 * @internal - May be used in future enhancements
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function oklchToOklab(oklch: OKLCH): OKLab {
	const color = new Color('oklch', [oklch.l, oklch.c, oklch.h]);
	const [L, a, b] = color.to('oklab').coords;
	return { L, a, b };
}

/**
 * Converts OKLCH to HEX
 * @internal - May be used in future enhancements
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function oklchToHex(oklch: OKLCH): string {
	const color = new Color('oklch', [oklch.l, oklch.c, oklch.h]);
	return color.toGamut().to('srgb').toString({ format: 'hex' });
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
 * Finds the closest color in Tailwind palette using OKLab distance
 */
function findClosestColorOKLab(inputHex: string): {
	color: TailwindColor;
	distance: number;
} {
	const inputColor = new Color(inputHex);
	const [inputL, inputA, inputB] = inputColor.to('oklab').coords;
	const inputOklab: OKLab = { L: inputL, a: inputA, b: inputB };

	// Optional: Pre-filter by similar lightness for performance
	const candidates = TAILWIND_COLORS.filter((c) => Math.abs(c.oklab.L - inputOklab.L) < 0.25);

	const searchSpace = candidates.length > 0 ? candidates : TAILWIND_COLORS;

	let closest: TailwindColor | null = null;
	let minDistance = Infinity;

	for (const color of searchSpace) {
		const distance = distanceOKLab(inputOklab, color.oklab);
		if (distance < minDistance) {
			minDistance = distance;
			closest = color;
		}
	}

	if (!closest) {
		throw new Error('No closest color found');
	}

	return { color: closest, distance: minDistance };
}

/**
 * Finds the second color for interpolation at the same shade level
 */
function findSecondColorAtSameStep(
	inputOklch: OKLCH,
	firstColor: TailwindColor
): TailwindColor | null {
	// Get all colors at the same shade
	const candidates = TAILWIND_COLORS.filter((c) => c.shade === firstColor.shade);

	if (candidates.length < 2) {
		return null;
	}

	// Sort by hue
	const sorted = candidates.slice().sort((a, b) => a.oklch.h - b.oklch.h);

	// Find the neighbor pair where inputHue falls between them
	let bestPair: { a: TailwindColor; b: TailwindColor } | null = null;
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
 * Interpolates two color palettes in OKLab space
 */
function interpolatePalettes(
	color1Name: string,
	color2Name: string,
	factor: number
): Record<number, { hex: string; oklch: OKLCH }> {
	const result: Record<number, { hex: string; oklch: OKLCH }> = {};

	for (const shade of SHADES) {
		const c1 = TAILWIND_COLORS.find((c) => c.name === color1Name && c.shade === shade);
		const c2 = TAILWIND_COLORS.find((c) => c.name === color2Name && c.shade === shade);

		if (!c1 || !c2) {
			continue;
		}

		// Use Color.mix() static method (OO-API) instead of mix from colorjs.io/fn
		// Color.mix() returns a Color object directly
		const mixed = Color.mix(c1.hex, c2.hex, factor, { space: 'oklab' });

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
	let bestShade = 500;
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
 * Builds a pure hue palette Q with constant hue = input.h
 * Smoothly transitions L & C values towards input around shade k
 * This prevents hard edges when blending with the base palette
 */
function buildPureHuePalette(
	basePalette: Record<number, { oklch: OKLCH }>,
	input: OKLCH,
	k: number,
	radiusLC = 3 // how many steps left/right to smooth L/C transition
): Record<number, { oklch: OKLCH; hex: string }> {
	const Q: Record<number, { oklch: OKLCH; hex: string }> = {};
	const kIndex = SHADES.indexOf(k as (typeof SHADES)[number]);

	if (kIndex === -1) {
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

			Q[shade] = { oklch, hex };
		}
		return Q;
	}

	for (let i = 0; i < SHADES.length; i++) {
		const shade = SHADES[i];
		const base = basePalette[shade];
		if (!base) continue;

		const dist = Math.abs(i - kIndex);

		// Weight for transitioning L/C values towards input
		// 1 at k, 0 at distance >= radiusLC
		const w = Math.max(0, 1 - dist / radiusLC);

		// Smoothly blend L & C from base towards input
		const l = base.oklch.l * (1 - w) + input.l * w;
		const c = base.oklch.c * (1 - w) + input.c * w;
		const h = input.h; // Hue constant everywhere

		const oklch: OKLCH = { l, c, h };

		const color = new Color('oklch', [oklch.l, oklch.c, oklch.h]).toGamut();
		const hex = color.to('srgb').toString({ format: 'hex' });

		Q[shade] = { oklch, hex };
	}

	return Q;
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
 * Blends two palettes P and Q smoothly in OKLab space
 * At shade k, the result is 100% Q, fading to 100% P at distance radius
 * Uses cosine ease function for smoother transitions
 */
function blendPalettes(
	P: Record<number, { oklch: OKLCH; hex: string }>,
	Q: Record<number, { oklch: OKLCH; hex: string }>,
	k: number,
	radius = 4 // how many steps left/right fade-out reaches
): Record<number, { oklch: OKLCH; hex: string }> {
	const blended: Record<number, { oklch: OKLCH; hex: string }> = {};
	const idx = SHADES.indexOf(k as (typeof SHADES)[number]);

	if (idx === -1) {
		// Fallback: if shade not found, return P
		return P;
	}

	for (let i = 0; i < SHADES.length; i++) {
		const shade = SHADES[i];
		const pEntry = P[shade];
		const qEntry = Q[shade];

		// Skip if either palette doesn't have this shade
		if (!pEntry || !qEntry) {
			continue;
		}

		const pColor = new Color(pEntry.hex);
		const qColor = new Color(qEntry.hex);

		// Distance from anchor
		const dist = Math.abs(i - idx);

		// Use cosine ease for smooth transition instead of linear
		// 1 → full Q at center, 0 → full P far away
		const t = ease(dist, radius);

		const mixed = Color.mix(pColor, qColor, t, { space: 'oklab' }).toGamut();
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
	P: Record<number, { hex: string; oklch: OKLCH }>,
	input: OKLCH
): Record<number, { hex: string; oklch: OKLCH }> {
	// Step 1: Find anchor shade k
	const k = findClosestShadeIndex(P, input);

	// Step 2: Calculate delta between input and P[k] in OKLab for dynamic radius
	const pKColor = new Color(P[k].hex).to('oklab').coords;
	const inputLab = new Color('oklch', [input.l, input.c, input.h]).to('oklab').coords;
	const delta = Math.sqrt(
		Math.pow(pKColor[0] - inputLab[0], 2) +
			Math.pow(pKColor[1] - inputLab[1], 2) +
			Math.pow(pKColor[2] - inputLab[2], 2)
	);

	// Dynamic radius: larger when input is far from P[k]
	const baseRadius = 3;
	const extra = Math.min(4, Math.floor(delta * 10)); // 0..4 additional steps
	const radius = baseRadius + extra;

	// Step 3: Build hue-constant palette with smooth L/C transition around k
	const Q = buildPureHuePalette(P, input, k, 3);

	// Step 4: Blend P & Q smoothly with dynamic radius
	const final = blendPalettes(P, Q, k, radius);

	// Step 5: Explicitly set final[k] to exact input color
	// Since Q and blendPalettes are already smoothed, the difference to neighbors is minimal
	const exactColor = new Color('oklch', [input.l, input.c, input.h]).toGamut();
	final[k] = {
		oklch: input,
		hex: exactColor.to('srgb').toString({ format: 'hex' })
	};

	return final;
}

// ============================================
// MAIN FUNCTION
// ============================================

/**
 * Generates a complete color palette from a single input color
 */
export function generateColorPalette(hexColor: string): GeneratedPalette {
	const inputOklch = hexToOklch(hexColor);

	// Edge case: Very low chroma (almost gray) -> use neutral palette
	if (inputOklch.c < 0.02) {
		// Use slate as neutral palette
		const slatePalette = TAILWIND_COLORS.filter((c) => c.name === 'slate');
		const baseShades: Record<number, { hex: string; oklch: OKLCH }> = {};

		for (const color of slatePalette) {
			baseShades[color.shade] = {
				hex: color.hex,
				oklch: color.oklch
			};
		}

		// Refine palette with input color (anchor exact color and blend)
		const shades = refinePaletteWithInputColor(baseShades, inputOklch);

		return {
			baseHex: hexColor,
			baseOklch: inputOklch,
			shades
		};
	}

	// Step 1: Find closest color
	const { color: firstColor } = findClosestColorOKLab(hexColor);

	// Step 2: Find second color at same shade
	const secondColor = findSecondColorAtSameStep(inputOklch, firstColor);

	// Step 3: Calculate interpolation factor
	let factor = 0;
	let color1Name = firstColor.name;
	let color2Name = firstColor.name;

	if (secondColor) {
		factor = calculateInterpolationFactor(inputOklch.h, firstColor.oklch.h, secondColor.oklch.h);
		color1Name = firstColor.name;
		color2Name = secondColor.name;
	}

	// Step 4: Interpolate palettes
	const baseShades =
		secondColor && factor > 0 && factor < 1
			? interpolatePalettes(color1Name, color2Name, factor)
			: // Fallback: use first color palette directly
				(() => {
					const result: Record<number, { hex: string; oklch: OKLCH }> = {};
					const firstPalette = TAILWIND_COLORS.filter((c) => c.name === firstColor.name);
					for (const color of firstPalette) {
						result[color.shade] = {
							hex: color.hex,
							oklch: color.oklch
						};
					}
					return result;
				})();

	// Step 5: Refine palette with input color (anchor exact color and blend)
	const shades = refinePaletteWithInputColor(baseShades, inputOklch);

	return {
		baseHex: hexColor,
		baseOklch: inputOklch,
		shades
	};
}
