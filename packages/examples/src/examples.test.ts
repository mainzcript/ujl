import { validateUJLCDocumentSafe, validateUJLTDocumentSafe } from "@ujl-framework/types";
import { readdirSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const documentsDir = join(__dirname, "documents");
const themesDir = join(__dirname, "themes");

describe("Example Documents", () => {
	const documentFiles = readdirSync(documentsDir).filter((file) => file.endsWith(".ujlc.json"));

	documentFiles.forEach((filename) => {
		it(`should validate ${filename}`, () => {
			const filePath = join(documentsDir, filename);
			const fileContent = readFileSync(filePath, "utf-8");
			const document = JSON.parse(fileContent);

			const result = validateUJLCDocumentSafe(document);
			expect(result.success).toBe(true);
			if (!result.success) {
				console.error(`Validation errors for ${filename}:`, result.error);
			}
		});
	});
});

describe("Example Themes", () => {
	const themeFiles = readdirSync(themesDir).filter((file) => file.endsWith(".ujlt.json"));

	themeFiles.forEach((filename) => {
		it(`should validate ${filename}`, () => {
			const filePath = join(themesDir, filename);
			const fileContent = readFileSync(filePath, "utf-8");
			const theme = JSON.parse(fileContent);

			const result = validateUJLTDocumentSafe(theme);
			expect(result.success).toBe(true);
			if (!result.success) {
				console.error(`Validation errors for ${filename}:`, result.error);
			}
		});
	});
});
