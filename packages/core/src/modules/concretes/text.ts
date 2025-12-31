import type { ProseMirrorDocument, UJLAbstractNode, UJLCModuleObject } from "@ujl-framework/types";
import type { Composer } from "../../composer.js";
import { RichTextField } from "../../fields/concretes/richtext-field.js";
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
	public readonly label = "Text";
	public readonly description = "A simple text block for paragraphs and content";
	public readonly category = "content" as const;
	public readonly tags = ["paragraph", "content", "copy"] as const;
	public readonly icon =
		'<path d="M15 5h6"/><path d="M15 12h6"/><path d="M3 19h18"/><path d="m3 12 3.553-7.724a.5.5 0 0 1 .894 0L11 12"/><path d="M3.92 10h6.16"/>';

	/** Field definitions available in this module */
	public readonly fields = [
		{
			key: "content",
			field: new RichTextField({
				label: "Text Content",
				description: "The main text content to display",
				default: {
					type: "doc",
					content: [
						{
							type: "paragraph",
							content: [
								{
									type: "text",
									text: "Enter your text content here",
								},
							],
						},
					],
				},
			}),
		},
	];

	/** Slot definitions for child modules */
	public readonly slots = [];

	/**
	 * Default empty ProseMirror document
	 */
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
	 * Compose a text content module into an abstract syntax tree node
	 * @param moduleData - The module data from UJL document
	 * @param composer - Composer instance for composing child modules
	 * @returns Composed abstract syntax tree node
	 */
	public compose(moduleData: UJLCModuleObject, _composer: Composer): UJLAbstractNode {
		const content = this.parseField(moduleData, "content", this.EMPTY_DOCUMENT);

		return {
			type: "text",
			props: {
				content,
			},
			id: moduleData.meta.id,
		};
	}
}
