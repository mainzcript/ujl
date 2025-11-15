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
		const shades: Record<number, { hex: string; oklch: OKLCH }> = {};

		for (const color of slatePalette) {
			shades[color.shade] = {
				hex: color.hex,
				oklch: color.oklch
			};
		}

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
	const shades =
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

	return {
		baseHex: hexColor,
		baseOklch: inputOklch,
		shades
	};
}
