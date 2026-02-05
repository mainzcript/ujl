import type {
	UJLTAmbientColorSet,
	UJLTColorPalette,
	UJLTFlavor,
	UJLTShadeRef,
	UJLTStandardColorSet,
} from "@ujl-framework/types";
import { flavors, resolveColorFromShades } from "@ujl-framework/types";
import Color from "colorjs.io";
import { pickSimilarFgColor } from "./contrast.ts";
import { toColor, toColorShades, toUJLTColorShades } from "./conversion.ts";
import { generateColorShades, generateColorShadesLightDark } from "./shades.ts";
import type { ColorShades } from "./types.ts";

/**
 * Updates foreground palettes for all background/foreground flavor combinations.
 *
 * For each background flavor B and each foreground flavor F, this function
 * selects a shade from F's palette that is as close as possible to the base
 * flavor color while still meeting the desired contrast on the background B.
 *
 * The result is stored as shade references in:
 * - colorPalette[B].lightForeground[F]  (foreground on B.light)
 * - colorPalette[B].darkForeground[F]   (foreground on B.dark)
 *
 * @param colorPalette - The color palette to update
 * @returns Updated color palette with full foreground matrices as shade references
 */
function updateForegroundPalettes(colorPalette: UJLTColorPalette): UJLTColorPalette {
	const newColorPalette: UJLTColorPalette = { ...colorPalette };

	flavors.forEach((backgroundFlavor) => {
		// Resolve background colors from shade references
		const backgroundLightShade = resolveColorFromShades(
			colorPalette[backgroundFlavor].shades,
			colorPalette[backgroundFlavor].light,
		);
		const backgroundDarkShade = resolveColorFromShades(
			colorPalette[backgroundFlavor].shades,
			colorPalette[backgroundFlavor].dark,
		);
		const backgroundLight = toColor(backgroundLightShade);
		const backgroundDark = toColor(backgroundDarkShade);

		const lightForeground = {
			...newColorPalette[backgroundFlavor].lightForeground,
		} as Record<UJLTFlavor, UJLTShadeRef>;
		const darkForeground = {
			...newColorPalette[backgroundFlavor].darkForeground,
		} as Record<UJLTFlavor, UJLTShadeRef>;

		flavors.forEach((foregroundFlavor) => {
			const foregroundShades = toColorShades(colorPalette[foregroundFlavor].shades);

			// Resolve foreground base colors from shade references
			const foregroundLightShade = resolveColorFromShades(
				colorPalette[foregroundFlavor].shades,
				colorPalette[foregroundFlavor].light,
			);
			const foregroundDarkShade = resolveColorFromShades(
				colorPalette[foregroundFlavor].shades,
				colorPalette[foregroundFlavor].dark,
			);
			let foregroundLightBase = toColor(foregroundLightShade);
			let foregroundDarkBase = toColor(foregroundDarkShade);

			// For the ambient flavor, swap light and dark base colors
			// so that light text is based on the darker ambient shade and vice versa.
			if (foregroundFlavor === "ambient") {
				[foregroundLightBase, foregroundDarkBase] = [foregroundDarkBase, foregroundLightBase];
			}

			const lightTextResult = pickSimilarFgColor(
				foregroundLightBase,
				foregroundShades,
				backgroundLight,
				60,
			);
			const darkTextResult = pickSimilarFgColor(
				foregroundDarkBase,
				foregroundShades,
				backgroundDark,
				60,
			);

			// Use the shade keys directly from the result
			lightForeground[foregroundFlavor] = lightTextResult.key;
			darkForeground[foregroundFlavor] = darkTextResult.key;
		});

		newColorPalette[backgroundFlavor].lightForeground = lightForeground;
		newColorPalette[backgroundFlavor].darkForeground = darkForeground;
	});

	return newColorPalette;
}

/**
 * Updates the ambient flavor in a color palette based on separate light/dark input colors.
 * Generates a complete color set by fading from light to dark and then recomputes
 * the full foreground matrices for all background/foreground combinations.
 *
 * All color values except shades are stored as shade references.
 *
 * @param colorPalette - The current color palette
 * @param flavor - Must be 'ambient'
 * @param original - The original color input with lightHex and darkHex
 * @returns Updated color palette with the new ambient colors and foreground maps as shade references
 */
