/**
 * Field Types - Defines which input component to use for each field
 * Used by FieldBase.getFieldType() to specify UI rendering
 *
 * Currently implemented field types:
 * - "text" - TextField
 * - "number" - NumberField
 * - "richtext" - RichTextField (TipTap/ProseMirror)
 * - "media" - ImageField (Images)
 */
export const FIELD_TYPES = ["text", "number", "richtext", "media"] as const;

/**
 * Field Type
 * Used by FieldBase.getFieldType() to specify which UI component to render
 */
export type FieldType = (typeof FIELD_TYPES)[number];
