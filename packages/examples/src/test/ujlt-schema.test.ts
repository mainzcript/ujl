import defaultTheme from "@ujl-framework/examples/themes/default" with { type: "json" };
import {
	colorShades,
	resolveColorFromShades,
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
			expect(theme.ujlt.tokens.radius).toBe(0.75);
			expect(theme.ujlt.tokens.spacing).toBe(0.25);
			expect(theme.ujlt.tokens.color.primary).toBeDefined();
			expect(theme.ujlt.tokens.color.ambient).toBeDefined();
			expect(theme.ujlt.tokens.typography).toBeDefined();
			expect(theme.ujlt.tokens.typography.base.font).toBe("Inter Variable");
			expect(theme.ujlt.tokens.typography.heading.weight).toBe(700);
			expect(theme.ujlt.tokens.typography.highlight.flavor).toBe("accent");
			expect(theme.ujlt.tokens.typography.highlight.bold).toBe(true);
			expect(theme.ujlt.tokens.typography.link.underline).toBe(false);
			expect(theme.ujlt.tokens.typography.link.bold).toBe(false);
			expect(theme.ujlt.tokens.typography.code.font).toBe("JetBrains Mono Variable");
		});

		it("should have valid OKLCH values", () => {
			const result = validateUJLTDocumentSafe(themeData);

			if (!result.success) {
				throw new Error("Validation failed");
			}

			const primaryColorSet = result.data.ujlt.tokens.color.primary;
			// Resolve the shade reference to get the actual OKLCH value
			const primary = resolveColorFromShades(primaryColorSet.shades, primaryColorSet.light);

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

			colorShades.forEach(shade => {
				expect(shades[shade]).toBeDefined();
			});
		});
	});

	describe("Invalid theme data", () => {
		it("should reject invalid shade key", () => {
			const invalid = {
				ujlt: {
					meta: { _version: "0.0.1" },
					tokens: {
						color: {
							ambient: {
								light: "999", // Invalid shade key
								lightForeground: {
									ambient: "50",
									primary: "50",
									secondary: "50",
									accent: "50",
									success: "50",
									warning: "50",
									destructive: "50",
									info: "50",
								},
								dark: "900",
								darkForeground: {
									ambient: "50",
									primary: "50",
									secondary: "50",
									accent: "50",
									success: "50",
									warning: "50",
									destructive: "50",
									info: "50",
								},
								shades: {
									"50": { l: 0.985, c: 0.0017, h: 262.022 },
									"100": { l: 0.967, c: 0.0027, h: 267.303 },
									"200": { l: 0.927, c: 0.0057, h: 267.286 },
									"300": { l: 0.8719, c: 0.0106, h: 267.889 },
									"400": { l: 0.7067, c: 0.0156, h: 280.567 },
									"500": { l: 0.5517, c: 0.0138, h: 285.938 },
									"600": { l: 0.4455, c: 0.0174, h: 279.571 },
									"700": { l: 0.3726, c: 0.027, h: 268.757 },
									"800": { l: 0.2775, c: 0.0296, h: 260.538 },
									"900": { l: 0.21, c: 0.0305, h: 267.348 },
									"950": { l: 0.1314, c: 0.0251, h: 264.743 },
								},
								_original: { lightHex: "#fafafa", darkHex: "#1a1a1a" },
							},
							primary: {} as any,
							secondary: {} as any,
							accent: {} as any,
							success: {} as any,
							warning: {} as any,
							destructive: {} as any,
							info: {} as any,
						},
						radius: 0.5,
						spacing: 0.25,
					},
				},
			};

			const result = validateUJLTDocumentSafe(invalid);
			expect(result.success).toBe(false);
		});

		it("should reject invalid lightness value in shades", () => {
			const invalid = {
				ujlt: {
					meta: { _version: "0.0.1" },
					tokens: {
						color: {
							ambient: {
								light: "50",
								lightForeground: {
									ambient: "50",
									primary: "50",
									secondary: "50",
									accent: "50",
									success: "50",
									warning: "50",
									destructive: "50",
									info: "50",
								},
								dark: "900",
								darkForeground: {
									ambient: "50",
									primary: "50",
									secondary: "50",
									accent: "50",
									success: "50",
									warning: "50",
									destructive: "50",
									info: "50",
								},
								shades: {
									"50": { l: 2, c: 0, h: 0 }, // l > 1
									"100": { l: 0.967, c: 0.0027, h: 267.303 },
									"200": { l: 0.927, c: 0.0057, h: 267.286 },
									"300": { l: 0.8719, c: 0.0106, h: 267.889 },
									"400": { l: 0.7067, c: 0.0156, h: 280.567 },
									"500": { l: 0.5517, c: 0.0138, h: 285.938 },
									"600": { l: 0.4455, c: 0.0174, h: 279.571 },
									"700": { l: 0.3726, c: 0.027, h: 268.757 },
									"800": { l: 0.2775, c: 0.0296, h: 260.538 },
									"900": { l: 0.21, c: 0.0305, h: 267.348 },
									"950": { l: 0.1314, c: 0.0251, h: 264.743 },
								},
								_original: { lightHex: "#fafafa", darkHex: "#1a1a1a" },
							},
							primary: {} as any,
							secondary: {} as any,
							accent: {} as any,
							success: {} as any,
							warning: {} as any,
							destructive: {} as any,
							info: {} as any,
						},
						radius: 0.5,
						spacing: 0.25,
					},
				},
			};

			const result = validateUJLTDocumentSafe(invalid);
			expect(result.success).toBe(false);
		});

		it("should reject negative chroma in shades", () => {
			const invalid = {
				ujlt: {
					meta: { _version: "0.0.1" },
					tokens: {
						color: {
							ambient: {
								light: "50",
								lightForeground: {
									ambient: "50",
									primary: "50",
									secondary: "50",
									accent: "50",
									success: "50",
									warning: "50",
									destructive: "50",
									info: "50",
								},
								dark: "900",
								darkForeground: {
									ambient: "50",
									primary: "50",
									secondary: "50",
									accent: "50",
									success: "50",
									warning: "50",
									destructive: "50",
									info: "50",
								},
								shades: {
									"50": { l: 0.5, c: -0.1, h: 0 }, // c < 0
									"100": { l: 0.967, c: 0.0027, h: 267.303 },
									"200": { l: 0.927, c: 0.0057, h: 267.286 },
									"300": { l: 0.8719, c: 0.0106, h: 267.889 },
									"400": { l: 0.7067, c: 0.0156, h: 280.567 },
									"500": { l: 0.5517, c: 0.0138, h: 285.938 },
									"600": { l: 0.4455, c: 0.0174, h: 279.571 },
									"700": { l: 0.3726, c: 0.027, h: 268.757 },
									"800": { l: 0.2775, c: 0.0296, h: 260.538 },
									"900": { l: 0.21, c: 0.0305, h: 267.348 },
									"950": { l: 0.1314, c: 0.0251, h: 264.743 },
								},
								_original: { lightHex: "#fafafa", darkHex: "#1a1a1a" },
							},
							primary: {} as any,
							secondary: {} as any,
							accent: {} as any,
							success: {} as any,
							warning: {} as any,
							destructive: {} as any,
							info: {} as any,
						},
						radius: 0.5,
						spacing: 0.25,
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
						radius: 0.5,
						spacing: 0.25,
					},
				},
			};

			const result = validateUJLTDocumentSafe(invalid);
			expect(result.success).toBe(false);
		});

		it("should reject invalid hue in shades", () => {
			const invalid = {
				ujlt: {
					meta: { _version: "0.0.1" },
					tokens: {
						color: {
							ambient: {
								light: "50",
								lightForeground: {
									ambient: "50",
									primary: "50",
									secondary: "50",
									accent: "50",
									success: "50",
									warning: "50",
									destructive: "50",
									info: "50",
								},
								dark: "900",
								darkForeground: {
									ambient: "50",
									primary: "50",
									secondary: "50",
									accent: "50",
									success: "50",
									warning: "50",
									destructive: "50",
									info: "50",
								},
								shades: {
									"50": { l: 0.5, c: 0.1, h: 400 }, // h > 360
									"100": { l: 0.967, c: 0.0027, h: 267.303 },
									"200": { l: 0.927, c: 0.0057, h: 267.286 },
									"300": { l: 0.8719, c: 0.0106, h: 267.889 },
									"400": { l: 0.7067, c: 0.0156, h: 280.567 },
									"500": { l: 0.5517, c: 0.0138, h: 285.938 },
									"600": { l: 0.4455, c: 0.0174, h: 279.571 },
									"700": { l: 0.3726, c: 0.027, h: 268.757 },
									"800": { l: 0.2775, c: 0.0296, h: 260.538 },
									"900": { l: 0.21, c: 0.0305, h: 267.348 },
									"950": { l: 0.1314, c: 0.0251, h: 264.743 },
								},
								_original: { lightHex: "#fafafa", darkHex: "#1a1a1a" },
							},
							primary: {} as any,
							secondary: {} as any,
							accent: {} as any,
							success: {} as any,
							warning: {} as any,
							destructive: {} as any,
							info: {} as any,
						},
						radius: 0.5,
						spacing: 0.25,
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
