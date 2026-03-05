// Re-export all field-related types and classes
export * from "./fields/index.js";
export * from "./modules/index.js";
// Explicitly export ComponentCategory for better TypeScript resolution
export type { ComponentCategory } from "./modules/index.js";

/**
 * Re-export composer for easy access
 */
export { Composer } from "./composer.js";

/**
 * Re-export utility functions
 */
export { generateUid } from "./utils.js";

/**
 * Re-export TipTap schema for rich text
 */
export { getUjlRichTextSchema, ujlRichTextExtensions } from "./tiptap-schema.js";
