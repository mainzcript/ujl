import { z } from "zod";

/**
 * TODO: Component Library should be automatically generated from Module Registry
 *
 * The current approach requires manual maintenance of ComponentDefinition objects,
 * which is error-prone and creates a barrier for module developers.
 *
 * The Component Library should be generated from ModuleBase instances in the Registry:
 * - ModuleBase.name → ComponentDefinition.type
 * - ModuleBase.fields → ComponentDefinition.defaultFields (extract defaults)
 * - ModuleBase.slots → ComponentDefinition.defaultSlots (extract slot keys)
 * - ModuleBase.label → ComponentDefinition.label (needs to be added to ModuleBase)
 * - ModuleBase.description → ComponentDefinition.description (needs to be added to ModuleBase)
 * - ModuleBase.category → ComponentDefinition.category (needs to be added to ModuleBase)
 * - ModuleBase.tags → ComponentDefinition.tags (needs to be added to ModuleBase)
 *
 * See: packages/core/src/modules/base.ts for ModuleBase
 * See: packages/examples/src/components/component-library.ts for current manual implementation
 */

/**
 * Component Categories
 */
export const COMPONENT_CATEGORIES = [
	"layout",
	"content",
	"media",
	"interactive",
	"data",
	"navigation",
] as const;

/**
 * Category Labels Mapping
 * Maps category keys to human-readable display names
 */
export const CATEGORY_LABELS: Record<(typeof COMPONENT_CATEGORIES)[number], string> = {
	layout: "Layout",
	content: "Content",
	media: "Media",
	interactive: "Interactive",
	data: "Data",
	navigation: "Navigation",
} as const;

/**
 * Field Types - Defines which input component to use for each field
 */
export const FIELD_TYPES = [
	"text",
	"textarea",
	"number",
	"boolean",
	"select",
	"url",
	"email",
	"richtext",
] as const;

export type FieldType = (typeof FIELD_TYPES)[number];

/**
 * Select Option Schema
 * Used for select and radio field types
 */
export const SelectOptionSchema = z.object({
	label: z.string(),
	value: z.string(),
});

export type SelectOption = z.infer<typeof SelectOptionSchema>;

/**
 * Field Definition Schema
 * Describes how a field should be rendered and validated in the property panel
 *
 * @property type - The input component type to use
 * @property label - Human-readable label for the field
 * @property placeholder - Placeholder text for input fields
 * @property description - Help text shown below the input
 * @property required - Whether the field is required
 * @property min - Minimum value (for number types)
 * @property max - Maximum value (for number types)
 * @property step - Step value (for number types)
 * @property options - Available options (for select types)
 * @property defaultValue - Default value when creating new instances
 */
export const FieldDefinitionSchema = z.object({
	type: z.enum(FIELD_TYPES),
	label: z.string(),
	placeholder: z.string().optional(),
	description: z.string().optional(),
	required: z.boolean().optional(),
	min: z.number().optional(),
	max: z.number().optional(),
	step: z.number().optional(),
	options: z.array(SelectOptionSchema).optional(),
	defaultValue: z.unknown(),
});

export type FieldDefinition = z.infer<typeof FieldDefinitionSchema>;

/**
 * Component Definition Schema (UPDATED)
 * Describes available components in the library with their editable fields
 *
 * BREAKING CHANGE: `defaultFields` replaced with `fields` containing FieldDefinitions
 */
export const ComponentDefinitionSchema = z.object({
	type: z.string(),
	label: z.string(),
	description: z.string().optional(),
	category: z.enum(COMPONENT_CATEGORIES),
	fields: z.record(z.string(), FieldDefinitionSchema),
	defaultSlots: z.record(z.string(), z.array(z.never())).optional(),
	tags: z.array(z.string()).optional(),
});

/**
 * Component Library Schema
 */
export const ComponentLibrarySchema = z.array(ComponentDefinitionSchema);

/**
 * Component Definition Type
 */
export type ComponentDefinition = z.infer<typeof ComponentDefinitionSchema>;

/**
 * Component Category Type
 */
export type ComponentCategory = (typeof COMPONENT_CATEGORIES)[number];

/**
 * Component Library Type
 */
export type ComponentLibrary = ComponentDefinition[];

/**
 * Validator for component library
 * @param data - The component library data to validate
 * @returns The validated component library
 * @throws {ZodError} If validation fails
 */
export function validateComponentLibrary(data: unknown): ComponentDefinition[] {
	return ComponentLibrarySchema.parse(data);
}

/**
 * Helper function to get display label for a category
 * @param category - The category key
 * @returns The human-readable label
 */
export function getCategoryLabel(category: ComponentCategory): string {
	return CATEGORY_LABELS[category];
}

/**
 * Helper function to extract default values from field definitions
 * Used when creating new component instances
 *
 * @param fields - Record of field definitions
 * @returns Record of field names to their default values
 *
 * @example
 * ```ts
 * const fields = {
 *   title: { type: 'text', label: 'Title', defaultValue: 'Untitled' },
 *   count: { type: 'number', label: 'Count', defaultValue: 0 }
 * };
 * const defaults = extractDefaultValues(fields);
 * // { title: 'Untitled', count: 0 }
 * ```
 */
export function extractDefaultValues(
	fields: Record<string, FieldDefinition>
): Record<string, unknown> {
	const defaults: Record<string, unknown> = {};

	for (const [fieldName, fieldDef] of Object.entries(fields)) {
		defaults[fieldName] = fieldDef.defaultValue;
	}

	return defaults;
}
