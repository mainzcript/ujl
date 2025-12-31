import { validateUJLCDocumentSafe, validateUJLTDocumentSafe } from "@ujl-framework/types";
import { describe, expect, it } from "vitest";
import showcaseDocument from "./documents/showcase.ujlc.json" with { type: "json" };
import defaultTheme from "./themes/default.ujlt.json" with { type: "json" };

describe("Example Documents", () => {
	it("should validate showcase document", () => {
		const result = validateUJLCDocumentSafe(showcaseDocument);
		expect(result.success).toBe(true);
	});

	it("should validate default theme", () => {
		const result = validateUJLTDocumentSafe(defaultTheme);
		expect(result.success).toBe(true);
	});
});
