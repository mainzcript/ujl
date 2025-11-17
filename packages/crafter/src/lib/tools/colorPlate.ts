/**
 * Color palette generation utilities.
 *
 * This module re-exports all color palette functions from specialized sub-modules
 * to maintain backward compatibility with existing imports.
 *
 * The color palette system is split into focused modules:
 * - `colorSpaces.ts`: Color space conversions and distance calculations
 * - `contrast.ts`: APCA contrast calculations and text color selection
 * - `palettes.ts`: Palette generation, interpolation, and refinement
 *
 * @module colorPlate
 */

// Re-export types and functions from specialized modules
export type { OKLab } from './colorSpaces.js';
export type { ReferenceColor, GeneratedPalette } from './palettes.js';
export { hexToOklch, oklchToHex } from './colorSpaces.js';
export {
	generateColorPalette,
	getReferencePalette,
	interpolateAmbientPalette,
	refinePaletteWithInputColor
} from './palettes.js';
