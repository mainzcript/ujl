import { z } from "zod";

/**
 * OKLCH color triplet schema
 * l: lightness (0..1)
 * c: chroma (>= 0)
 * h: hue (degrees, 0-360)
 */
const UJLTOklchSchema = z.object({
	l: z.number().min(0).max(1),
	c: z.number().min(0),
	h: z.number().min(0).max(360),
});

/**
 * Color shades from 50 to 950
 */
const UJLTColorShadesSchema = z.object({
	50: UJLTOklchSchema,
	100: UJLTOklchSchema,
	200: UJLTOklchSchema,
	300: UJLTOklchSchema,
	400: UJLTOklchSchema,
	500: UJLTOklchSchema,
	600: UJLTOklchSchema,
	700: UJLTOklchSchema,
	800: UJLTOklchSchema,
	900: UJLTOklchSchema,
	950: UJLTOklchSchema,
});

/**
 * Color set with light/dark mode variants and shades
 */
const UJLTColorSetSchema = z.object({
	light: UJLTOklchSchema,
	lightForeground: UJLTOklchSchema,
	lightText: UJLTOklchSchema,
	dark: UJLTOklchSchema,
	darkForeground: UJLTOklchSchema,
	darkText: UJLTOklchSchema,
	shades: UJLTColorShadesSchema,
});

/**
 * Flavor constants
 */
export const themeFlavors = ["primary", "secondary", "accent"] as const;
export const notificationFlavors = ["success", "warning", "destructive", "info"] as const;
export const flavors = ["ambient", ...themeFlavors, ...notificationFlavors] as const;

/**
 * Complete color palette schema
 */
const UJLTColorPaletteSchema = z.object({
	ambient: UJLTColorSetSchema,
	primary: UJLTColorSetSchema,
	secondary: UJLTColorSetSchema,
	accent: UJLTColorSetSchema,
	success: UJLTColorSetSchema,
	warning: UJLTColorSetSchema,
	destructive: UJLTColorSetSchema,
	info: UJLTColorSetSchema,
});

/**
 * Token set schema (colors + radius)
 */
const UJLTTokenSetSchema = z.object({
	color: UJLTColorPaletteSchema,
	radius: z.string(), // CSS border-radius value
});

/**
 * Theme metadata schema
 */
const UJLTMetaSchema = z.object({
	_version: z.string(),
});

/**
 * Root UJLT theme object schema
 */
const UJLTObjectSchema = z.object({
	meta: UJLTMetaSchema,
	tokens: UJLTTokenSetSchema,
});

/**
 * Complete UJLT document wrapper schema
 */
export const UJLTDocumentSchema = z.object({
	ujlt: UJLTObjectSchema,
});

// ============================================
// TYPE EXPORTS - generated from Zod Schemas
// ============================================

export type UJLTOklch = z.infer<typeof UJLTOklchSchema>;
export type UJLTColorShades = z.infer<typeof UJLTColorShadesSchema>;
export type UJLTColorSet = z.infer<typeof UJLTColorSetSchema>;
export type UJLTColorPalette = z.infer<typeof UJLTColorPaletteSchema>;
export type UJLTTokenSet = z.infer<typeof UJLTTokenSetSchema>;
export type UJLTMeta = z.infer<typeof UJLTMetaSchema>;
export type UJLTObject = z.infer<typeof UJLTObjectSchema>;
export type UJLTDocument = z.infer<typeof UJLTDocumentSchema>;

// Flavor types
export type UJLTThemeFlavor = (typeof themeFlavors)[number];
export type UJLTNotificationFlavor = (typeof notificationFlavors)[number];
export type UJLTFlavor = (typeof flavors)[number];

// ============================================
// VALIDATOR FUNCTIONS
// ============================================

/**
 * Validates a UJLT document
 * @param data - The UJLT document data to validate
 * @returns The validated UJLT document object
 * @throws {ZodError} If validation fails
 */
export function validateUJLTDocument(data: unknown): UJLTDocument {
	return UJLTDocumentSchema.parse(data);
}

/**
 * Safely validates a UJLT document without throwing
 * @param data - The UJLT document data to validate
 * @returns Success object with data or error object with issues
 */
export function validateUJLTDocumentSafe(data: unknown) {
	return UJLTDocumentSchema.safeParse(data);
}

/**
 * Validates a token set
 * @param data - The token set data to validate
 * @returns The validated token set object
 * @throws {ZodError} If validation fails
 */
export function validateTokenSet(data: unknown): UJLTTokenSet {
	return UJLTTokenSetSchema.parse(data);
}
