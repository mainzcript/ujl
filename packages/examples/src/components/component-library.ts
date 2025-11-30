import type { ComponentDefinition, ComponentLibrary, UJLCModuleObject } from "@ujl-framework/types";

/**
 * TODO: This manual component library should be automatically generated from the Module Registry
 *
 * PROBLEM: This file is manually maintained and must be updated whenever modules change.
 * This creates a maintenance burden and makes it difficult for developers to add new modules.
 *
 * SOLUTION: The Component Library should be automatically generated from ModuleBase instances
 * in the ModuleRegistry. This requires:
 * 1. Extending ModuleBase with optional metadata (label, description, category, tags)
 * 2. Creating a function to convert ModuleBase instances to ComponentDefinition
 * 3. Generating the library from the registry at runtime or build time
 *
 * See: packages/core/src/modules/base.ts for ModuleBase definition
 * See: packages/core/src/modules/registry.ts for ModuleRegistry
 *
 * Component Library based on showcase.ujlc.json
 * Contains all component types used in the example document
 *
 * @deprecated This manual approach should be replaced with automatic generation from Registry
 */
export const componentLibrary: ComponentLibrary = [
	// Layout Components
	{
		type: "container",
		label: "Container",
		description: "A container for grouping and organizing content",
		category: "layout",
		defaultFields: {},
		defaultSlots: {
			body: [],
			header: [],
		},
		tags: ["wrapper", "section", "group"],
	},
	{
		type: "grid",
		label: "Grid",
		description: "A responsive grid layout for arranging items",
		category: "layout",
		defaultFields: {},
		defaultSlots: {
			items: [],
		},
		tags: ["layout", "columns", "responsive", "flex"],
	},

	// Content Components
	{
		type: "text",
		label: "Text",
		description: "A simple text block for paragraphs and content",
		category: "content",
		defaultFields: {
			content: "Enter your text here...",
		},
		defaultSlots: {},
		tags: ["paragraph", "content", "copy"],
	},
	{
		type: "card",
		label: "Card",
		description: "A card component with title and description",
		category: "content",
		defaultFields: {
			title: "Card Title",
			description: "Card description goes here",
		},
		defaultSlots: {
			content: [],
		},
		tags: ["feature", "info", "box", "panel"],
	},

	// Interactive Components
	{
		type: "button",
		label: "Button",
		description: "A clickable button with label and link",
		category: "interactive",
		defaultFields: {
			label: "Click me",
			href: "",
		},
		defaultSlots: {},
		tags: ["cta", "action", "link", "click"],
	},
	{
		type: "call-to-action",
		label: "Call to Action",
		description: "A prominent call-to-action section with headline and buttons",
		category: "interactive",
		defaultFields: {
			headline: "Ready to get started?",
			description: "Join us and start building amazing things",
			actionButtonPrimaryLabel: "Get Started",
			actionButtonPrimaryUrl: "",
			actionButtonSecondaryLabel: "Learn More",
			actionButtonSecondaryUrl: "",
		},
		defaultSlots: {},
		tags: ["cta", "banner", "hero", "conversion", "action"],
	},
];

/**
 * Get component definition by type
 * @param type - The component type to find
 * @returns The component definition or undefined if not found
 */
export function getComponentDefinition(type: string): ComponentLibrary[number] | undefined {
	return componentLibrary.find((comp: ComponentDefinition) => comp.type === type);
}

/**
 * Get components by category
 * @param category - The category to filter by
 * @returns Array of component definitions in that category
 */
export function getComponentsByCategory(
	category: ComponentLibrary[number]["category"]
): ComponentLibrary {
	return componentLibrary.filter((comp: ComponentDefinition) => comp.category === category);
}

/**
 * Creates a new UJLCModuleObject from a component definition
 * @param definition - The component definition to create from
 * @param id - The unique ID for the new node
 * @returns A new UJLCModuleObject instance
 */
export function createNodeFromDefinition(
	definition: ComponentLibrary[number],
	id: string
): UJLCModuleObject {
	return {
		type: definition.type,
		fields: { ...definition.defaultFields },
		slots: definition.defaultSlots ? { ...definition.defaultSlots } : {},
		meta: {
			id,
			updated_at: new Date().toISOString(),
			_embedding: [],
		},
	};
}
