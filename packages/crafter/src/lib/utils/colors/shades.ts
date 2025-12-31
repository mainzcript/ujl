import type { UJLTShadeKey } from '@ujl-framework/types';
import { colorShades } from '@ujl-framework/types';
import Color from 'colorjs.io';
import type { ColorShades, ShadesWithDistance, RefColorsWithDistance } from './types.ts';
import { REF_COLORS } from './refColors.ts';
import { ease } from './easing.ts';

/**
 * Orders color shades by distance to a target color using CIEDE2000 color difference.
 *
 * @param color - Target color to compare against
 * @param shades - Color shades to order
 * @returns Ordered array of shades with distances (closest first)
 */
export function orderShadesByDistance(color: Color, shades: ColorShades): ShadesWithDistance {
	const orderedShades: ShadesWithDistance = [];
	colorShades.forEach((shade: UJLTShadeKey) => {
		const shadeColor = shades[shade];
		orderedShades.push({
			key: shade,
			distance: color.deltaE(shadeColor, '2000')
		});
	});
	orderedShades.sort((a, b) => a.distance - b.distance);
	return orderedShades;
}

/**
 * Finds the closest color shade to a target color.
 *
 * @param color - Target color to compare against
 * @param shades - Color shades to search
 * @returns Closest shade key and its distance
 */
function findClosestColorShade(
	color: Color,
	shades: ColorShades
): { key: UJLTShadeKey; distance: number } {
	const orderedShades = orderShadesByDistance(color, shades);
	return { key: orderedShades[0].key, distance: orderedShades[0].distance };
}

/**
 * Finds the closest color shade by lightness (L) only.
 * Useful when shades already have the same chroma and hue as the target color.
 *
 * @param color - Target color to compare against
 * @param shades - Color shades to search
 * @returns Closest shade key and its lightness difference
 */
function findClosestShadeByLightness(
	color: Color,
	shades: ColorShades
): { key: UJLTShadeKey; distance: number } {
	const colorOklch = color.to('oklch');
	const targetL = colorOklch.coords[0] ?? 0;

	let closestKey: UJLTShadeKey = '500';
	let minDistance = Infinity;

	colorShades.forEach((shade: UJLTShadeKey) => {
		const shadeOklch = shades[shade].to('oklch');
		const shadeL = shadeOklch.coords[0] ?? 0;
		const distance = Math.abs(targetL - shadeL);

		if (distance < minDistance) {
			minDistance = distance;
			closestKey = shade;
		}
	});

	return { key: closestKey, distance: minDistance };
}

/**
 * Checks if a hue value lies between two other hue values on the color circle.
 * Handles the cyclic nature of the color circle (0° = 360°).
 *
 * @param hue - Hue value to check (0-360)
 * @param hue1 - First boundary hue (0-360)
 * @param hue2 - Second boundary hue (0-360)
 * @returns True if hue lies between hue1 and hue2 on the shorter arc
 */
function isHueBetween(hue: number, hue1: number, hue2: number): boolean {
	// Normalize all hues to 0-360
	const normalize = (h: number) => ((h % 360) + 360) % 360;
	const h = normalize(hue);
	const h1 = normalize(hue1);
	const h2 = normalize(hue2);

	// Calculate both possible arcs (clockwise and counter-clockwise)
	const arc1 = (h2 - h1 + 360) % 360; // Clockwise from h1 to h2
	const arc2 = (h1 - h2 + 360) % 360; // Counter-clockwise from h1 to h2

	// Use the shorter arc
	const shorterArc = arc1 <= arc2 ? arc1 : arc2;
	const isClockwise = arc1 <= arc2;

	if (isClockwise) {
		// Check if h lies on the clockwise path from h1 to h2
		const diff = (h - h1 + 360) % 360;
		return diff <= shorterArc;
	} else {
		// Check if h lies on the counter-clockwise path from h1 to h2
		const diff = (h1 - h + 360) % 360;
		return diff <= shorterArc;
	}
}

/**
 * Orders reference color palettes by distance to a target color.
 *
 * @param color - Target color to compare against
 * @returns Ordered array of reference colors with distances
 */
