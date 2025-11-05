import type { UJLCFieldObject } from "../../types/index.js";
import { BaseFieldConfig, FieldBase } from "../base.js";

/**
 * Value type for template fields (after parsing)
 */
export type TEMPLATE_FieldValue = string; // TODO: Change to your desired type

/**
 * Configuration type for template fields
 */
export type TEMPLATE_FieldConfig = BaseFieldConfig<TEMPLATE_FieldValue> & {
	// TODO: Add your field-specific configuration options
	// Example:
	// maxLength: number;
	// min: number;
	// max: number;
	// options: string[];
};

/**
 * Template field implementation for UJL
 *
 * TODO: Update description to match your field's purpose
 * Handles [field type] values with [specific functionality].
 */
export class TEMPLATE_Field extends FieldBase<TEMPLATE_FieldValue, TEMPLATE_FieldConfig> {
	/** Default configuration for template fields */
	protected readonly defaultConfig: TEMPLATE_FieldConfig = {
		label: "Template", // TODO: Change to your field's label
		description: "Enter template content", // TODO: Change to your field's description
		default: "", // TODO: Change to your field's default value
		// TODO: Add your field-specific default configuration
	};

	/**
	 * Validate that a raw UJL field value is a valid template type
	 * @param raw - Raw UJL field value to validate
	 * @returns Type predicate indicating if raw value is a valid template type
	 */
	public validate(raw: UJLCFieldObject): raw is TEMPLATE_FieldValue {
		// TODO: Implement type validation
		// Example for string:
		// return typeof raw === "string";

		// Example for number:
		// return typeof raw === "number";

		// Example for custom type:
		// if (typeof raw !== "object" || raw === null) {
		//     return false;
		// }
		// return this.isValidTemplateObject(raw);

		void raw; // This line is to satisfy type checks, it should be removed

		return true; // TODO: Replace with actual validation logic
	}

	/**
	 * Fit a template value to the configured constraints
	 * @param value - Template value to fit
	 * @returns Fitted template value
	 */
	public fit(value: TEMPLATE_FieldValue): TEMPLATE_FieldValue {
		// TODO: Implement constraint application
		// Examples:
		// - Truncation: value.slice(0, this.config.maxLength)
		// - Clamping: Math.max(Math.min(value, this.config.max), this.config.min)
		// - Rounding: Number(value.toFixed(this.config.decimals))
		// - Filtering: value.filter(item => this.isValidItem(item))

		return value; // TODO: Replace with actual fitting logic
	}

	// serialize() method is inherited from FieldBase with default implementation
	// Override only if you need custom serialization logic

	// TODO: Add any helper methods your field needs
	// Example:
	// private isValidTemplateObject(obj: unknown): obj is TemplateObject {
	//     return typeof obj === "object" && obj !== null && "requiredProperty" in obj;
	// }
}

// TODO: Don't forget to re-export FieldValue, FieldConfig, Field class in `../index.ts`
