import type { UJLImageData } from "@ujl-framework/types";
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
			it("should reject non-object values", () => {
				expect(field.validate("string")).toBe(false);
				expect(field.validate(123)).toBe(false);
				expect(field.validate(true)).toBe(false);
				expect(field.validate([])).toBe(false);
			});

			it("should reject objects without dataUrl", () => {
				expect(field.validate({})).toBe(false);
				expect(field.validate({ other: "value" })).toBe(false);
			});

			it("should reject objects with non-string dataUrl", () => {
				expect(field.validate({ dataUrl: 123 })).toBe(false);
				expect(field.validate({ dataUrl: null })).toBe(false);
				expect(field.validate({ dataUrl: {} })).toBe(false);
			});
		});

		describe("valid Data-URLs", () => {
			it("should accept valid JPEG Data-URL", () => {
				const validDataUrl = "data:image/jpeg;base64,/9j/4AAQSkZJRg==";
				expect(field.validate({ dataUrl: validDataUrl })).toBe(true);
			});

			it("should accept valid PNG Data-URL", () => {
				const validDataUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==";
				expect(field.validate({ dataUrl: validDataUrl })).toBe(true);
			});

			it("should accept valid WebP Data-URL", () => {
				const validDataUrl =
					"data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=";
				expect(field.validate({ dataUrl: validDataUrl })).toBe(true);
			});

			it("should accept valid GIF Data-URL", () => {
				const validDataUrl =
					"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
				expect(field.validate({ dataUrl: validDataUrl })).toBe(true);
			});
		});

		describe("invalid Data-URL formats", () => {
			it("should reject non-image Data-URLs", () => {
				expect(field.validate({ dataUrl: "data:text/plain;base64,SGVsbG8=" })).toBe(false);
				expect(field.validate({ dataUrl: "data:application/json;base64,{}" })).toBe(false);
			});

			it("should reject Data-URLs without image prefix", () => {
				expect(field.validate({ dataUrl: "not-a-data-url" })).toBe(false);
				expect(field.validate({ dataUrl: "http://example.com/image.jpg" })).toBe(false);
			});

			it("should reject unsupported image MIME types", () => {
				expect(field.validate({ dataUrl: "data:image/svg+xml;base64,PHN2Zy8+" })).toBe(false);
				expect(field.validate({ dataUrl: "data:image/bmp;base64,Qk0=" })).toBe(false);
				expect(field.validate({ dataUrl: "data:image/tiff;base64,SUkqAA==" })).toBe(false);
			});

			it("should reject malformed Data-URLs", () => {
				expect(field.validate({ dataUrl: "data:image/" })).toBe(false);
				expect(field.validate({ dataUrl: "data:image/jpeg" })).toBe(false);
				expect(field.validate({ dataUrl: "data:" })).toBe(false);
			});
		});

		describe("edge cases", () => {
			it("should handle empty dataUrl string", () => {
				expect(field.validate({ dataUrl: "" })).toBe(false);
			});

			it("should handle dataUrl with extra properties", () => {
				const validDataUrl = "data:image/jpeg;base64,/9j/4AAQSkZJRg==";
				expect(field.validate({ dataUrl: validDataUrl, extra: "property" })).toBe(true);
			});
		});
	});

	describe("fit", () => {
		it("should return null unchanged", () => {
			expect(field.fit(null)).toBe(null);
		});

		it("should return image data unchanged", () => {
			const imageData: UJLImageData = {
				dataUrl: "data:image/jpeg;base64,/9j/4AAQSkZJRg==",
			};
			expect(field.fit(imageData)).toEqual(imageData);
		});
	});

	describe("getFieldType", () => {
		it('should return "media"', () => {
			expect(field.getFieldType()).toBe("media");
		});
	});
});
