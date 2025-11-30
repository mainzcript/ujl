import type { UJLTShadeKey } from '@ujl-framework/types';
import type Color from 'colorjs.io';

/**
 * Color shade set using Color objects from colorjs.io.
 * Represents a complete palette from 50 (lightest) to 950 (darkest).
 * All shade keys from UJLTShadeKey must be present.
 */
export type ColorShades = Record<UJLTShadeKey, Color>;

/**
 * Array of color shades with their distance to a target color.
 * Ordered by distance (closest first).
 */
export type ShadesWithDistance = { key: UJLTShadeKey; distance: number }[];

/**
 * Array of reference color palettes with their distance to a target color.
 * Ordered by distance (closest first).
 */
export type RefColorsWithDistance = {
	key: string;
	shades: ColorShades;
	distance: number;
}[];
