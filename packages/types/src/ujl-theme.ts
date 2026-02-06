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
 * Shade keys array - single source of truth for all shade values
 */
export const colorShades = [
	"50",
	"100",
	"200",
	"300",
	"400",
	"500",
	"600",
	"700",
	"800",
	"900",
	"950",
] as const;

/**
 * Type for shade keys (50 | 100 | 200 | ... | 950)
 */
export type UJLTShadeKey = (typeof colorShades)[number];

/**
 * Shade reference schema - references a shade key (e.g., "600", "900")
 */
const UJLTShadeRefSchema = z.enum(colorShades);

/**
 * Type for shade references
 */
export type UJLTShadeRef = UJLTShadeKey;

/**
 * Color shades from 50 to 950
 */
const UJLTColorShadesSchema = z.object({
	"50": UJLTOklchSchema,
	"100": UJLTOklchSchema,
	"200": UJLTOklchSchema,
	"300": UJLTOklchSchema,
	"400": UJLTOklchSchema,
	"500": UJLTOklchSchema,
	"600": UJLTOklchSchema,
	"700": UJLTOklchSchema,
	"800": UJLTOklchSchema,
	"900": UJLTOklchSchema,
	"950": UJLTOklchSchema,
});

/**
 * Foreground color map for all flavors on a given background
 * Each entry is a shade reference pointing to a shade in the foreground flavor's palette
 */
const UJLTPaletteForegroundMapSchema = z.object({
	ambient: UJLTShadeRefSchema,
	primary: UJLTShadeRefSchema,
	secondary: UJLTShadeRefSchema,
	accent: UJLTShadeRefSchema,
	success: UJLTShadeRefSchema,
	warning: UJLTShadeRefSchema,
	destructive: UJLTShadeRefSchema,
	info: UJLTShadeRefSchema,
});

/**
 * Base color set schema without _original field.
 * Contains light/dark mode variants, full foreground palette and shades.
 *
 * Only `shades` contains actual OKLCH color values. All other fields (`light`, `dark`,
 * `lightForeground`, `darkForeground`) are shade references that point to entries in `shades`.
 *
 * For a given background flavor B, `lightForeground[F]` / `darkForeground[F]`
 * contain the shade reference for the recommended text color when using foreground
 * flavor F on background B in light/dark mode.
 */
const UJLTColorSetBaseSchema = z.object({
	light: UJLTShadeRefSchema,
	lightForeground: UJLTPaletteForegroundMapSchema,
	dark: UJLTShadeRefSchema,
	darkForeground: UJLTPaletteForegroundMapSchema,
	shades: UJLTColorShadesSchema,
});

/**
 * Standard color set schema for non-ambient flavors (primary, secondary, accent, etc.).
 * Uses a single hex color as the original input.
 */
const UJLTStandardColorSetSchema = UJLTColorSetBaseSchema.extend({
	_original: z.object({ hex: z.string() }),
});

/**
 * Ambient color set schema.
 * Uses separate light and dark hex colors as the original input.
 */
const UJLTAmbientColorSetSchema = UJLTColorSetBaseSchema.extend({
	_original: z.object({
		lightHex: z.string(),
		darkHex: z.string(),
	}),
});

/**
 * @deprecated Use UJLTStandardColorSet['_original'] or UJLTAmbientColorSet['_original'] instead.
 * Original color input type - either a single hex color or separate light/dark hex colors.
 * This represents the user's original color input before palette generation.
 */
export type UJLTOriginalColor = { hex: string } | { lightHex: string; darkHex: string };

/**
 * Flavor constants
 */
export const themeFlavors = ["primary", "secondary", "accent"] as const;
export const notificationFlavors = ["success", "warning", "destructive", "info"] as const;
export const flavors = ["ambient", ...themeFlavors, ...notificationFlavors] as const;

/**
 * Typography flavor constants - only base flavors, no notification flavors
 */
export const typographyFlavors = ["ambient", "primary", "secondary", "accent"] as const;

/**
 * Complete color palette schema
 * Ambient uses UJLTAmbientColorSetSchema (with lightHex/darkHex),
 * all other flavors use UJLTStandardColorSetSchema (with hex).
 */
const UJLTColorPaletteSchema = z.object({
	ambient: UJLTAmbientColorSetSchema,
	primary: UJLTStandardColorSetSchema,
	secondary: UJLTStandardColorSetSchema,
	accent: UJLTStandardColorSetSchema,
	success: UJLTStandardColorSetSchema,
	warning: UJLTStandardColorSetSchema,
	destructive: UJLTStandardColorSetSchema,
	info: UJLTStandardColorSetSchema,
});

