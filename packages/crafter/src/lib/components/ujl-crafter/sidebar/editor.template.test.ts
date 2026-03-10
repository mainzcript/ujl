import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

describe("editor sidebar template", () => {
	it("uses clipboard persistence for slot copy/cut handlers", () => {
		const currentDir = dirname(fileURLToPath(import.meta.url));
		const source = readFileSync(resolve(currentDir, "editor.svelte"), "utf8");

		const copyMatch = source.match(/onSlotCopy=\{\(parentId, slotName\) => \{([\s\S]*?)\}\}/);
		expect(copyMatch?.[1]).toContain("crafter.setClipboard(slotData)");
		expect(copyMatch?.[1]).toContain("writeToBrowserClipboard(slotData)");
		expect(copyMatch?.[1]).not.toContain("crafter.performPaste");

		const cutMatch = source.match(/onSlotCut=\{\(parentId, slotName\) => \{([\s\S]*?)\}\}/);
		expect(cutMatch?.[1]).toContain("crafter.setClipboard(slotData)");
		expect(cutMatch?.[1]).toContain("writeToBrowserClipboard(slotData)");
		expect(cutMatch?.[1]).not.toContain("crafter.performPaste");
	});
});
