/**
 * Color utilities and palette generation.
 *
 * This module provides a unified interface for all color-related functions.
 *
 * The color system is organized into focused modules:
 * - `conversion.ts`: Color space conversions (OKLCH ↔ Color ↔ Hex)
 * - `shades.ts`: Color shade generation and manipulation
 * - `contrast.ts`: APCA contrast calculations and foreground color selection
 * - `palette.ts`: High-level palette update functions
 * - `refColors.ts`: Tailwind reference color data
 * - `types.ts`: Type definitions for color operations
 * - `easing.ts`: Utility functions (easing, etc.)
 *
 * @module colors
 */

// Re-export conversion utilities
export { oklchToHex, formatOklch, getBaseHexFromColorSet } from './conversion.ts';

// Re-export palette update functions
export { updateFlavorByOriginal } from './palette.ts';

// Re-export shade generation
export { generateColorShades, generateColorShadesLightDark } from './shades.ts';

// Re-export contrast utilities
export { pickFgColor, pickSimilarFgColor } from './contrast.ts';
