import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

describe("nav-tree-item template", () => {
	it("uses canInsertRoot in both root action menus", () => {
		const currentDir = dirname(fileURLToPath(import.meta.url));
		const source = readFileSync(resolve(currentDir, "nav-tree-item.svelte"), "utf8");
		const matches = [
			...source.matchAll(
				/@render actionMenu\(canCopyRoot,\s*canCutRoot,\s*(canInsertRoot|canInsert),\s*canDeleteRoot\)/g,
			),
		];

		expect(matches).toHaveLength(2);
		expect(matches.map((match) => match[1])).toEqual(["canInsertRoot", "canInsertRoot"]);
	});

	it("renders the module icon from the registry for non-root nodes", () => {
		const currentDir = dirname(fileURLToPath(import.meta.url));
		const source = readFileSync(resolve(currentDir, "nav-tree-item.svelte"), "utf8");

		expect(source).toContain("composer.getRegistry().getModule(node.type)?.getSvgIcon() ?? null");
		expect(source).toContain('data-crafter="nav-tree-item-icon"');
	});
});
