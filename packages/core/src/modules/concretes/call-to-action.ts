import type { ProseMirrorDocument, UJLAbstractNode, UJLCModuleObject } from "@ujl-framework/types";
import type { Composer } from "../../composer.js";
import { RichTextField } from "../../fields/concretes/richtext-field.js";
import { TextField } from "../../fields/concretes/text-field.js";
import { generateUid } from "../../utils.js";
import { ModuleBase } from "../base.js";

/**
 * Call-to-action module for UJL
 *
 * Displays a prominent call-to-action section with headline, description, and buttons.
 * Perfect for conversion-focused content and user engagement.
 */
export class CallToActionModule extends ModuleBase {
	/** Unique identifier for this module type */
	public readonly name = "call-to-action";
	public readonly label = "Call to Action";
	public readonly description = "A prominent call-to-action section with headline and buttons";
	public readonly category = "interactive" as const;
	public readonly tags = ["cta", "banner", "hero", "conversion", "action"] as const;
	public readonly icon =
		'<path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"/>';

	/** Field definitions available in this module */
	public readonly fields = [
		{
			key: "headline",
			field: new TextField({
				label: "CTA Headline",
				description: "Main call-to-action headline",
				default: "Ready to get started?",
				maxLength: 100,
			}),
		},
		{
			key: "description",
			field: new RichTextField({
				label: "CTA Description",
				description: "Supporting description text for the call-to-action",
				default: {
					type: "doc",
					content: [
						{
							type: "paragraph",
							content: [
								{
									type: "text",
									text: "Take action now and join thousands of satisfied users!",
								},
							],
						},
					],
				},
			}),
		},
		{
			key: "actionButtonPrimaryLabel",
			field: new TextField({
				label: "Primary Action Button",
				description: "Label for the primary action button",
				default: "Get Started",
				maxLength: 100,
			}),
		},
		{
			key: "actionButtonPrimaryUrl",
			field: new TextField({
				label: "Primary Action Button URL",
				description: "URL for the primary action button",
				default: "#",
				maxLength: 200,
			}),
		},
		{
			key: "actionButtonSecondaryLabel",
			field: new TextField({
				label: "Secondary Action Button",
				description: "Label for the secondary action button",
				default: "Learn More",
				maxLength: 100,
			}),
		},
		{
			key: "actionButtonSecondaryUrl",
			field: new TextField({
				label: "Secondary Action Button URL",
				description: "URL for the secondary action button",
				default: "#",
				maxLength: 200,
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
	 * Compose a call-to-action module into an abstract syntax tree node
	 * @param moduleData - The module data from UJL document
	 * @param composer - Composer instance for composing child modules
	 * @returns Composed abstract syntax tree node
	 */
	public compose(moduleData: UJLCModuleObject, _composer: Composer): UJLAbstractNode {
		const headline = this.parseField(moduleData, "headline", "");
		const description = this.parseField(moduleData, "description", this.EMPTY_DOCUMENT);
		const primaryButtonLabel = this.parseField(moduleData, "actionButtonPrimaryLabel", "");
		const primaryButtonHref = this.parseField(moduleData, "actionButtonPrimaryUrl", "");
		const secondaryButtonLabel = this.parseField(moduleData, "actionButtonSecondaryLabel", "");
		const secondaryButtonHref = this.parseField(moduleData, "actionButtonSecondaryUrl", "");

		return {
			type: "call-to-action",
			props: {
				headline,
				description,
				actionButtons: {
					primary: {
						type: "button",
						props: {
							label: primaryButtonLabel,
							href: primaryButtonHref,
						},
						id: generateUid(),
						meta: {
							moduleId: moduleData.meta.id,
							isModuleRoot: false,
						},
					},
					secondary: {
						type: "button",
						props: {
							label: secondaryButtonLabel,
							href: secondaryButtonHref,
						},
						id: generateUid(),
						meta: {
							moduleId: moduleData.meta.id,
							isModuleRoot: false,
						},
					},
				},
			},
			id: generateUid(),
			meta: {
				moduleId: moduleData.meta.id,
				isModuleRoot: true,
			},
		};
	}
}
