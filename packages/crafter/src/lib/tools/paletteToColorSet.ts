import type { UJLTColorSet } from '@ujl-framework/types';
import type { GeneratedPalette } from './colorPlate.js';

/**
 * Converts a GeneratedPalette to a UJLTColorSet
 * This maps the palette structure to the UJL theme token format
 */
export function mapGeneratedPaletteToColorSet(palette: GeneratedPalette): UJLTColorSet {
	return {
		light: palette.light.oklch,
		lightForeground: palette.lightFg.oklch,
		lightText: palette.lightText.oklch,
		dark: palette.dark.oklch,
		darkForeground: palette.darkFg.oklch,
		darkText: palette.darkText.oklch,
		shades: {
			50: palette.shades[50]?.oklch ?? palette.light.oklch,
			100: palette.shades[100]?.oklch ?? palette.light.oklch,
			200: palette.shades[200]?.oklch ?? palette.light.oklch,
			300: palette.shades[300]?.oklch ?? palette.light.oklch,
			400: palette.shades[400]?.oklch ?? palette.light.oklch,
			500: palette.shades[500]?.oklch ?? palette.baseOklch,
			600: palette.shades[600]?.oklch ?? palette.dark.oklch,
			700: palette.shades[700]?.oklch ?? palette.dark.oklch,
			800: palette.shades[800]?.oklch ?? palette.dark.oklch,
			900: palette.shades[900]?.oklch ?? palette.dark.oklch,
			950: palette.shades[950]?.oklch ?? palette.dark.oklch
		}
	};
}
