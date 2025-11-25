import { z } from "zod";

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
 * Component Definition Schema
 * Describes available components in the library (templates for new instances)
 */
export const ComponentDefinitionSchema = z.object({
	type: z.string(),
	label: z.string(),
	description: z.string().optional(),
	category: z.enum(COMPONENT_CATEGORIES),
	defaultFields: z.record(z.string(), z.unknown()),
	defaultSlots: z.record(z.string(), z.array(z.never())).optional(),
	tags: z.array(z.string()).optional(),
});

/**
 * Component Library Schema
 */
export const ComponentLibrarySchema = z.array(ComponentDefinitionSchema);

/**
 * Component Definition Type
 * Icon field is added separately as ComponentType can't be validated by Zod
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
 * Validator for component library (validates all fields except icon)
 * @param data - The component library data to validate
 * @returns The validated component library
 * @throws {ZodError} If validation fails
 */
export function validateComponentLibrary(data: unknown): Omit<ComponentDefinition, "icon">[] {
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
