import type { Composer } from "@ujl-framework/core";
import { ModuleBase, TextField } from "@ujl-framework/core";
import type { UJLAbstractNode, UJLCModuleObject } from "@ujl-framework/types";

/**
 * Escapes HTML special characters to prevent XSS when interpolating
 * user-provided text into raw-html content.
 */
function esc(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

/**
 * Example custom module for the UJL dev-demo.
 *
 * Demonstrates the standard pattern for field-only modules:
 * - Three TextField inputs (quote, author, role)
 * - No slots
 * - Renders via `raw-html` with inline styles
 *
 * See: apps/docs/src/guide/custom-modules.md
 */
export class TestimonialModule extends ModuleBase {
	readonly name = "testimonial";
	readonly label = "Testimonial";
	readonly description = "A customer quote with author attribution";
	readonly category = "content" as const;
	readonly tags = ["quote", "review", "customer", "testimonial"] as const;
	readonly icon =
		'<path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>';

	readonly fields = [
		{
			key: "quote",
			field: new TextField({
				label: "Quote",
				description: "The customer's words",
				default: "",
				maxLength: 500,
			}),
		},
		{
			key: "author",
			field: new TextField({
				label: "Author",
				description: "Full name of the person",
				default: "",
				maxLength: 100,
			}),
		},
		{
			key: "role",
			field: new TextField({
				label: "Role",
				description: "Job title or company",
				default: "",
				maxLength: 100,
			}),
		},
	];

	readonly slots = [];

	compose(moduleData: UJLCModuleObject, _composer: Composer): UJLAbstractNode {
		const quote = esc(this.parseField(moduleData, "quote", ""));
		const author = esc(this.parseField(moduleData, "author", ""));
		const role = esc(this.parseField(moduleData, "role", ""));

		return this.createNode(
			"raw-html",
			{
				content: `<figure style="margin:0;padding:calc(var(--spacing)*1.5) calc(var(--spacing)*1.5) calc(var(--spacing)*1.5) calc(var(--spacing)*2);border-left:4px solid currentColor;font-style:italic">
				<blockquote style="margin:0 0 calc(var(--spacing)*0.75);font-size:1.1em">${quote}</blockquote>
				<figcaption style="font-style:normal;font-weight:600;font-size:0.9em">${author}${role ? ` · <span style="font-weight:400">${role}</span>` : ""}</figcaption>
			</figure>`,
			},
			moduleData,
		);
	}
}
