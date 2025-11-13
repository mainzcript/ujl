import type { UJLCFieldObject } from "@ujl-framework/types";
import { BaseFieldConfig, FieldBase } from "../base.js";

/**
 * Value type for number fields
 */
export type NumberFieldValue = number;

/**
 * Configuration type for number fields
 */
export type NumberFieldConfig = BaseFieldConfig<NumberFieldValue> & {
	/** Minimum allowed value (no limit if undefined) */
	min?: number;
	/** Maximum allowed value (no limit if undefined) */
	max?: number;
	/** Number of decimal places (0 for integers only) */
	decimals?: number;
};

/**
 * Number field implementation for UJL
 *
 * Handles numeric values with configurable range and decimal validation.
 * Automatically clamps values to the configured min/max range.
 */
export class NumberField extends FieldBase<NumberFieldValue, NumberFieldConfig> {
	/** Default configuration for number fields */
	protected readonly defaultConfig: NumberFieldConfig = {
		label: "Number",
		description: "Enter a numeric value",
		default: 0,
	};

	/**
	 * Parse a raw UJL field value into a number
	 * @param raw - Raw field value from UJL document
	 * @returns Parsed number value (clamped to min/max range)
	 */
	public parse(raw: UJLCFieldObject): NumberFieldValue {
		if (!this.validate(raw)) {
			return this.config.default;
		}
		// TypeScript now knows raw is number after validate()
		return this.fit(raw);
	}

	/**
	 * Fit a number value to the configured min/max range and decimal places
	 * @param value - Number value to fit
	 * @returns Fitted number value
	 */
	public fit(value: NumberFieldValue): NumberFieldValue {
		// Clamp to min/max range
		if (this.config.min !== undefined) {
			value = Math.max(value, this.config.min);
		}
		if (this.config.max !== undefined) {
			value = Math.min(value, this.config.max);
		}

		// Round to specified decimal places
		if (this.config.decimals !== undefined) {
			value = Number(value.toFixed(this.config.decimals));
		}

		return value;
	}

	/**
	 * Validate that a raw UJL field value is a valid number
	 * @param raw - Raw UJL field value to validate
	 * @returns Type predicate indicating if raw value is a number
	 */
	public validate(raw: UJLCFieldObject): raw is number {
		return typeof raw === "number";
	}
}
