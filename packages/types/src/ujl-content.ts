import { z } from "zod";
import type { MediaLibraryEntry } from "./media.js";

/**
 * Raw field value schema
 * Uses z.unknown() to allow any data type from UJL documents
 */
const UJLCFieldObjectSchema = z.unknown();

/**
 * Media metadata schema
 */
const MediaMetadataSchema = z.object({
	filename: z.string(),
	mimeType: z.string(),
	filesize: z.number(),
	width: z.number(),
	height: z.number(),
});

/**
 * Media library entry schema
 */
const MediaLibraryEntrySchema = z.object({
	dataUrl: z.string(),
	metadata: MediaMetadataSchema,
});

/**
 * Media library object schema (record of media entries)
 */
const MediaLibraryObjectSchema = z.record(z.string(), MediaLibraryEntrySchema);

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
	})
);

/**
 * Slot object schema (array of modules)
 */
const UJLCSlotObjectSchema = z.array(UJLCModuleObjectSchema);

/**
 * Media library storage configuration schema
 */
const MediaLibraryStorageConfigSchema = z.discriminatedUnion("storage", [
	z.object({
		storage: z.literal("inline"),
	}),
	z.object({
		storage: z.literal("backend"),
		endpoint: z.string().url(),
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
	media_library: MediaLibraryStorageConfigSchema.optional().default({ storage: "inline" }),
});

/**
 * Root UJLC object schema
 */
const UJLCObjectSchema = z.object({
	meta: UJLCDocumentMetaSchema,
	media: MediaLibraryObjectSchema.default({}),
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
export type UJLCMediaLibrary = Record<string, MediaLibraryEntry>;
export type MediaLibraryStorageConfig = z.infer<typeof MediaLibraryStorageConfigSchema>;
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
