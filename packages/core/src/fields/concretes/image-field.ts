import type { UJLCFieldObject } from "@ujl-framework/types";
import { BaseFieldConfig, FieldBase } from "../base.js";
import type { FieldType } from "../types.js";

/**
 * Value type for image fields in UJLC documents (Image ID)
 * Can be string (document/library IDs) or number (legacy/external IDs)
 * Resolved against doc.ujlc.library during composition
 */
export type ImageFieldValue = string | number | null;

/**
 * Configuration type for image fields
 */
export type ImageFieldConfig = BaseFieldConfig<ImageFieldValue>;

/**
 * Image field implementation for UJL
 *
 * Stores asset IDs in UJLC documents.
 * The Composer resolves IDs against the document's library during composition.
 */
export class ImageField extends FieldBase<ImageFieldValue, ImageFieldConfig> {
	/** Default configuration for image fields */
	protected readonly defaultConfig: ImageFieldConfig = {
		label: "Image",
		description: "Select an image file",
		default: null,
	};

	/**
	 * Validate that a raw UJL field value is a valid Image ID (string/number) or null
	 * @param raw - Raw UJL field value to validate
	 * @returns Type predicate indicating if raw value is valid Image ID or null
	 */
	public validate(raw: UJLCFieldObject): raw is ImageFieldValue {
		if (raw === null || raw === undefined) {
			return true;
		}

		// Image ID can be a non-empty string (inline) or number (backend like Payload CMS)
		if (typeof raw === "string") {
			return raw.length > 0;
		}

		if (typeof raw === "number") {
			return true;
		}

		return false;
	}

	/**
	 * Fit image data to constraints
	 * @param value - Image data to fit
	 * @returns Fitted image data
	 *
	 * Compression is handled client-side in ImagePicker to avoid blocking the composition pipeline.
	 */
	public fit(value: ImageFieldValue): ImageFieldValue {
		return value;
	}

	/**
	 * Get the UI field type for image fields
	 * @returns "image" as the field type
	 */
	public getFieldType(): FieldType {
		return "image";
	}
}
