import type { UJLTTokenSet, UJLTFlavor } from '@ujl-framework/types';
import { flavors, resolveColorFromShades, resolveForegroundColor } from '@ujl-framework/types';
import { formatOklch } from './formatOklch.js';

function formatSize(value: number): string {
	return `${value}rem`;
}

function formatLineHeight(value: number): string {
	return `${value}em`;
}

function formatLetterSpacing(value: number): string {
	return `${value}em`;
}

function formatFontStyle(italic: boolean): string {
	return italic ? 'italic' : 'normal';
}

function formatTextDecoration(underline: boolean): string {
	return underline ? 'underline' : 'none';
}

const DEFAULT_WEIGHT = 400;

/**
 * Safely extracts font weight value, providing a default if invalid.
 * @param weight - Font weight value (may be undefined or NaN)
 * @returns Valid font weight number, or DEFAULT_WEIGHT if invalid
 */
function safeWeight(weight: number | undefined): number {
	return typeof weight === 'number' && !Number.isNaN(weight) ? weight : DEFAULT_WEIGHT;
}

/**
 * Generates CSS custom properties from the theme token set.
 * Creates variables for radius, all flavor colors (shades 50-950), and typography tokens.
 *
 * All color values are resolved from shade references at runtime.
 * Typography values are formatted with appropriate units (rem, em).
 *
 * @param tokens - The UJL theme token set
 * @returns Record of CSS variable names to values
 */
export function generateThemeCSSVariables(tokens: UJLTTokenSet): Record<string, string> {
	const vars: Record<string, string> = {};

	vars['--radius'] = formatSize(tokens.radius);
	vars['--spacing'] = formatSize(tokens.spacing);

	flavors.forEach((flavor: UJLTFlavor) => {
		const colorSet = tokens.color[flavor];

		const shadeKeys = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
		shadeKeys.forEach((shade) => {
			const shadeColor = colorSet.shades[shade.toString() as keyof typeof colorSet.shades];
			vars[`--${flavor}-${shade}`] = formatOklch(shadeColor);
		});

		const lightBg = resolveColorFromShades(colorSet.shades, colorSet.light);
		const darkBg = resolveColorFromShades(colorSet.shades, colorSet.dark);
		vars[`--${flavor}-light`] = formatOklch(lightBg);
		vars[`--${flavor}-dark`] = formatOklch(darkBg);

		// Expose foreground color variables for each background/foreground flavor combination
		flavors.forEach((foregroundFlavor: UJLTFlavor) => {
			const lightFg = resolveForegroundColor(tokens.color, flavor, foregroundFlavor, 'light');
			const darkFg = resolveForegroundColor(tokens.color, flavor, foregroundFlavor, 'dark');
			vars[`--${flavor}-light-foreground-${foregroundFlavor}`] = formatOklch(lightFg);
			vars[`--${flavor}-dark-foreground-${foregroundFlavor}`] = formatOklch(darkFg);
		});

		// Default foreground shorthands (ambient) for each background flavor
		const ambientLightFg = resolveForegroundColor(tokens.color, flavor, 'ambient', 'light');
		const ambientDarkFg = resolveForegroundColor(tokens.color, flavor, 'ambient', 'dark');
		vars[`--${flavor}-light-foreground`] = formatOklch(ambientLightFg);
		vars[`--${flavor}-dark-foreground`] = formatOklch(ambientDarkFg);
	});

	const base = tokens.typography.base;
	vars['--typography-base-font'] = base.font;
	vars['--font-base'] = base.font;
	vars['--typography-base-size'] = formatSize(base.size);
	vars['--typography-base-line-height'] = formatLineHeight(base.lineHeight);
	vars['--typography-base-letter-spacing'] = formatLetterSpacing(base.letterSpacing);
	vars['--typography-base-weight'] = String(base.weight);
	vars['--typography-bold-weight'] = String(Math.min(safeWeight(base.weight) + 200, 900));
	vars['--typography-base-style'] = formatFontStyle(base.italic);
	vars['--typography-base-decoration'] = formatTextDecoration(base.underline);
	vars['--typography-base-transform'] = base.textTransform;

	const heading = tokens.typography.heading;
	vars['--typography-heading-font'] = heading.font;
	vars['--typography-heading-size'] = formatSize(heading.size);
	vars['--typography-heading-line-height'] = formatLineHeight(heading.lineHeight);
	vars['--typography-heading-letter-spacing'] = formatLetterSpacing(heading.letterSpacing);
	vars['--typography-heading-weight'] = String(heading.weight);
	vars['--typography-heading-style'] = formatFontStyle(heading.italic);
	vars['--typography-heading-decoration'] = formatTextDecoration(heading.underline);
	vars['--typography-heading-transform'] = heading.textTransform;
	vars['--typography-heading-flavor'] = heading.flavor;

	const highlight = tokens.typography.highlight;
	// Weight is derived from base typography to maintain visual hierarchy
	const highlightWeight = highlight.bold
		? Math.min(safeWeight(base.weight) + 200, 900)
		: safeWeight(base.weight);
	vars['--typography-highlight-weight'] = String(highlightWeight);
	vars['--typography-highlight-style'] = formatFontStyle(highlight.italic);
	vars['--typography-highlight-decoration'] = formatTextDecoration(highlight.underline);
	vars['--typography-highlight-flavor'] = highlight.flavor;

	const link = tokens.typography.link;
	// Weight is derived from base typography to maintain visual hierarchy
	const linkWeight = link.bold
		? Math.min(safeWeight(base.weight) + 200, 900)
		: safeWeight(base.weight);
	vars['--typography-link-weight'] = String(linkWeight);
	vars['--typography-link-decoration'] = formatTextDecoration(link.underline);

	const code = tokens.typography.code;
	vars['--typography-code-font'] = code.font;
	vars['--font-mono'] = code.font;
	vars['--typography-code-size'] = formatSize(code.size);
	vars['--typography-code-line-height'] = formatLineHeight(code.lineHeight);
	vars['--typography-code-letter-spacing'] = formatLetterSpacing(code.letterSpacing);
	vars['--typography-code-weight'] = String(code.weight);

	// Override semantic color variables to support dynamic flavor selection per typography style
	// This allows components to use semantic names (e.g., text-heading) that resolve to the
	// correct foreground color based on the configured flavor for each typography style
	flavors.forEach((flavor: UJLTFlavor) => {
		vars[`--${flavor}-heading`] = `var(--${flavor}-foreground-${heading.flavor})`;
		vars[`--${flavor}-highlight`] = `var(--${flavor}-foreground-${highlight.flavor})`;
	});

	return vars;
}
