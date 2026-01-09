import type { UJLAbstractNode, UJLCModuleObject } from "@ujl-framework/types";
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
	public readonly category = "media" as const;
	public readonly tags = ["photo", "picture", "visual", "media"] as const;
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
	 * @param composer - Composer instance for composing child modules and resolving media IDs
	 * @returns Composed abstract syntax tree node
	 */
	public async compose(moduleData: UJLCModuleObject, composer: Composer): Promise<UJLAbstractNode> {
		const mediaId = this.parseField(moduleData, "image", null);
		const alt = this.parseField(moduleData, "alt", "");

		// Resolve Media ID to UJLImageData via MediaLibrary
		let imageData = null;
		if (mediaId) {
			const mediaLibrary = composer.getMediaLibrary();
			if (mediaLibrary) {
				imageData = await mediaLibrary.resolve(mediaId);
			}
		}

		return {
			type: "image",
			props: {
				image: imageData, // Resolved from Media ID, null if not found or no ID
				alt,
			},
			id: moduleData.meta.id,
		};
	}
}
