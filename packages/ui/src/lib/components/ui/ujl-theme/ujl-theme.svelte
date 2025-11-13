<script lang="ts">
	import type { UJLTTokenSet, UJLTFlavor } from '@ujl-framework/types';
	import { flavors } from '@ujl-framework/types';
	import type { HTMLAttributes } from 'svelte/elements';
	import { formatOklch, uuid } from '$lib/tools/index.js';
	import { setUjlThemeContext } from './context.js';

	let {
		tokens,
		class: className = '',
		children,
		...restProps
	}: {
		tokens?: UJLTTokenSet;
		class?: string;
		children: import('svelte').Snippet;
		as?: keyof HTMLElementTagNameMap;
	} & HTMLAttributes<HTMLElement> = $props();

	/**
	 * Generates CSS custom properties from the theme token set.
	 * Creates variables for radius and all flavor colors (shades 50-950).
	 */
	function generateCSSVariables(tokens: UJLTTokenSet): Record<string, string> {
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
				dark: { l: number; c: number; h: number };
				darkForeground: { l: number; c: number; h: number };
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
			vars[`--${flavor}-dark`] = formatOklch(colorSet.dark);
			vars[`--${flavor}-dark-foreground`] = formatOklch(colorSet.darkForeground);
		});

		return vars;
	}

	const cssVars = $derived(tokens ? generateCSSVariables(tokens) : {});

	// Generate unique theme ID for scoping CSS variables
	const themeId = uuid();

	// Set theme ID in context (once, synchronously)
	setUjlThemeContext({ themeId });

	// Generate CSS rule targeting the theme's data attribute
	const themeCSS = $derived(
		tokens
			? `[data-ujl-theme="${themeId}"] {\n\t${Object.entries(cssVars)
					.map(([key, value]) => `\t${key}: ${value};`)
					.join('\n')}\n}`
			: ''
	);

	// Action to update style element content reactively
	function updateStyle(element: HTMLStyleElement, css: string) {
		element.textContent = css;
		return {
			update(css: string) {
				element.textContent = css;
			}
		};
	}
</script>

<div data-ujl-theme={themeId} class={className} {...restProps}>
	<style use:updateStyle={themeCSS} data-ujl-role="styles-theme"></style>
	{@render children?.()}
</div>
