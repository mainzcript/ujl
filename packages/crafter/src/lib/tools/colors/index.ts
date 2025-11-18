/**
 * Color utilities and palette generation.
 *
 * This module provides a unified interface for all color-related functions.
 *
 * The color system is organized into focused modules:
 * - `colorSpaces.ts`: Color space conversions and distance calculations
 * - `contrast.ts`: APCA contrast calculations and text color selection
 * - `palettes.ts`: Palette generation, interpolation, and refinement
 * - `tailwindColorPlate.ts`: Tailwind reference color data
 * - `paletteToColorSet.ts`: Conversion from GeneratedPalette to UJLTColorSet
 *
 * @module colors
 */

// Re-export types
export type { GeneratedPalette } from './palettes.js';

// Re-export color space functions
export { hexToOklch, oklchToHex } from './colorSpaces.js';

// Re-export palette generation functions
export { generateColorPalette } from './palettes.js';

// Re-export palette conversion functions
export {
	mapGeneratedPaletteToColorSet,
	generateColorSetFromHex,
	getBaseHexFromColorSet
} from './paletteToColorSet.js';
