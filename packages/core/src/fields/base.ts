import type { UJLCFieldObject } from "@ujl-framework/types";

/**
 * Base configuration interface for all field types
 */
export type BaseFieldConfig<ValueT> = {
	/** Human-readable label for the field */
	label: string;
	/** Description/help text for the field */
	description: string;
	/** Default value for the field */
	default: ValueT;
};

/**
 * Abstract base class for all UJL field types
 *
 * Provides a consistent interface for parsing, validating, and serializing field values
 * with configurable options and default values.
 */
export abstract class FieldBase<ValueT, ConfigT extends BaseFieldConfig<ValueT>> {
	/** User-provided configuration options */
	private _options: Partial<ConfigT>;

	/** Default configuration that must be provided by subclasses */
	protected abstract readonly defaultConfig: ConfigT;

	/**
	 * Parse a raw UJL field value into the expected type
	 * @param raw - Raw field value from UJL document
	 * @returns Parsed value of type ValueT (default if invalid, fitted if valid)
	 */
	public parse(raw: UJLCFieldObject): ValueT {
		if (!this.validate(raw)) {
			return this.config.default;
		}
		return this.fit(raw as ValueT);
	}

	/**
	 * Validate that a raw UJL field value matches the expected type
	 * @param raw - Raw UJL field value to validate
	 * @returns True if the raw value passes validation, false otherwise
	 */
	public abstract validate(raw: UJLCFieldObject): raw is ValueT;

	/**
	 * Fit a validated value to field constraints (clamping, rounding, truncation, etc.)
	 * @param value - Validated value to fit to constraints
	 * @returns Fitted value of type ValueT
	 */
	public abstract fit(value: ValueT): ValueT;

	/**
	 * Serialize a typed value back to UJL format
	 * @param value - Typed value to serialize
	 * @returns Serialized UJL field object
	 */
	public serialize(value: ValueT): UJLCFieldObject {
		// Default implementation: direct conversion
		// Override in subclasses for complex serialization needs
		return value as UJLCFieldObject;
	}

	/**
	 * Create a new field instance with optional configuration
	 * @param options - Partial configuration to override defaults
	 */
	public constructor(options: Partial<ConfigT> = {}) {
		this._options = options;
	}

	/**
	 * Get the merged configuration (defaults + user options)
	 * @returns Read-only configuration object
	 */
	public get config(): Readonly<ConfigT> {
		return {
			...this.defaultConfig,
			...this._options,
		};
	}
}
