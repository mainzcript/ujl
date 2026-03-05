import { z } from "zod";
import type { LibraryAssetImage } from "./library.js";

// Re-export types from library.ts for consumers
export type { LibraryAssetImage } from "./library.js";

/**
 * Raw field value schema
 * Uses z.unknown() to allow any data type from UJL documents
 */
const UJLCFieldObjectSchema = z.unknown();

// ============================================
// SRCSET SCHEMAS - Discriminated union for type safety
// ============================================

/** Width descriptor schema (kind: "w") - requires w property */
const WDescriptorSchema = z.object({
	kind: z.literal("w"),
	candidates: z.array(
		z.object({
			url: z.string(),
			w: z.number(),
		}),
	),
	sizes: z.string().optional(),
});

/** Density descriptor schema (kind: "x") - requires x property */
const XDescriptorSchema = z.object({
	kind: z.literal("x"),
	candidates: z.array(
		z.object({
			url: z.string(),
			x: z.number(),
		}),
	),
});

/**
 * Responsive image srcset schema
 * Supports: simple string, width descriptors (w), or density descriptors (x)
 */
const ImageSrcsetSchema = z.union([z.string(), WDescriptorSchema, XDescriptorSchema]);

/**
 * Image source for <picture> element
 */
const ImageSourceSchema = z.object({
	srcset: ImageSrcsetSchema,
	type: z.string().optional(),
	media: z.string().optional(),
});

/**
 * Library asset metadata schema
 * Known fields are typed; allows custom fields via passthrough
 * Matches ImageMetadata interface from library.ts
 */
const LibraryAssetMetaSchema = z
	.object({
		alt: z.string().optional(),
		caption: z.string().optional(),
		credits: z
			.object({
				author: z.string().optional(),
				source: z.string().optional(),
				license: z.string().optional(),
				licenseUrl: z.string().optional(),
			})
			.optional(),
		filename: z.string().optional(),
		fileSize: z.number().optional(),
		uploadedAt: z.string().optional(),
		width: z.number().optional(),
		height: z.number().optional(),
		focalPoint: z.object({ x: z.number(), y: z.number() }).optional(),
		blurDataURL: z.string().optional(),
		dominantColor: z.string().optional(),
		extensions: z.record(z.string(), z.unknown()).optional(),
	})
	.passthrough();

// ============================================
// LIBRARY ASSET SCHEMA
// ============================================

/**
 * Library asset image schema
 * Allows additional fields via passthrough for extensibility
 */
const LibraryAssetSchema = z
	.object({
		kind: z.literal("image"),
		img: z.object({
			src: z.string(),
			width: z.number().optional(),
			height: z.number().optional(),
			srcset: ImageSrcsetSchema.optional(),
		}),
		meta: LibraryAssetMetaSchema.optional(),
		sources: z.array(ImageSourceSchema).optional(),
	})
	.passthrough();

/**
 * Library object schema (record of library assets)
 */
const LibraryObjectSchema = z.record(z.string(), LibraryAssetSchema);

/**
 * Module metadata schema
 */
const UJLCModuleMetaSchema = z.object({
	id: z.string(),
	updated_at: z.string(),
	_embedding: z.array(z.number()),
});

/**
 * Module object schema (recursive structure)
 * We need to use z.lazy() for the recursive slots
 */
const UJLCModuleObjectSchema: z.ZodType<{
	type: string;
	meta: {
		id: string;
		updated_at: string;
		_embedding: number[];
	};
	fields: Record<string, unknown>;
	slots: Record<string, UJLCModuleObject[]>;
}> = z.lazy(() =>
	z.object({
		type: z.string(),
		meta: UJLCModuleMetaSchema,
		fields: z.record(z.string(), UJLCFieldObjectSchema),
		slots: z.record(z.string(), z.array(UJLCModuleObjectSchema)),
	}),
);

/**
 * Slot object schema (array of modules)
 */
const UJLCSlotObjectSchema = z.array(UJLCModuleObjectSchema);

/**
 * Library provider configuration schema.
 *
 * Only routing information is stored in the document — credentials
 * are never persisted and are passed at runtime via LibraryOptions.
 *
 *   - inline:  no extra fields (assets stored in document)
 */
const LibraryProviderConfigSchema = z.object({
	provider: z.literal("inline"),
});

/**
 * Document metadata schema
 */
const UJLCDocumentMetaSchema = z.object({
	title: z.string(),
	description: z.string(),
	tags: z.array(z.string()),
	updated_at: z.string(),
	_version: z.string(),
	_instance: z.string(),
	_embedding_model_hash: z.string(),
	_library: LibraryProviderConfigSchema.optional().default({ provider: "inline" }),
});

/**
 * Root UJLC object schema
 */
const UJLCObjectSchema = z.object({
	meta: UJLCDocumentMetaSchema,
	library: LibraryObjectSchema.default({}),
	root: UJLCSlotObjectSchema,
});

/**
 * Complete UJLC document wrapper schema
 */
export const UJLCDocumentSchema = z.object({
	ujlc: UJLCObjectSchema,
});

// ============================================
// TYPE EXPORTS - generated from Zod Schemas
// ============================================

export type UJLCFieldObject = z.infer<typeof UJLCFieldObjectSchema>;
export type UJLCModuleMeta = z.infer<typeof UJLCModuleMetaSchema>;
export type UJLCModuleObject = z.infer<typeof UJLCModuleObjectSchema>;
export type UJLCSlotObject = z.infer<typeof UJLCSlotObjectSchema>;
export type UJLCDocumentMeta = z.infer<typeof UJLCDocumentMetaSchema>;
export type UJLCLibrary = Record<string, LibraryAssetImage>;
export type LibraryProviderConfig = z.infer<typeof LibraryProviderConfigSchema>;
export type UJLCObject = z.infer<typeof UJLCObjectSchema>;
export type UJLCDocument = z.infer<typeof UJLCDocumentSchema>;

// Export inferred srcset types for consumers
export type ImageSrcSetType = z.infer<typeof ImageSrcsetSchema>;
export type ImageSource = z.infer<typeof ImageSourceSchema>;
export type LibraryAssetMeta = z.infer<typeof LibraryAssetMetaSchema>;

// ============================================
// VALIDATOR FUNCTIONS
// ============================================

/**
 * Validates a UJLC document
 * @param data - The UJLC document data to validate
 * @returns The validated UJLC document object
 * @throws {ZodError} If validation fails
 */
export function validateUJLCDocument(data: unknown): UJLCDocument {
	return UJLCDocumentSchema.parse(data);
}

/**
 * Safely validates a UJLC document without throwing
 * @param data - The UJLC document data to validate
 * @returns Success object with data or error object with issues
 */
export function validateUJLCDocumentSafe(data: unknown) {
	return UJLCDocumentSchema.safeParse(data);
}

/**
 * Validates a single module
 * @param data - The module data to validate
 * @returns The validated module object
 * @throws {ZodError} If validation fails
 */
export function validateModule(data: unknown): UJLCModuleObject {
	return UJLCModuleObjectSchema.parse(data);
}

/**
 * Validates a slot (array of modules)
 * @param data - The slot data to validate
 * @returns The validated slot object
 * @throws {ZodError} If validation fails
 */
export function validateSlot(data: unknown): UJLCSlotObject {
	return UJLCSlotObjectSchema.parse(data);
}
