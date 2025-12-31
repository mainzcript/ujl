import StarterKit from "@tiptap/starter-kit";

/**
 * UJL Rich Text Editor Extensions
 *
 * Configured StarterKit with only serializable extensions enabled.
 *
 * Enabled extensions (serializable):
 * - Document, Paragraph, Text (base)
 * - Heading (h1-h6)
 * - Bold, Italic, Code (marks)
 * - HardBreak
 * - Blockquote
 * - HorizontalRule
 * - BulletList, OrderedList, ListItem
 *
 * Disabled extensions (not serializable or UI-only):
 * - UndoRedo (editor state only)
 * - Dropcursor (UI only)
 * - Gapcursor (UI only)
 *
 * This schema is used by both the editor (in crafter) and the serializer
 * to ensure consistency between what can be edited and what can be rendered.
 */
export const ujlRichTextExtensions = [
	StarterKit.configure({
		undoRedo: false,
		dropcursor: false,
		gapcursor: false,
	}),
];

/**
 * Get the TipTap extensions array for UJL rich text
 *
 * Returns the configured extensions array that defines the UJL rich text schema.
 * This is used by both the editor and serializer to ensure consistency.
 *
 * Note: This returns the extensions array, not a ProseMirror schema object.
 * TipTap uses extensions to build the schema internally.
 */
export function getUjlRichTextSchema() {
	return ujlRichTextExtensions;
}
