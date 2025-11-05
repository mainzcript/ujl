import type { Composer } from "../../composer.js";
import { TextField } from "../../fields/concretes/text-field.js";
import type { UJLAbstractNode, UJLCModuleObject } from "../../types/index.js";
import { ModuleBase } from "../base.js";

/**
 * Text content module for UJL
 *
 * Displays formatted text content with configurable styling.
 * Perfect for paragraphs, descriptions, and general text content.
 */
export class TextModule extends ModuleBase {
	/** Unique identifier for this module type */
	public readonly name = "text";

	/** Field definitions available in this module */
	public readonly fields = [
		{
			key: "content",
			field: new TextField({
				label: "Text Content",
				description: "The main text content to display",
				default: "Enter your text content here",
				maxLength: 2000,
			}),
		},
	];

	/** Slot definitions for child modules */
	public readonly slots = [];

	/**
	 * Compose a text content module into an abstract syntax tree node
	 * @param moduleData - The module data from UJL document
	 * @param composer - Composer instance for composing child modules
	 * @returns Composed abstract syntax tree node
	 */
	public compose(moduleData: UJLCModuleObject, _composer: Composer): UJLAbstractNode {
		const contentField = this.fields.find(field => field.key === "content");
		const content = contentField?.field.parse(moduleData.fields.content) || "Default content";

		return {
			type: "text",
			props: {
				content,
			},
		};
	}
}