export function updateFlavorByOriginal(
	colorPalette: UJLTColorPalette,
	flavor: "ambient",
	original: UJLTAmbientColorSet["_original"],
): UJLTColorPalette;
/**
 * Updates a non-ambient flavor in a color palette based on a single input color.
 * Generates a complete color set from the input and then recomputes
 * the full foreground matrices for all background/foreground combinations.
 *
 * All color values except shades are stored as shade references.
 *
 * @param colorPalette - The current color palette
 * @param flavor - The flavor to update (e.g., 'primary', 'secondary', etc.)
 * @param original - The original color input with hex
 * @returns Updated color palette with the new flavor colors and foreground maps as shade references
 */
export function updateFlavorByOriginal(
	colorPalette: UJLTColorPalette,
	flavor: Exclude<UJLTFlavor, "ambient">,
	original: UJLTStandardColorSet["_original"],
): UJLTColorPalette;
export function updateFlavorByOriginal(
	colorPalette: UJLTColorPalette,
	flavor: UJLTFlavor,
	original: UJLTAmbientColorSet["_original"] | UJLTStandardColorSet["_original"],
): UJLTColorPalette {
	let colorShades: ColorShades;
	let referenceColorLight: Color;
	let referenceColorDark: Color;

	// Type-safe handling based on flavor
	if (flavor === "ambient") {
		// Ambient: always uses lightHex/darkHex
		const ambientOriginal = original as UJLTAmbientColorSet["_original"];
		let lightColor: Color;
		let darkColor: Color;
		try {
			lightColor = new Color(ambientOriginal.lightHex);
			darkColor = new Color(ambientOriginal.darkHex);
		} catch {
			// Invalid color input - return original palette unchanged
			return colorPalette;
		}
		// Generate palette fading from lightColor (for light shades 50-100) to darkColor (for dark shades 900-950)
		// lightHex describes how light shades should look, darkHex describes the tone for dark shades
		colorShades = generateColorShadesLightDark(lightColor, darkColor);
		// Reuse parsed colors for reference
		referenceColorLight = lightColor;
		referenceColorDark = darkColor;
	} else {
		// Non-ambient: always uses hex
		const standardOriginal = original as UJLTStandardColorSet["_original"];
		let parsedColor: Color;
		try {
			parsedColor = new Color(standardOriginal.hex);
		} catch {
			// Invalid color input - return original palette unchanged
			return colorPalette;
		}
		colorShades = generateColorShades(parsedColor);
		// Use same color for both light and dark reference
		referenceColorLight = parsedColor;
		referenceColorDark = parsedColor;
	}

	const colorShadesAsColor = toColorShades(toUJLTColorShades(colorShades));

	let lightShadeRef: UJLTShadeRef;
	let darkShadeRef: UJLTShadeRef;

	if (flavor === "ambient") {
		// For ambient, use explicit shade keys
		lightShadeRef = "50";
		darkShadeRef = "950";
	} else {
		// Resolve ambient colors from shade references
		const ambientLightShade = resolveColorFromShades(
			colorPalette.ambient.shades,
			colorPalette.ambient.light,
		);
		const ambientDarkShade = resolveColorFromShades(
			colorPalette.ambient.shades,
			colorPalette.ambient.dark,
		);
		const ambientLight = toColor(ambientLightShade);
		const ambientDark = toColor(ambientDarkShade);

		const lightResult = pickSimilarFgColor(
			referenceColorLight,
			colorShadesAsColor,
			ambientLight,
			5,
		);
		const darkResult = pickSimilarFgColor(referenceColorDark, colorShadesAsColor, ambientDark, 5);

		// Use the shade keys directly from the result
		lightShadeRef = lightResult.key;
		darkShadeRef = darkResult.key;
	}

	const newColorPalette = {
		...colorPalette,
		[flavor]: {
			...colorPalette[flavor],
			light: lightShadeRef,
			dark: darkShadeRef,
			shades: toUJLTColorShades(colorShades),
			_original: original,
		},
	};
	return updateForegroundPalettes(newColorPalette);
}
