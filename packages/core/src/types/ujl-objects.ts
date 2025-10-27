/**
 * Complete UJL document wrapper
 *
 * This type represents a full UJL document that contains the root UJL object.
 * Useful for API responses, file formats, or when you need to wrap the UJL content
 * in a container structure.
 */
export type UJLDocument = {
	/** The root UJL object containing all layout data */
	ujl: UJLObject;
};

/**
 * Root UJL document structure containing metadata and the root slot
 */
export type UJLObject = {
	/** Document metadata including title, description, tags, and versioning info */
	meta: {
		title: string;
		description: string;
		tags: string[];
		updated_at: string;
		_version: string;
		_instance: string;
		_embedding_model_hash: string;
	};
	/** Root slot containing the main module hierarchy */
	root: UJLSlotObject;
};

/**
 * Represents a module instance in a UJL document
 *
 * Contains the module type, metadata, field values, and child slots.
 * This is the runtime representation of a module within a UJL document.
 */
export type UJLModuleObject = {
	/** Type identifier for this module */
	type: string;
	/** Module metadata including ID, timestamps, and embeddings */
	meta: {
		/** Unique identifier for this module instance */
		id: string;
		/** Last update timestamp */
		updated_at: string;
		/** Vector embedding for semantic search */
		_embedding: number[];
	};
	/** Field values indexed by field name */
	fields: Readonly<Record<string, UJLFieldObject>>;
	/** Slot configurations for child modules */
	slots: Readonly<Record<string, UJLSlotObject>>;
};

/**
 * Represents a collection of slot items (a slot)
 *
 * A slot contains an array of slot items, where each slot item
 * can contain multiple modules. The slot defines how many
 * slot items are allowed, not how many modules per slot item.
 *
 * Example: Grid slot with max 100 slot items
 * - Slot: max=100 (limits slot items)
 * - Each slot item: unlimited modules
 * - Total modules: unlimited (100+ slot items × unlimited modules)
 */
export type UJLSlotObject = UJLModuleObject[];

/**
 * Raw field value as stored in UJL documents
 *
 * Uses 'unknown' to allow any data type from UJL documents.
 * Fields must defensively handle all possible types and fall back to defaults.
 */
export type UJLFieldObject = unknown;