/**
 * Font weight schema - numeric values 100-900 as integers.
 * Uses number type (not string) as per Design Tokens Format Module best practices.
 * Font weight is a CSS value, not an object key, so it doesn't need to be a string like shade keys.
 */
const UJLTFontWeightSchema = z.number().int().min(100).max(900);

/** Typography style schema base (without flavor) - used for base typography */
const UJLTTypographyStyleBaseSchema = z.object({
	font: z.string(),
	size: z.number().min(0), // Relative to root font size (rem units)
	lineHeight: z.number().min(0), // Relative to element font size (em units)
	letterSpacing: z.number(), // Relative to element font size (em units)
	weight: UJLTFontWeightSchema,
	italic: z.boolean(),
	underline: z.boolean(),
	textTransform: z.enum(["none", "capitalize", "uppercase", "lowercase"]),
});

/** Base typography for body text - flavor is fixed to ambient to maintain consistency */
const UJLTTypographyBaseSchema = UJLTTypographyStyleBaseSchema;

/** Heading typography - supports flavor selection for semantic color differentiation */
const UJLTTypographyHeadingSchema = UJLTTypographyStyleBaseSchema.extend({
	flavor: z.enum(typographyFlavors),
});

/** Minimal emphasis token for inline text */
const UJLTTypographyHighlightSchema = z.object({
	flavor: z.enum(typographyFlavors),
	bold: z.boolean(),
	italic: z.boolean(),
	underline: z.boolean(),
});

/** Minimal link configuration - states handled in UI library */
const UJLTTypographyLinkSchema = z.object({
	bold: z.boolean(),
	underline: z.boolean(),
});

/** Code font family - scaling/spacing handled in UI library */
const UJLTTypographyCodeSchema = z.object({
	font: z.string(),
	size: z.number().min(0), // Relative to root font size (rem units)
	lineHeight: z.number().min(0), // Relative to element font size (em units)
	letterSpacing: z.number(), // Relative to element font size (em units)
	weight: UJLTFontWeightSchema,
});

/** Complete typography schema */
const UJLTTypographySchema = z.object({
	base: UJLTTypographyBaseSchema,
	heading: UJLTTypographyHeadingSchema,
	highlight: UJLTTypographyHighlightSchema,
	link: UJLTTypographyLinkSchema,
	code: UJLTTypographyCodeSchema,
});

