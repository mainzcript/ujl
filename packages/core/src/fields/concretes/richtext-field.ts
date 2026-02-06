import type { ProseMirrorDocument, UJLCFieldObject } from "@ujl-framework/types";
import { BaseFieldConfig, FieldBase } from "../base.js";
import type { FieldType } from "../types.js";

/**
 * Value type for rich text fields (after parsing)
 */
export type RichTextFieldValue = ProseMirrorDocument;

/**
 * Configuration type for rich text fields
 */
export type RichTextFieldConfig = BaseFieldConfig<RichTextFieldValue>;

/**
 * Default empty ProseMirror document
 */
const EMPTY_DOCUMENT: ProseMirrorDocument = {
	type: "doc",
	content: [
		{
			type: "paragraph",
			content: [],
		},
	],
};

/**
 * Rich text field implementation for UJL
 *
 * Handles ProseMirror Document values for rich text content.
 * Validates the document structure and ensures it conforms to ProseMirror format.
 */
export class RichTextField extends FieldBase<RichTextFieldValue, RichTextFieldConfig> {
	/** Default configuration for rich text fields */
	protected readonly defaultConfig: RichTextFieldConfig = {
		label: "Rich Text",
		description: "Enter rich text content with formatting",
		default: EMPTY_DOCUMENT,
	};

	/**
	 * Validate that a raw UJL field value is a valid ProseMirror Document
	 * @param raw - Raw UJL field value to validate
	 * @returns Type predicate indicating if raw value is a ProseMirror Document
	 */
	public validate(raw: UJLCFieldObject): raw is ProseMirrorDocument {
		if (typeof raw !== "object" || raw === null) {
			return false;
		}

		// Check for required "type" property
		if (!("type" in raw) || raw.type !== "doc") {
			return false;
		}

		// Check for required "content" property
		if (!("content" in raw) || !Array.isArray(raw.content)) {
			return false;
		}

		// Basic structure validation passed
		return true;
	}

	/**
	 * Fit a ProseMirror Document value to constraints
	 * @param value - ProseMirror Document value to fit
	 * @returns Fitted ProseMirror Document value
	 */
	public fit(value: RichTextFieldValue): RichTextFieldValue {
		return value;
	}

	/**
	 * Get the UI field type for rich text fields
	 * @returns "richtext" as the field type
	 */
	public getFieldType(): FieldType {
		return "richtext";
	}
}
