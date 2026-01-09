import { describe, expect, it } from "vitest";
import { ImageField } from "./image-field.js";

describe("ImageField", () => {
	const field = new ImageField();

	describe("validate", () => {
		describe("null and undefined handling", () => {
			it("should accept null", () => {
				expect(field.validate(null)).toBe(true);
			});

			it("should accept undefined", () => {
				expect(field.validate(undefined)).toBe(true);
			});
		});

		describe("invalid types", () => {
			it("should reject non-string and non-number values", () => {
				expect(field.validate(true)).toBe(false);
				expect(field.validate([])).toBe(false);
				expect(field.validate({})).toBe(false);
				expect(field.validate({ dataUrl: "something" })).toBe(false);
			});

			it("should reject empty strings", () => {
				expect(field.validate("")).toBe(false);
			});
		});

		describe("valid number IDs", () => {
			it("should accept number IDs (backend storage)", () => {
				expect(field.validate(123)).toBe(true);
				expect(field.validate(0)).toBe(true);
				expect(field.validate(999999)).toBe(true);
			});
		});

		describe("valid Media IDs", () => {
			it("should accept valid Media ID strings", () => {
				expect(field.validate("media-id-123")).toBe(true);
				expect(field.validate("V1StGXR8_Z")).toBe(true);
				expect(field.validate("image-abc-def-ghi")).toBe(true);
			});

			it("should accept any non-empty string", () => {
				expect(field.validate("a")).toBe(true);
				expect(field.validate("short")).toBe(true);
				expect(field.validate("very-long-media-id-string-with-many-characters")).toBe(true);
			});
		});

		describe("edge cases", () => {
			it("should reject empty string", () => {
				expect(field.validate("")).toBe(false);
			});

			it("should accept strings with special characters", () => {
				expect(field.validate("media_id-123")).toBe(true);
				expect(field.validate("media.id.456")).toBe(true);
			});
		});
	});

	describe("fit", () => {
		it("should return null unchanged", () => {
			expect(field.fit(null)).toBe(null);
		});

		it("should return Media ID string unchanged", () => {
			const mediaId = "media-id-123";
			expect(field.fit(mediaId)).toBe(mediaId);
		});
	});

	describe("getFieldType", () => {
		it('should return "media"', () => {
			expect(field.getFieldType()).toBe("media");
		});
	});
});
