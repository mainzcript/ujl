import defaultTheme from "@ujl-framework/examples/themes/default" with { type: "json" };
import {
	validateTokenSet,
	validateUJLTDocumentSafe,
	type UJLTDocument,
} from "@ujl-framework/types";
import { describe, expect, it } from "vitest";

describe("UJLT Schema Validation", () => {
	describe("valid.ujlt.json", () => {
		const themeData = defaultTheme;

		it("should validate successfully", () => {
			const result = validateUJLTDocumentSafe(themeData);
			expect(result.success).toBe(true);
		});

		it("should have correct structure", () => {
			const result = validateUJLTDocumentSafe(themeData);

			if (!result.success) {
				throw new Error("Validation failed");
			}

			const theme: UJLTDocument = result.data;

			expect(theme.ujlt.meta._version).toBe("0.0.1");
			expect(theme.ujlt.tokens.radius).toBe("0.75rem");
			expect(theme.ujlt.tokens.color.primary).toBeDefined();
			expect(theme.ujlt.tokens.color.ambient).toBeDefined();
		});

		it("should have valid OKLCH values", () => {
			const result = validateUJLTDocumentSafe(themeData);

			if (!result.success) {
				throw new Error("Validation failed");
			}

			const primary = result.data.ujlt.tokens.color.primary.light;

			// Lightness between 0 and 1
			expect(primary.l).toBeGreaterThanOrEqual(0);
			expect(primary.l).toBeLessThanOrEqual(1);

			// Chroma >= 0
			expect(primary.c).toBeGreaterThanOrEqual(0);

			// Hue between 0 and 360
			expect(primary.h).toBeGreaterThanOrEqual(0);
			expect(primary.h).toBeLessThanOrEqual(360);
		});

		it("should have all required flavors", () => {
			const result = validateUJLTDocumentSafe(themeData);

			if (!result.success) {
				throw new Error("Validation failed");
			}

			const colors = result.data.ujlt.tokens.color;
			const expectedFlavors = [
				"ambient",
				"primary",
				"secondary",
				"accent",
				"success",
				"warning",
				"destructive",
				"info",
			];

			expectedFlavors.forEach(flavor => {
				expect(colors[flavor as keyof typeof colors]).toBeDefined();
			});
		});

		it("should have all shade levels", () => {
			const result = validateUJLTDocumentSafe(themeData);

			if (!result.success) {
				throw new Error("Validation failed");
			}

			const shades = result.data.ujlt.tokens.color.primary.shades;
			const expectedShades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

			expectedShades.forEach(shade => {
				expect(shades[shade as keyof typeof shades]).toBeDefined();
			});
		});
	});

	describe("Invalid theme data", () => {
		it("should reject invalid lightness value", () => {
			const invalid = {
				ujlt: {
					meta: { _version: "0.0.1" },
					tokens: {
						color: {
							ambient: {
								light: { l: 2, c: 0, h: 0 }, // l > 1
								lightForeground: { l: 0.5, c: 0, h: 0 },
								dark: { l: 0.1, c: 0, h: 0 },
								darkForeground: { l: 0.9, c: 0, h: 0 },
								shades: {},
							},
							primary: {} as any,
							secondary: {} as any,
							accent: {} as any,
							success: {} as any,
							warning: {} as any,
							destructive: {} as any,
							info: {} as any,
						},
						radius: "0.5rem",
					},
				},
			};

			const result = validateUJLTDocumentSafe(invalid);
			expect(result.success).toBe(false);
		});

		it("should reject negative chroma", () => {
			const invalid = {
				ujlt: {
					meta: { _version: "0.0.1" },
					tokens: {
						color: {
							ambient: {
								light: { l: 0.5, c: -0.1, h: 0 }, // c < 0
								lightForeground: { l: 0.5, c: 0, h: 0 },
								dark: { l: 0.1, c: 0, h: 0 },
								darkForeground: { l: 0.9, c: 0, h: 0 },
								shades: {} as any,
							},
							primary: {} as any,
							secondary: {} as any,
							accent: {} as any,
							success: {} as any,
							warning: {} as any,
							destructive: {} as any,
							info: {} as any,
						},
						radius: "0.5rem",
					},
				},
			};

			const result = validateUJLTDocumentSafe(invalid);
			expect(result.success).toBe(false);
		});

		it("should reject missing meta", () => {
			const invalid = {
				ujlt: {
					// meta is missing
					tokens: {
						color: {},
						radius: "0.5rem",
					},
				},
			};

			const result = validateUJLTDocumentSafe(invalid);
			expect(result.success).toBe(false);
		});

		it("should reject invalid hue", () => {
			const invalid = {
				ujlt: {
					meta: { _version: "0.0.1" },
					tokens: {
						color: {
							ambient: {
								light: { l: 0.5, c: 0.1, h: 400 }, // h > 360
								lightForeground: { l: 0.5, c: 0, h: 0 },
								dark: { l: 0.1, c: 0, h: 0 },
								darkForeground: { l: 0.9, c: 0, h: 0 },
								shades: {} as any,
							},
							primary: {} as any,
							secondary: {} as any,
							accent: {} as any,
							success: {} as any,
							warning: {} as any,
							destructive: {} as any,
							info: {} as any,
						},
						radius: "0.5rem",
					},
				},
			};

			const result = validateUJLTDocumentSafe(invalid);
			expect(result.success).toBe(false);
		});
	});

	describe("Partial validation", () => {
		it("should validate token set only", () => {
			const themeData = defaultTheme;

			const tokens = themeData.ujlt.tokens;

			expect(() => validateTokenSet(tokens)).not.toThrow();
		});
	});
});
