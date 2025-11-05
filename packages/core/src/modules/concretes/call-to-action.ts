import type { Composer } from "../../composer.js";
import { TextField } from "../../fields/concretes/text-field.js";
import type { UJLAbstractNode, UJLCModuleObject } from "../../types/index.js";
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
			field: new TextField({
				label: "CTA Description",
				description: "Supporting description text for the call-to-action",
				default: "Take action now and join thousands of satisfied users!",
				maxLength: 500,
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
	 * Compose a call-to-action module into an abstract syntax tree node
	 * @param moduleData - The module data from UJL document
	 * @param composer - Composer instance for composing child modules
	 * @returns Composed abstract syntax tree node
	 */
	public compose(moduleData: UJLCModuleObject, _composer: Composer): UJLAbstractNode {
		const headlineField = this.fields.find(field => field.key === "headline");
		const headline = headlineField?.field.parse(moduleData.fields.headline);
		const descriptionField = this.fields.find(field => field.key === "description");
		const description = descriptionField?.field.parse(moduleData.fields.description);

		// Handle button objects
		const primaryButtonLabelField = this.fields.find(
			field => field.key === "actionButtonPrimaryLabel"
		);
		const primaryButtonHrefField = this.fields.find(
			field => field.key === "actionButtonPrimaryUrl"
		);
		const secondaryButtonLabelField = this.fields.find(
			field => field.key === "actionButtonSecondaryLabel"
		);
		const secondaryButtonHrefField = this.fields.find(
			field => field.key === "actionButtonSecondaryUrl"
		);
		const primaryButtonLabel = primaryButtonLabelField?.field.parse(
			moduleData.fields.actionButtonPrimaryLabel
		);
		const primaryButtonHref = primaryButtonHrefField?.field.parse(
			moduleData.fields.actionButtonPrimaryUrl
		);
		const secondaryButtonLabel = secondaryButtonLabelField?.field.parse(
			moduleData.fields.actionButtonSecondaryLabel
		);
		const secondaryButtonHref = secondaryButtonHrefField?.field.parse(
			moduleData.fields.actionButtonSecondaryUrl
		);

		return {
			type: "call-to-action",
			props: {
				headline: headline ?? "",
				description: description ?? "",
				actionButtons: {
					primary: {
						type: "button",
						props: {
							label: primaryButtonLabel ?? "",
							href: primaryButtonHref ?? "",
						},
					},
					secondary: {
						type: "button",
						props: {
							label: secondaryButtonLabel ?? "",
							href: secondaryButtonHref ?? "",
						},
					},
				},
			},
		};
	}
}