/** Token set schema */
const UJLTTokenSetSchema = z.object({
	color: UJLTColorPaletteSchema,
	radius: z.number().min(0), // CSS border-radius in rem units (e.g., 0.75) - consistent with typography size
	spacing: z.number().min(0), // CSS spacing unit in rem units (e.g., 0.25)
	typography: UJLTTypographySchema,
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
export type UJLTStandardColorSet = z.infer<typeof UJLTStandardColorSetSchema>;
export type UJLTAmbientColorSet = z.infer<typeof UJLTAmbientColorSetSchema>;
/**
 * Union type for all color sets (standard or ambient).
 * Use UJLTStandardColorSet or UJLTAmbientColorSet for type-safe access.
 */
export type UJLTColorSet = UJLTStandardColorSet | UJLTAmbientColorSet;
export type UJLTColorPalette = z.infer<typeof UJLTColorPaletteSchema>;
export type UJLTTokenSet = z.infer<typeof UJLTTokenSetSchema>;
export type UJLTMeta = z.infer<typeof UJLTMetaSchema>;
export type UJLTObject = z.infer<typeof UJLTObjectSchema>;
export type UJLTDocument = z.infer<typeof UJLTDocumentSchema>;

// Typography types
export type UJLTFontWeight = z.infer<typeof UJLTFontWeightSchema>;
export type UJLTTypographyStyle = z.infer<typeof UJLTTypographyStyleBaseSchema>;
export type UJLTTypographyBase = z.infer<typeof UJLTTypographyBaseSchema>;
export type UJLTTypographyHeading = z.infer<typeof UJLTTypographyHeadingSchema>;
export type UJLTTypographyHighlight = z.infer<typeof UJLTTypographyHighlightSchema>;
export type UJLTTypographyLink = z.infer<typeof UJLTTypographyLinkSchema>;
export type UJLTTypographyCode = z.infer<typeof UJLTTypographyCodeSchema>;
export type UJLTTypography = z.infer<typeof UJLTTypographySchema>;

// Flavor types
export type UJLTThemeFlavor = (typeof themeFlavors)[number];
export type UJLTNotificationFlavor = (typeof notificationFlavors)[number];
export type UJLTFlavor = (typeof flavors)[number];
export type UJLTTypographyFlavor = (typeof typographyFlavors)[number];

// ============================================
// RESOLVER FUNCTIONS
// ============================================

/**
 * Resolves a shade reference to its OKLCH color value.
 *
 * @param shades - The color shades object containing all shade values
 * @param ref - The shade reference (e.g., "600", "900")
 * @returns The OKLCH color value for the referenced shade
 * @throws Error if the shade reference is invalid or the shade doesn't exist
 */
export function resolveColorFromShades(shades: UJLTColorShades, ref: UJLTShadeRef): UJLTOklch {
	const shade = shades[ref];
	if (!shade) {
		throw new Error(`Shade reference "${ref}" not found in shades`);
	}
	return shade;
}

/**
 * Resolved color set with actual OKLCH values instead of shade references.
 * This is a helper type for runtime resolution of shade references.
 * The _original field preserves the original input format (hex for standard, lightHex/darkHex for ambient).
 */
export type ResolvedUJLTColorSet = {
	light: UJLTOklch;
	lightForeground: Record<UJLTFlavor, UJLTOklch>;
	dark: UJLTOklch;
	darkForeground: Record<UJLTFlavor, UJLTOklch>;
	shades: UJLTColorShades;
	_original: UJLTStandardColorSet["_original"] | UJLTAmbientColorSet["_original"];
};

/**
 * Resolves a color set by converting all shade references to actual OKLCH values.
 *
 * @param colorSet - The color set with shade references
 * @returns A resolved color set with actual OKLCH values
 */
export function resolveColorSet(colorSet: UJLTColorSet): ResolvedUJLTColorSet {
	// Note: This function is incomplete - it requires the full palette context
	// to resolve foreground references. Use resolveColorPalette instead for complete resolution.
	// This function is kept for backward compatibility but returns empty foreground maps.
	const lightForeground: Record<UJLTFlavor, UJLTOklch> = {} as Record<UJLTFlavor, UJLTOklch>;
	const darkForeground: Record<UJLTFlavor, UJLTOklch> = {} as Record<UJLTFlavor, UJLTOklch>;

	return {
		light: resolveColorFromShades(colorSet.shades, colorSet.light),
		dark: resolveColorFromShades(colorSet.shades, colorSet.dark),
		lightForeground,
		darkForeground,
		shades: colorSet.shades,
		_original: colorSet._original,
	};
}

/**
 * Resolves a foreground reference to its OKLCH color value.
 * Requires the full palette to resolve foreground flavor shades.
 *
 * @param palette - The complete color palette
 * @param backgroundFlavor - The background flavor
 * @param foregroundFlavor - The foreground flavor
 * @param mode - 'light' or 'dark'
 * @returns The OKLCH color value for the foreground on the background
 */
export function resolveForegroundColor(
	palette: UJLTColorPalette,
	backgroundFlavor: UJLTFlavor,
	foregroundFlavor: UJLTFlavor,
	mode: "light" | "dark",
): UJLTOklch {
	const backgroundSet = palette[backgroundFlavor];
	const foregroundSet = palette[foregroundFlavor];
	const shadeRef =
		mode === "light"
			? backgroundSet.lightForeground[foregroundFlavor]
			: backgroundSet.darkForeground[foregroundFlavor];
	return resolveColorFromShades(foregroundSet.shades, shadeRef);
}

/**
 * Resolves a complete color palette by converting all shade references to actual OKLCH values.
 *
 * @param palette - The color palette with shade references
 * @returns A resolved color palette with actual OKLCH values
 */
export function resolveColorPalette(
	palette: UJLTColorPalette,
): Record<UJLTFlavor, ResolvedUJLTColorSet> {
	const resolved: Record<UJLTFlavor, ResolvedUJLTColorSet> = {} as Record<
		UJLTFlavor,
		ResolvedUJLTColorSet
	>;

	flavors.forEach((flavor) => {
		const colorSet = palette[flavor];
		const lightForeground: Record<UJLTFlavor, UJLTOklch> = {} as Record<UJLTFlavor, UJLTOklch>;
		const darkForeground: Record<UJLTFlavor, UJLTOklch> = {} as Record<UJLTFlavor, UJLTOklch>;

		flavors.forEach((fgFlavor) => {
			lightForeground[fgFlavor] = resolveForegroundColor(palette, flavor, fgFlavor, "light");
			darkForeground[fgFlavor] = resolveForegroundColor(palette, flavor, fgFlavor, "dark");
		});

		resolved[flavor] = {
			light: resolveColorFromShades(colorSet.shades, colorSet.light),
			dark: resolveColorFromShades(colorSet.shades, colorSet.dark),
			lightForeground,
			darkForeground,
			shades: colorSet.shades,
			_original: colorSet._original,
		};
	});

	return resolved;
}

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
