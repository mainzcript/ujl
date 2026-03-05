import type {
	LibraryAssetImage,
	UJLAbstractNode,
	UJLCDocument,
	UJLCModuleObject,
} from "@ujl-framework/types";
import type { Composer } from "../../composer.js";
import { ImageField } from "../../fields/concretes/image-field.js";
import { TextField } from "../../fields/index.js";
import { ModuleBase } from "../base.js";

/**
 * Image module for UJL
 *
 * Displays an image with configurable alt text.
 * Perfect for photos, illustrations, and visual content.
 */
export class ImageModule extends ModuleBase {
	/** Unique identifier for this module type */
	public readonly name = "image";
	public readonly label = "Image";
	public readonly description = "Display an image with alt text";
	public readonly category = "image" as const;
	public readonly tags = ["photo", "picture", "visual", "image"] as const;
	public readonly icon =
		'<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>';

	/** Field definitions available in this module */
	public readonly fields = [
		{
			key: "image",
			field: new ImageField({
				label: "Image",
				description: "Select an image file",
				default: null,
			}),
		},
		{
			key: "alt",
			field: new TextField({
				label: "Alt Text",
				description: "Alternative text for the image (for accessibility)",
				default: "",
				maxLength: 200,
			}),
		},
	];

	/** Slot definitions for child modules */
	public readonly slots = [];

	/**
	 * Compose an image module into an abstract syntax tree node
	 * @param moduleData - The module data from UJL document
	 * @param _composer - Composer instance (unused for image modules)
	 * @param doc - The UJLC document containing the library
	 * @returns Composed abstract syntax tree node
	 */
	public async compose(
		moduleData: UJLCModuleObject,
		_composer: Composer,
		doc: UJLCDocument,
	): Promise<UJLAbstractNode> {
		const imageId = this.parseField<string | null>(moduleData, "image", null);

		// Read asset directly from document library
		const asset = imageId
			? (doc.ujlc.library[imageId] as LibraryAssetImage | undefined)
			: undefined;

		// Alt text resolution:
		// - field not present (undefined) → use asset's alt metadata
		// - field is "" → decorative image (no alt)
		// - field is "text" → use the provided text
		const rawAlt = moduleData.fields["alt"] as string | null | undefined;
		const altText =
			rawAlt === undefined || rawAlt === null
				? (asset?.meta?.alt ?? "") // Use asset alt when module field not set
				: rawAlt; // Use module value (empty string = decorative)

		return this.createNode(
			"image",
			{
				asset: asset ?? null,
				alt: altText,
			},
			moduleData,
		);
	}
}
