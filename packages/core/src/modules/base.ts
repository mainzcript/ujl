import type { UJLAbstractNode, UJLCModuleObject } from "@ujl-framework/types";
import type { Composer } from "../composer.js";
import { Field } from "../fields/index.js";
import { Slot } from "./slot.js";

/**
 * Represents a single field definition within a module
 *
 * Contains the field key and the actual field instance.
 * Fields are naturally ordered by their position in the array.
 */
export type FieldEntry = {
	/** Unique identifier for this field within the module */
	key: string;
	/** The field instance that handles parsing, validation, and serialization */
	field: Field;
};

/**
 * Collection of field definitions for a module
 *
 * Array-based structure provides natural ordering without requiring explicit indices.
 * Fields are processed in the order they appear in the array.
 */
type FieldSet = ReadonlyArray<FieldEntry>;

/**
 * Represents a single slot definition within a module
 *
 * Contains the slot key and the actual slot instance.
 * Slots are naturally ordered by their position in the array.
 */
export type SlotEntry = {
	/** Unique identifier for this slot within the module */
	key: string;
	/** The slot instance that handles parsing, validation, and serialization */
	slot: Slot;
};

/**
 * Collection of slot definitions for a module
 *
 * Array-based structure provides natural ordering without requiring explicit indices.
 * Slots are processed in the order they appear in the array.
 */
type SlotSet = ReadonlyArray<SlotEntry>;

/**
 * Abstract base class for all UJL module types
 *
 * Defines the common interface that all modules must implement,
 * including their name, field definitions, slot configurations, and rendering.
 */
export abstract class ModuleBase {
	/** Unique identifier for this module type */
	public abstract readonly name: string;

	/** Field definitions available in this module */
	public abstract readonly fields: FieldSet;

	/** Slot definitions for child modules */
	public abstract readonly slots: SlotSet;

	/**
	 * Compose a module instance into an abstract syntax tree node
	 * @param moduleData - The module data from UJL document
	 * @param composer - Composer instance for composing child modules
	 * @returns Composed abstract syntax tree node
	 */
	public abstract compose(moduleData: UJLCModuleObject, composer: Composer): UJLAbstractNode;
}
