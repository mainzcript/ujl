import { z } from "zod";

/**
 * Component Definition Schema
 * Describes available components in the library (templates for new instances)
 */
export const ComponentDefinitionSchema = z.object({
	type: z.string(),
	label: z.string(),
	description: z.string().optional(),
	category: z.enum(["layout", "content", "media", "interactive", "data", "navigation"]),
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
