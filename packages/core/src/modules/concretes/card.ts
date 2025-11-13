import type { UJLAbstractNode, UJLCModuleObject } from "@ujl-framework/types";
import type { Composer } from "../../composer.js";
import { TextField } from "../../fields/index.js";
import { ModuleBase } from "../base.js";
import { Slot } from "../slot.js";

/**
 * Feature card module for UJL
 *
 * Displays a feature with icon, title, description, and optional priority.
 * Perfect for showcasing features, benefits, or key points.
 */
export class CardModule extends ModuleBase {
	/** Unique identifier for this module type */
	public readonly name = "card";

	/** Field definitions available in this module */
	public readonly fields = [
		{
			key: "title",
			field: new TextField({
				label: "Card Title",
				description: "Name or title of the card",
				default: "",
				maxLength: 100,
			}),
		},
		{
			key: "description",
			field: new TextField({
				label: "Card Description",
				description: "Detailed description of the card",
				default: "",
				maxLength: 500,
			}),
		},
	];

	/** Slot definitions for child modules */
	public readonly slots = [
		{
			key: "content",
			slot: new Slot({
				label: "Card Content",
				description: "Add content to your card",
			}),
		},
	];

	/**
	 * Compose a feature card module into an abstract syntax tree node
	 * @param moduleData - The module data from UJL document
	 * @param composer - Composer instance for composing child modules
	 * @returns Composed abstract syntax tree node
	 */
	public compose(moduleData: UJLCModuleObject, composer: Composer): UJLAbstractNode {
		const title = (moduleData.fields.title as string) || "Default Feature";
		const description = (moduleData.fields.description as string) || "Default description";

		// Compose child modules in the items slot
		const contentSlot = moduleData.slots.content;
		const children: UJLAbstractNode[] = [];
		for (const childModule of contentSlot) {
			children.push(composer.composeModule(childModule));
		}

		return {
			type: "card",
			props: {
				title,
				description,
				children,
			},
		};
	}
}