function orderRefColorsByDistance(color: Color): RefColorsWithDistance {
	const orderedRefColors: RefColorsWithDistance = [];
	Object.entries(REF_COLORS).forEach(([colorName, shades]) => {
		const { distance } = findClosestColorShade(color, shades);
		orderedRefColors.push({
			key: colorName,
			shades: shades,
			distance: distance
		});
	});
	orderedRefColors.sort((a, b) => a.distance - b.distance);
	return orderedRefColors;
}

/**
 * Mixes two color shade sets by interpolating each corresponding shade.
 * Creates a new object to avoid mutating the input.
 * Uses Color.mix() directly for efficient mixing in OKLCH color space.
 *
 * @param shades1 - First shade set (ratio = 1 means 100% shades1)
 * @param shades2 - Second shade set (ratio = 0 means 100% shades2)
 * @param ratio - Mixing ratio: 0 = only shades2, 1 = only shades1, 0.5 = equal mix
 * @returns New mixed shade set as Color objects
 */
function mixColorShades(
	shades1: ColorShades,
	shades2: ColorShades,
	ratio: number = 0.5
): ColorShades {
	const mixedShades: ColorShades = {} as ColorShades;
	colorShades.forEach((shade: UJLTShadeKey) => {
		mixedShades[shade] = Color.mix(shades1[shade], shades2[shade], ratio, { space: 'oklch' });
	});
	return mixedShades;
}

/**
 * Blends two color shade sets around a center shade with a gradient effect.
 * At the center, overlayShades dominates (100%). At the edges (radius distance),
 * baseShades dominates (100%). Creates a smooth transition between them using cosine easing.
 * Uses Color.mix() directly for efficient blending in OKLCH color space.
 *
 * @param baseShades - Base shade set (used at edges) as Color objects
 * @param overlayShades - Overlay shade set (used at center) as Color objects
 * @param center - Center shade key where blending is strongest
 * @param radius - Blending radius in shade steps (minimum 1 to avoid division by zero)
 * @returns New blended shade set as Color objects
 */
function blendColorShadesAroundCenter(
	baseShades: ColorShades,
	overlayShades: ColorShades,
	center: UJLTShadeKey = '500',
	radius: number = 5
): ColorShades {
	// Clamp radius to minimum 1 to prevent division by zero
	const clampedRadius = Math.max(1, radius);

	const blendedShades: ColorShades = {} as ColorShades;
	const centerIndex = colorShades.indexOf(center);

	// Process all shades for smooth transitions
	for (let i = 0; i < colorShades.length; i++) {
		const shade = colorShades[i] as UJLTShadeKey;
		const distanceFromCenter = Math.abs(i - centerIndex);
		const blendFactor = ease(distanceFromCenter, clampedRadius);

		// blendFactor: 1 = 100% overlay (at center), 0 = 100% base (at edge)
		blendedShades[shade] = Color.mix(baseShades[shade], overlayShades[shade], blendFactor);
	}

	return blendedShades;
}

/**
 * Fine-tunes color shades around a target color.
 * Creates naive shades with target color's C/H but keeps L from input shades,
 * then blends around the closest shade.
 *
 * @param color - Target color to fine-tune around
 * @param shades - Base color shades to fine-tune (as Color objects)
 * @returns Fine-tuned color shades (as Color objects)
 */
function finetuneColorShades(color: Color, shades: ColorShades): ColorShades {
	const colorOklch = color.to('oklch');
	const c = colorOklch.coords[1];
	const h = colorOklch.coords[2];

	// Create naive shades: keep L from input shades, use target C/H
	const naiveShades: ColorShades = {} as ColorShades;
	colorShades.forEach((shade: UJLTShadeKey) => {
		const shadeOklch = shades[shade].to('oklch');
		const shadeL = shadeOklch.coords[0];
		naiveShades[shade] = new Color('oklch', [shadeL, c, Number.isNaN(h) ? 0 : (h ?? 0)]);
	});

	// Find closest shade by lightness only (since all naive shades have same C/H as target)
	const closestShade = findClosestShadeByLightness(color, naiveShades);
	// Set exact target color at closest shade
	naiveShades[closestShade.key] = color;

	return blendColorShadesAroundCenter(shades, naiveShades, closestShade.key);
}

