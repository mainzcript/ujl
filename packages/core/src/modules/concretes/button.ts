import type { UJLAbstractNode, UJLCModuleObject } from "@ujl-framework/types";
import type { Composer } from "../../composer.js";
import { TextField } from "../../fields/concretes/text-field.js";
import { ModuleBase } from "../base.js";

/**
 * Button module for UJL
 *
 * Displays a clickable button with customizable text, styling, and behavior.
 * Perfect for actions, navigation, and user interactions.
 */
export class Button extends ModuleBase {
	/** Unique identifier for this module type */
	public readonly name = "button";

	/** Field definitions available in this module */
	public readonly fields = [
		{
			key: "label",
			field: new TextField({
				label: "Button Label",
				description: "Text displayed on the button",
				default: "Click me",
				maxLength: 50,
			}),
		},
		{
			key: "href",
			field: new TextField({
				label: "Button URL",
				description: "URL the button should link to",
				default: "#",
				maxLength: 200,
			}),
		},
	];

	/** Slot definitions for child modules */
	public readonly slots = [];

	/**
	 * Compose a button module into an abstract syntax tree node
	 * @param moduleData - The module data from UJL document
	 * @param composer - Composer instance for composing child modules
	 * @returns Composed abstract syntax tree node
	 */
	public compose(moduleData: UJLCModuleObject, _composer: Composer): UJLAbstractNode {
		const labelField = this.fields.find(field => field.key === "label");
		const label = labelField?.field.parse(moduleData.fields.label) || "Click me";

		const hrefField = this.fields.find(field => field.key === "href");
		const href = hrefField?.field.parse(moduleData.fields.href) || "#";

		return {
			type: "button",
			props: {
				label,
				href,
			},
		};
	}
}
