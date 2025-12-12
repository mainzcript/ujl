import type { ComponentDefinition, ComponentLibrary, UJLCModuleObject } from "@ujl-framework/types";

import { extractDefaultValues } from "@ujl-framework/types";
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

/**
 * Component Library based on showcase.ujlc.json
 * Contains all component types used in the example document
 *
 * UPDATED: Now uses FieldDefinition objects instead of plain default values
 */
export const componentLibrary: ComponentLibrary = [
	// Layout Components
	{
		type: "container",
		label: "Container",
		description: "A container for grouping and organizing content",
		category: "layout",
		fields: {}, // Container has no editable fields
		defaultSlots: {
			body: [],
		},
		tags: ["wrapper", "section", "group"],
	},
	{
		type: "grid",
		label: "Grid",
		description: "A responsive grid layout for arranging items",
		category: "layout",
		fields: {}, // Grid has no editable fields
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
		fields: {
			content: {
				type: "textarea",
				label: "Content",
				placeholder: "Enter your text here...",
				description: "The text content to display",
				required: true,
				defaultValue: "Enter your text here...",
			},
		},
		defaultSlots: {},
		tags: ["paragraph", "content", "copy"],
	},
	{
		type: "card",
		label: "Card",
		description: "A card component with title and description",
		category: "content",
		fields: {
			title: {
				type: "text",
				label: "Title",
				placeholder: "Card Title",
				description: "The card title",
				required: true,
				defaultValue: "Card Title",
			},
			description: {
				type: "textarea",
				label: "Description",
				placeholder: "Card description goes here",
				description: "The card description text",
				required: true,
				defaultValue: "Card description goes here",
			},
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
		fields: {
			label: {
				type: "text",
				label: "Button Text",
				placeholder: "Click me",
				description: "The text displayed on the button",
				required: true,
				defaultValue: "Click me",
			},
			href: {
				type: "url",
				label: "Link URL",
				placeholder: "https://example.com",
				description: "The URL the button links to",
				required: false,
				defaultValue: "",
			},
		},
		defaultSlots: {},
		tags: ["cta", "action", "link", "click"],
	},
	{
		type: "call-to-action",
		label: "Call to Action",
		description: "A prominent call-to-action section with headline and buttons",
		category: "interactive",
		fields: {
			headline: {
				type: "text",
				label: "Headline",
				placeholder: "Ready to get started?",
				description: "The main headline text",
				required: true,
				defaultValue: "Ready to get started?",
			},
			description: {
				type: "textarea",
				label: "Description",
				placeholder: "Join us and start building amazing things",
				description: "The description text below the headline",
				required: true,
				defaultValue: "Join us and start building amazing things",
			},
			actionButtonPrimaryLabel: {
				type: "text",
				label: "Primary Button Text",
				placeholder: "Get Started",
				description: "Text for the primary action button",
				required: true,
				defaultValue: "Get Started",
			},
			actionButtonPrimaryUrl: {
				type: "url",
				label: "Primary Button URL",
				placeholder: "https://example.com",
				description: "URL for the primary action button",
				required: false,
				defaultValue: "",
			},
			actionButtonSecondaryLabel: {
				type: "text",
				label: "Secondary Button Text",
				placeholder: "Learn More",
				description: "Text for the secondary action button",
				required: false,
				defaultValue: "Learn More",
			},
			actionButtonSecondaryUrl: {
				type: "url",
				label: "Secondary Button URL",
				placeholder: "https://example.com",
				description: "URL for the secondary action button",
				required: false,
				defaultValue: "",
			},
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
export function getComponentDefinition(type: string): ComponentDefinition | undefined {
	return componentLibrary.find((comp: ComponentDefinition) => comp.type === type);
}

/**
 * Get components by category
 * @param category - The category to filter by
 * @returns Array of component definitions in that category
 */
export function getComponentsByCategory(
	category: ComponentDefinition["category"]
): ComponentLibrary {
	return componentLibrary.filter((comp: ComponentDefinition) => comp.category === category);
}

/**
 * Creates a new UJLCModuleObject from a component definition
 * UPDATED: Now uses extractDefaultValues to get field defaults
 *
 * @param definition - The component definition to create from
 * @param id - The unique ID for the new node
 * @returns A new UJLCModuleObject instance
 */
export function createNodeFromDefinition(
	definition: ComponentDefinition,
	id: string
): UJLCModuleObject {
	return {
		type: definition.type,
		fields: extractDefaultValues(definition.fields),
		slots: definition.defaultSlots ? { ...definition.defaultSlots } : {},
		meta: {
			id,
			updated_at: new Date().toISOString(),
			_embedding: [],
		},
	};
}
