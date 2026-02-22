import { z } from "zod";
import type { AssetEntry } from "./asset.js";

/**
 * Raw field value schema
 * Uses z.unknown() to allow any data type from UJL documents
 */
const UJLCFieldObjectSchema = z.unknown();

/**
 * Asset metadata schema
 *
 * mimeType and filesize are intentionally omitted — providers read them
 * directly from the File object or from the backend response.
 */
const AssetMetadataSchema = z.object({
	filename: z.string(),
	width: z.number(),
	height: z.number(),
});

/**
 * Asset entry schema
 */
const AssetEntrySchema = z.object({
	src: z.string(),
	metadata: AssetMetadataSchema,
});

/**
 * Library object schema (record of asset entries)
 */
const LibraryObjectSchema = z.record(z.string(), AssetEntrySchema);

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
 * Only routing information is stored in the document — credentials (apiKey)
 * are never persisted and are passed at runtime via LibraryOptions instead.
 *
 *   - inline:  no extra fields
 *   - backend: optional `url` (direct mode) or optional `proxyUrl` (proxy mode);
 *              both may be absent when the Crafter is configured externally at runtime.
 */
const LibraryProviderConfigSchema = z.discriminatedUnion("provider", [
	z.object({
		provider: z.literal("inline"),
	}),
	z.object({
		provider: z.literal("backend"),
		url: z.url().optional(),
		proxyUrl: z.string().optional(),
	}),
]);

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
export type UJLCLibrary = Record<string, AssetEntry>;
export type LibraryProviderConfig = z.infer<typeof LibraryProviderConfigSchema>;
export type UJLCObject = z.infer<typeof UJLCObjectSchema>;
export type UJLCDocument = z.infer<typeof UJLCDocumentSchema>;

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
