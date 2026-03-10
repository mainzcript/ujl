import type { UJLTColorShades } from "@ujl-framework/types";
import { toColorShades } from "./conversion.ts";
import tailwindColorsJson from "./refColors.data.json";
import type { ColorShades } from "./types.ts";

const tailwindColors = tailwindColorsJson as Record<string, UJLTColorShades>;

/**
 * Reference color palettes converted to Color objects.
 * Converted once at module load for better performance.
 */
export const REF_COLORS: Record<string, ColorShades> = Object.fromEntries(
	Object.entries(tailwindColors).map(([colorName, shades]) => [colorName, toColorShades(shades)]),
) as Record<string, ColorShades>;
