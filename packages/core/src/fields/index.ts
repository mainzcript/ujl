import { NumberField, NumberFieldConfig, type NumberFieldValue } from "./concretes/number-field.js";
import { TextField, TextFieldConfig, type TextFieldValue } from "./concretes/text-field.js";

export { NumberField, TextField };
export type { NumberFieldConfig, NumberFieldValue, TextFieldConfig, TextFieldValue };
export type Field = TextField | NumberField;
