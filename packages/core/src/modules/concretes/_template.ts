import type { UJLAbstractNode, UJLCModuleObject } from "@ujl-framework/types";
import type { Composer } from "../../composer.js";
import { ModuleBase } from "../base.js";
// TODO: Import your field types as needed
// import { TextField } from "../../fields/concretes/text-field";
// import { NumberField } from "../../fields/concretes/number-field";

/**
 * Template module implementation for UJL
 *
 * TODO: Update description to match your module's purpose
 * This module provides [module functionality] with [specific features].
 */
export class TEMPLATE_Module extends ModuleBase {
	/** Unique identifier for this module type */
	public readonly name = "template"; // TODO: Change to your module type name

	/** Human-readable display name */
	public readonly label = "Template"; // TODO: Set appropriate label

	/** Description for component picker */
	public readonly description = "TODO: Add description for your module";

	/** Category for grouping modules */
	public readonly category = "content" as const; // TODO: Choose appropriate category

	/** Searchable tags for filtering */
	public readonly tags = [] as const; // TODO: Add relevant tags

	/** SVG icon content (inner content of the SVG tag, without the svg wrapper) */
	public readonly icon = '<rect width="18" height="18" x="3" y="3" rx="2"/>'; // TODO: Replace with appropriate icon SVG content

	/** Field definitions available in this module */
	public readonly fields = [
		// TODO: Add your field definitions here
		// Example:
		// {
		//     key: "title",
		//     field: new TextField({
		//         label: "Title",
		//         description: "Enter the title",
		//         default: "",
		//         maxLength: 100,
		//     }),
		// },
		// {
		//     key: "count",
		//     field: new NumberField({
		//         label: "Count",
		//         description: "Enter a number",
		//         default: 0,
		//         min: 0,
		//         max: 1000,
		//     }),
		// },
	];

	/** Slot definitions for child modules */
	public readonly slots = [
		// TODO: Add your slot definitions here
		// Example:
		// {
		//     key: "content",
		//     slot: new _Slot({
		//         max: 10,
		//         label: "Content Blocks",
		//         description: "Add up to 10 content blocks",
		//     }),
		// },
		// {
		//     key: "sidebar",
		//     slot: new _Slot({
		//         max: 1,
		//         label: "Sidebar",
		//         description: "Optional sidebar content",
		//     }),
		// },
	];

	/**
	 * Compose a template module into an abstract syntax tree node
	 * @param moduleData - The module data from UJL document
	 * @param composer - Composer instance for composing child modules
	 * @returns Composed abstract syntax tree node
	 */
	public compose(moduleData: UJLCModuleObject, _composer: Composer): UJLAbstractNode {
		// TODO: Implement your module's composition logic
		// This is a dummy implementation for now
		const children: UJLAbstractNode[] = [];

		// TODO: Compose child modules in slots
		// Example for a slot named "content":
		// const contentSlot = moduleData.slots.content;
		// for (const childModule of contentSlot) {
		//     children.push(composer.composeModule(childModule));
		// }

		// TODO: Render your module's fields here
		// Example:
		// const title = moduleData.fields.title || "Default Title";
		// const count = moduleData.fields.count || 0;

		return {
			type: "wrapper",
			props: {
				children: [
					{
						type: "raw-html",
						props: {
							content: `Module: ${moduleData.meta.id}`,
						},
						id: `${moduleData.meta.id}-raw`,
					},
					...children,
				],
			},
			id: moduleData.meta.id,
		};
	}
}

// TODO: Don't forget to re-export the module class in `../index.ts`
// Add: export { TEMPLATE_Module };
// And update the Module type union if needed
