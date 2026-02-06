import { ImageField, ImageFieldConfig, type ImageFieldValue } from "./concretes/image-field.js";
import { NumberField, NumberFieldConfig, type NumberFieldValue } from "./concretes/number-field.js";
import {
	RichTextField,
	RichTextFieldConfig,
	type RichTextFieldValue,
} from "./concretes/richtext-field.js";
import { TextField, TextFieldConfig, type TextFieldValue } from "./concretes/text-field.js";

export { ImageField, NumberField, RichTextField, TextField };
export type {
	ImageFieldConfig,
	ImageFieldValue,
	NumberFieldConfig,
	NumberFieldValue,
	RichTextFieldConfig,
	RichTextFieldValue,
	TextFieldConfig,
	TextFieldValue,
};
export type Field = TextField | NumberField | RichTextField | ImageField;

/**
 * Re-export FieldType
 */
export { FIELD_TYPES } from "./types.js";
export type { FieldType } from "./types.js";
