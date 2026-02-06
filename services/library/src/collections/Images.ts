import crypto from "crypto";
import type { CollectionConfig } from "payload";

/**
 * Images collection for UJL Library
 *
 * Stores images with IPTC-oriented metadata and schema.org compatibility.
 * Supports localized metadata (alt, description) and IPTC-compliant credit information.
 *
 * Privacy: Filenames are anonymized to UUIDs on upload to prevent metadata leakage.
 *
 * API endpoint: /api/images
 */
export const Images: CollectionConfig = {
	slug: "images",

	admin: {
		// Display title in admin list view (falls back to ID if empty)
		useAsTitle: "title",
	},

	access: {
		// Public read access for frontend display
		read: () => true,
		// Write operations require authentication
		create: ({ req: { user } }) => !!user,
		update: ({ req: { user } }) => !!user,
		delete: ({ req: { user } }) => !!user,
	},

	hooks: {
		// Set title fallback and anonymize filename on upload
		beforeOperation: [
			async ({ args, req, operation }) => {
				if (operation === "create" && req.file) {
					// Store original filename before anonymization
					const originalName = req.file.name.replace(/\.[^/.]+$/, "");
					if (!args.data?.title) {
						args.data = { ...args.data, title: originalName };
					}

					// Anonymize filename (privacy protection)
					const ext = req.file.name.split(".").pop() || "";
					req.file.name = `${crypto.randomUUID()}.${ext}`;
				}
				return args;
			},
		],
	},

	fields: [
		// Internal name for admin UI
		{
			name: "title",
			type: "text",
			admin: {
				description: "Internal name for this image.",
			},
		},

		// Image description (localized)
		{
			name: "description",
			type: "textarea",
			localized: true,
			admin: {
				description:
					'Optional caption shown below the image. Example: "The team celebrates the product launch at the Berlin office."',
			},
		},

		// Alt text (localized, optional)
		{
			name: "alt",
			type: "text",
			localized: true,
			admin: {
				description:
					'Describes what is visible in the image (for visually impaired users). Example: "Five people standing around a table with laptops, smiling at the camera."',
			},
		},

		// Credit / Attribution (IPTC-oriented)
		{
			name: "credit",
			type: "group",
			admin: {
				description: "Who created this image and how may it be used?",
			},
			fields: [
				{
					name: "creator",
					type: "text",
					admin: {
						description: 'The person who created the image. Example: "Jane Smith" or "Design Team"',
					},
				},
				{
					name: "creditLine",
					type: "text",
					admin: {
						description:
							'The full credit as it should appear when published (may include agency or company). Example: "Illustration: Jane Smith / UJL Inc."',
					},
				},
				{
					name: "copyrightNotice",
					type: "text",
					admin: {
						description: 'Copyright statement. Example: "© 2026 UJL Inc. All rights reserved."',
					},
				},
				{
					name: "licenseUrl",
					type: "text",
					admin: {
						description:
							'Link to the license terms. Example: "https://creativecommons.org/licenses/by/4.0/"',
					},
				},
			],
		},
	],

	upload: {
		// Storage location for uploads
		staticDir: "uploads/images",

		// Only allow image files
		mimeTypes: ["image/*"],

		// Responsive image sizes (Inspired by Tailwind CSS breakpoints)
		imageSizes: [
			{ name: "xs", width: 320, position: "center" },
			{ name: "sm", width: 640, position: "center" },
			{ name: "md", width: 768, position: "center" },
			{ name: "lg", width: 1024, position: "center" },
			{ name: "xl", width: 1280, position: "center" },
			{ name: "xxl", width: 1536, position: "center" },
			{ name: "xxxl", width: 1920, position: "center" },
			{ name: "max", width: 2560, position: "center" },
		],

		// WebP conversion for optimal performance
		formatOptions: {
			format: "webp",
			options: {
				quality: 80,
			},
		},

		// Focal point for intelligent cropping
		focalPoint: true,

		// Admin thumbnail for collection overview
		adminThumbnail: "xs",
	},
};
