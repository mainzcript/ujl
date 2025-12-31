import type { UJLCFieldObject, UJLImageData } from "@ujl-framework/types";
import { BaseFieldConfig, FieldBase } from "../base.js";
import type { FieldType } from "../types.js";

/**
 * Value type for media fields (after parsing)
 */
export type ImageFieldValue = UJLImageData | null;

/**
 * Configuration type for media fields
 */
export type ImageFieldConfig = BaseFieldConfig<ImageFieldValue>;

/**
 * Image field implementation for UJL
 *
 * Compression handled client-side (target: <=100KB, fallback: <=200KB).
 * @see Migration Guide - Media Library Integration (Issue)
 */
export class ImageField extends FieldBase<ImageFieldValue, ImageFieldConfig> {
	/** Default configuration for media fields */
	protected readonly defaultConfig: ImageFieldConfig = {
		label: "Image",
		description: "Select an image file",
		default: null,
	};

	/**
	 * Validate that a raw UJL field value is valid image data or null
	 * @param raw - Raw UJL field value to validate
	 * @returns Type predicate indicating if raw value is valid image data or null
	 */
	public validate(raw: UJLCFieldObject): raw is ImageFieldValue {
		if (raw === null || raw === undefined) {
			return true;
		}

		if (typeof raw !== "object") {
			return false;
		}

		const obj = raw as Record<string, unknown>;

		// Check required field: dataUrl
		if (typeof obj.dataUrl !== "string") {
			return false;
		}

		// Validate dataUrl is a Base64 Data-URL with image MIME-type
		if (!obj.dataUrl.startsWith("data:image/")) {
			return false;
		}

		// Validate it's a supported image type and has base64 data
		const validMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
		const dataUrlMatch = obj.dataUrl.match(/^data:(image\/[^;]+);base64,(.+)$/);
		if (!dataUrlMatch || !validMimeTypes.includes(dataUrlMatch[1]) || !dataUrlMatch[2]) {
			return false;
		}

		return true;
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
