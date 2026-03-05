import type { UJLCLibrary } from "@ujl-framework/types";
import { describe, expect, it } from "vitest";
import { buildImageFieldUpdatesWithAutofill } from "./image-field-autofill.js";

const library: UJLCLibrary = {
	"img-1": {
		kind: "image",
		img: { src: "data:image/png;base64,abc" },
		meta: { alt: "Asset alt text" },
	},
	"img-2": {
		kind: "image",
		img: { src: "data:image/png;base64,def" },
		meta: { alt: "   " },
	},
};

describe("buildImageFieldUpdatesWithAutofill", () => {
	it("autofills alt when module alt is empty and selected asset has alt", () => {
		const updates = buildImageFieldUpdatesWithAutofill({
			moduleType: "image",
			fieldName: "image",
			newValue: "img-1",
			currentFields: { alt: "" },
			library,
		});

		expect(updates).toEqual({
			image: "img-1",
			alt: "Asset alt text",
		});
	});

	it("does not overwrite an existing non-empty alt", () => {
		const updates = buildImageFieldUpdatesWithAutofill({
			moduleType: "image",
			fieldName: "image",
			newValue: "img-1",
			currentFields: { alt: "Manual alt" },
			library,
		});

		expect(updates).toEqual({
			image: "img-1",
		});
	});

	it("does not autofill when asset alt is empty/whitespace", () => {
		const updates = buildImageFieldUpdatesWithAutofill({
			moduleType: "image",
			fieldName: "image",
			newValue: "img-2",
			currentFields: { alt: "" },
			library,
		});

		expect(updates).toEqual({
			image: "img-2",
		});
	});

	it("returns plain field update for non-image fields", () => {
		const updates = buildImageFieldUpdatesWithAutofill({
			moduleType: "image",
			fieldName: "title",
			newValue: "Hello",
			currentFields: { alt: "" },
			library,
		});

		expect(updates).toEqual({
			title: "Hello",
		});
	});
});
