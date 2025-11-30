import type { UJLTShadeKey } from '@ujl-framework/types';
import Color from 'colorjs.io';
import type { ColorShades } from './types.ts';
import { orderShadesByDistance } from './shades.ts';

/**
 * Result type for color picking functions that return both shade key and color.
 */
export type ShadeColorResult = {
	key: UJLTShadeKey;
	color: Color;
};

/**
 * Picks the foreground color that has the highest contrast with the background color.
 * Uses absolute contrast values to find the maximum contrast regardless of direction
 * (dark text on light bg vs light text on dark bg).
 *
 * @param shades - The color shades to pick from
 * @param bgColor - The background color to pick the text color for
 * @returns The shade key and color with the highest absolute contrast
 */
export function pickFgColor(shades: ColorShades, bgColor: Color): ShadeColorResult {
	const shadesWithContrast = Object.entries(shades).map(([key, color]) => ({
		key: key as UJLTShadeKey,
		color: color,
		absContrast: Math.abs(bgColor.contrast(color, 'APCA'))
	}));
	const highestContrastShade = shadesWithContrast.reduce(
		(max, shade) => (shade.absContrast > max.absContrast ? shade : max),
		shadesWithContrast[0]
	);
	return {
		key: highestContrastShade.key,
		color: highestContrastShade.color
	};
}

/**
 * Picks the most similar foreground color that can be used on the background color.
 * First orders shades by similarity to the target color, then selects the most similar
 * shade that meets the contrast threshold. If no shade meets the threshold, returns
 * the shade with the highest contrast.
 *
 * @param color - The target color to match
 * @param shades - The color shades to pick from
 * @param bgColor - The background color to pick the text color for
 * @param threshold - The minimum APCA contrast to aim for (60 meets WCAG AA level)
 * @returns The shade key and color with the best balance of similarity and contrast
 */
export function pickSimilarFgColor(
	color: Color,
	shades: ColorShades,
	bgColor: Color,
	threshold: number = 60
): ShadeColorResult {
	const orderedShades = orderShadesByDistance(color, shades);
	const shadesWithContrast = orderedShades.map((shade) => ({
		key: shade.key,
		color: shades[shade.key],
		absContrast: Math.abs(bgColor.contrast(shades[shade.key], 'APCA'))
	}));

	// Find the most similar shade that meets the contrast threshold
	const closestShade = shadesWithContrast.find((shade) => shade.absContrast >= threshold);
	if (closestShade) {
		return {
			key: closestShade.key,
			color: closestShade.color
		};
	}

	// Fallback: return the shade with highest contrast if threshold cannot be met
	const highestContrastShade = shadesWithContrast.reduce(
		(max, shade) => (shade.absContrast > max.absContrast ? shade : max),
		shadesWithContrast[0]
	);
	return {
		key: highestContrastShade.key,
		color: highestContrastShade.color
	};
}
