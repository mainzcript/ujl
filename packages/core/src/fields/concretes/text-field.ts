import type { UJLCFieldObject } from "@ujl-framework/types";
import { BaseFieldConfig, FieldBase } from "../base.js";

/**
 * Value type for text fields (after parsing)
 */
export type TextFieldValue = string;

/**
 * Configuration type for text fields
 */
export type TextFieldConfig = BaseFieldConfig<TextFieldValue> & {
	/** Maximum length of the text (0 for unlimited) */
	maxLength: number;
};

/**
 * Text field implementation for UJL
 *
 * Handles string values with configurable maximum length validation.
 * Automatically truncates values that exceed the configured maxLength.
 */
export class TextField extends FieldBase<TextFieldValue, TextFieldConfig> {
	/** Default configuration for text fields */
	protected readonly defaultConfig: TextFieldConfig = {
		label: "Text",
		description: "Enter text content",
		default: "",
		maxLength: 0,
	};

	/**
	 * Validate that a raw UJL field value is a valid string
	 * @param raw - Raw UJL field value to validate
	 * @returns Type predicate indicating if raw value is a string
	 */
	public validate(raw: UJLCFieldObject): raw is string {
		return typeof raw === "string";
	}

	/**
	 * Fit a string value to the configured maxLength constraint
	 * @param value - String value to fit
	 * @returns Fitted string value (truncated if exceeding maxLength)
	 */
	public fit(value: TextFieldValue): TextFieldValue {
		if (this.config.maxLength > 0 && value.length > this.config.maxLength) {
			return value.slice(0, this.config.maxLength);
		}
		return value;
	}
}
