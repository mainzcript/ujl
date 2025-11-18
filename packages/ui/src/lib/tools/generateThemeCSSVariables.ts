import type { UJLTTokenSet, UJLTFlavor } from '@ujl-framework/types';
import { flavors } from '@ujl-framework/types';
import { formatOklch } from './formatOklch.js';

/**
 * Generates CSS custom properties from the theme token set.
 * Creates variables for radius and all flavor colors (shades 50-950).
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
		const colorSetRaw = (tokens.color as unknown as Record<string, unknown>)[flavor];
		const colorSet = colorSetRaw as {
			light: { l: number; c: number; h: number };
			lightForeground: { l: number; c: number; h: number };
			lightText: { l: number; c: number; h: number };
			dark: { l: number; c: number; h: number };
			darkForeground: { l: number; c: number; h: number };
			darkText: { l: number; c: number; h: number };
			shades: Record<
				50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950,
				{ l: number; c: number; h: number }
			>;
		};
		// Generate shade variables (50-950) as complete OKLCH strings
		// Lightness is converted from 0..1 to 0%..100%
		const shadeKeys = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
		shadeKeys.forEach((shade) => {
			const shadeColor = colorSet.shades[shade];
			vars[`--${flavor}-${shade}`] = formatOklch(shadeColor);
		});
		// Light and dark mode variables for consistent theme switching
		vars[`--${flavor}-light`] = formatOklch(colorSet.light);
		vars[`--${flavor}-light-foreground`] = formatOklch(colorSet.lightForeground);
		vars[`--${flavor}-light-text`] = formatOklch(colorSet.lightText);
		vars[`--${flavor}-dark`] = formatOklch(colorSet.dark);
		vars[`--${flavor}-dark-foreground`] = formatOklch(colorSet.darkForeground);
		vars[`--${flavor}-dark-text`] = formatOklch(colorSet.darkText);
	});

	return vars;
}