/**
 * Generates a Tailwind-like color palette from a single input color.
 * Pipeline:
 * 1. Finds the two closest reference color palettes
 *    - First: closest by distance
 *    - Second: closest by distance AND hue must lie between first ref and target
 * 2. Mixes them with weights based on distance (closer = more weight)
 * 3. Fine-tunes around the input color by blending at the closest shade
 *
 * @param color - Input color to generate palette from (Color object)
 * @returns Complete color shade set (50-950) as Color objects
 */
export function generateColorShades(color: Color): ColorShades {
	const orderedRefColors = orderRefColorsByDistance(color);

	// Get the first (closest) reference color
	const refShades1 = orderedRefColors[0].shades;
	const d1 = orderedRefColors[0].distance;

	// Get hues for constraint checking
	const colorOklch = color.to('oklch');
	const targetHue = colorOklch.coords[2] ?? 0;

	// Get hue of first reference color (use shade 500 as representative)
	const ref1Oklch = refShades1['500'].to('oklch');
	const ref1Hue = ref1Oklch.coords[2] ?? 0;

	// Find second reference color that:
	// 1. Has the closest distance (after first)
	// 2. AND has a hue that lies between ref1Hue and targetHue
	let refShades2: ColorShades | null = null;
	let d2: number | null = null;

	for (let i = 1; i < orderedRefColors.length; i++) {
		const candidate = orderedRefColors[i];
		const candidateOklch = candidate.shades['500'].to('oklch');
		const candidateHue = candidateOklch.coords[2] ?? 0;

		// Check if candidate hue lies between ref1Hue and targetHue
		if (isHueBetween(candidateHue, ref1Hue, targetHue)) {
			refShades2 = candidate.shades;
			d2 = candidate.distance;
			break;
		}
	}

	// Fallback: if no suitable second reference found, use the second closest anyway
	// (This should rarely happen, but provides a safety net)
	if (!refShades2 || d2 === null) {
		refShades2 = orderedRefColors[1].shades;
		d2 = orderedRefColors[1].distance;
	}

	const summedDistances = d1 + d2;

	// Closer palette gets more weight
	const ratio = d2 / summedDistances;

	const mixedShades = mixColorShades(refShades1, refShades2, ratio);

	return finetuneColorShades(color, mixedShades);
}

/**
 * Generates a color palette by fading from a light color to a dark color.
 * Generates separate palettes for both colors, then fades between them
 * from light (shade 100) to dark (shade 900).
 *
 * @param lightColor - Light color for the lighter shades (Color object)
 * @param darkColor - Dark color for the darker shades (Color object)
 * @returns Complete color shade set (50-950) as Color objects, faded from light to dark
 */
export function generateColorShadesLightDark(lightColor: Color, darkColor: Color): ColorShades {
	// Generate separate palettes for both colors
	const lightShades = generateColorShades(lightColor);
	const darkShades = generateColorShades(darkColor);

	// Find indices for shade 100 and 900
	const shade100Index = colorShades.indexOf('100');
	const shade900Index = colorShades.indexOf('900');

	const fadedShades: ColorShades = {} as ColorShades;

	colorShades.forEach((shade: UJLTShadeKey, index: number) => {
		// Calculate mix ratio based on position between 100 and 900
		let ratio: number;

		if (index <= shade100Index) {
			// Shades 50-100: 100% light color
			ratio = 0.0;
		} else if (index >= shade900Index) {
			// Shades 900-950: 100% dark color
			ratio = 1.0;
		} else {
			// Shades between 100 and 900: linear interpolation
			const range = shade900Index - shade100Index;
			const position = index - shade100Index;
			ratio = position / range;
		}

		fadedShades[shade] = Color.mix(lightShades[shade], darkShades[shade], ratio);
	});

	return fadedShades;
}
