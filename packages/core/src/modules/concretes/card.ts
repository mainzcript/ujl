import type { ProseMirrorDocument, UJLAbstractNode, UJLCModuleObject } from "@ujl-framework/types";
import type { Composer } from "../../composer.js";
import { RichTextField } from "../../fields/concretes/richtext-field.js";
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
	public readonly label = "Card";
	public readonly description = "A card component with title and description";
	public readonly category = "content" as const;
	public readonly tags = ["feature", "info", "box", "panel"] as const;
	public readonly icon = '<rect width="18" height="18" x="3" y="3" rx="2"/>';

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
			field: new RichTextField({
				label: "Card Description",
				description: "Detailed description of the card",
				default: {
					type: "doc",
					content: [
						{
							type: "paragraph",
							content: [],
						},
					],
				},
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

	private readonly EMPTY_DOCUMENT: ProseMirrorDocument = {
		type: "doc",
		content: [
			{
				type: "paragraph",
				content: [],
			},
		],
	};

	/**
	 * Compose a feature card module into an abstract syntax tree node
	 * @param moduleData - The module data from UJL document
	 * @param composer - Composer instance for composing child modules
	 * @returns Composed abstract syntax tree node
	 */
	public async compose(moduleData: UJLCModuleObject, composer: Composer): Promise<UJLAbstractNode> {
		const title = this.parseField(moduleData, "title", "Card Title");
		const description = this.parseField(moduleData, "description", this.EMPTY_DOCUMENT);

		// Compose child modules in the items slot
		const contentSlot = moduleData.slots.content;
		const children: UJLAbstractNode[] = [];
		for (const childModule of contentSlot) {
			children.push(await composer.composeModule(childModule));
		}

		return {
			type: "card",
			props: {
				title,
				description,
				children,
			},
			id: moduleData.meta.id,
		};
	}
}
