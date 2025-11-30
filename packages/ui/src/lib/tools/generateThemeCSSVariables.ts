import type { UJLTTokenSet, UJLTFlavor } from '@ujl-framework/types';
import { flavors, resolveColorFromShades, resolveForegroundColor } from '@ujl-framework/types';
import { formatOklch } from './formatOklch.js';

/**
 * Generates CSS custom properties from the theme token set.
 * Creates variables for radius and all flavor colors (shades 50-950).
 *
 * All color values are resolved from shade references at runtime.
 *
 * @param tokens - The UJL theme token set
 * @returns Record of CSS variable names to values
 */
export function generateThemeCSSVariables(tokens: UJLTTokenSet): Record<string, string> {
	const vars: Record<string, string> = {};

	// Border radius
	vars['--radius'] = tokens.radius;

	// Generate variables for all flavors
	// (ambient, primary, secondary, accent, success, warning, destructive, info)
	flavors.forEach((flavor: UJLTFlavor) => {
		const colorSet = tokens.color[flavor];

		// Generate shade variables (50-950) as complete OKLCH strings
		const shadeKeys = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
		shadeKeys.forEach((shade) => {
			const shadeColor = colorSet.shades[shade.toString() as keyof typeof colorSet.shades];
			vars[`--${flavor}-${shade}`] = formatOklch(shadeColor);
		});

		// Resolve light and dark background colors from shade references
		const lightBg = resolveColorFromShades(colorSet.shades, colorSet.light);
		const darkBg = resolveColorFromShades(colorSet.shades, colorSet.dark);
		vars[`--${flavor}-light`] = formatOklch(lightBg);
		vars[`--${flavor}-dark`] = formatOklch(darkBg);

		// Foreground matrices: for each background flavor X (current `flavor`) and
		// each foreground flavor Y, expose dedicated CSS variables:
		//   --{flavor}-light-foreground-{Y}
		//   --{flavor}-dark-foreground-{Y}
		flavors.forEach((foregroundFlavor: UJLTFlavor) => {
			const lightFg = resolveForegroundColor(tokens.color, flavor, foregroundFlavor, 'light');
			const darkFg = resolveForegroundColor(tokens.color, flavor, foregroundFlavor, 'dark');
			vars[`--${flavor}-light-foreground-${foregroundFlavor}`] = formatOklch(lightFg);
			vars[`--${flavor}-dark-foreground-${foregroundFlavor}`] = formatOklch(darkFg);
		});

		// Convenience shorthands for the default foreground flavor (ambient)
		// on the given background flavor:
		const ambientLightFg = resolveForegroundColor(tokens.color, flavor, 'ambient', 'light');
		const ambientDarkFg = resolveForegroundColor(tokens.color, flavor, 'ambient', 'dark');
		vars[`--${flavor}-light-foreground`] = formatOklch(ambientLightFg);
		vars[`--${flavor}-dark-foreground`] = formatOklch(ambientDarkFg);
	});

	return vars;
}
