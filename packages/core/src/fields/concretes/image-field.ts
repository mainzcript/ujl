import type { UJLCFieldObject } from "@ujl-framework/types";
import { BaseFieldConfig, FieldBase } from "../base.js";
import type { FieldType } from "../types.js";

/**
 * Value type for image fields in UJLC documents (Media ID)
 * Can be string (inline storage) or number (backend storage like Payload CMS)
 * Resolved to UJLImageData during composition
 */
export type ImageFieldValue = string | number | null;

/**
 * Configuration type for media fields
 */
export type ImageFieldConfig = BaseFieldConfig<ImageFieldValue>;

/**
 * Image field implementation for UJL
 *
 * Stores Media IDs (strings) in UJLC documents.
 * Composer resolves Media IDs to UJLImageData during composition.
 */
export class ImageField extends FieldBase<ImageFieldValue, ImageFieldConfig> {
	/** Default configuration for media fields */
	protected readonly defaultConfig: ImageFieldConfig = {
		label: "Image",
		description: "Select an image file",
		default: null,
	};

	/**
	 * Validate that a raw UJL field value is a valid Media ID (string/number) or null
	 * @param raw - Raw UJL field value to validate
	 * @returns Type predicate indicating if raw value is valid Media ID or null
	 */
	public validate(raw: UJLCFieldObject): raw is ImageFieldValue {
		if (raw === null || raw === undefined) {
			return true;
		}

		// Media ID can be a non-empty string (inline) or number (backend like Payload CMS)
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
	 * Compression is handled client-side in MediaPicker to avoid blocking the composition pipeline.
	 * @see Migration Guide - Media Library Integration (Issue)
	 */
	public fit(value: ImageFieldValue): ImageFieldValue {
		return value;
	}

	/**
	 * Get the UI field type for media fields
	 * @returns "media" as the field type
	 */
	public getFieldType(): FieldType {
		return "media";
	}
}
