import { describe, expect, it } from "vitest";
import { createMockNode } from "../../../../../tests/mockData.js";
import {
	getSelectedModuleId,
	getSelectionParentModuleIds,
	getSelectionParentOpacity,
	SELECTION_PARENT_BASE_OPACITY,
} from "./selection-parent-indicators.js";

describe("selection-parent-indicators helpers", () => {
	it("returns parents from the direct parent outward", () => {
		const leaf = createMockNode("leaf", "button", { label: "Click me" });
		const card = createMockNode("card", "card", { title: "Card" }, { content: [leaf] });
		const section = createMockNode("section", "container", {}, { body: [card] });
		const page = createMockNode("page", "layout", {}, { main: [section] });

		expect(getSelectionParentModuleIds([page], "leaf")).toEqual(["card", "section", "page"]);
	});

	it("returns no parents when nothing is selected or a slot is selected", () => {
		const page = createMockNode("page", "layout");

		expect(getSelectionParentModuleIds([page], null)).toEqual([]);
		expect(getSelectionParentModuleIds([page], "page:body")).toEqual([]);
	});

	it("derives the module id from nested node selections and ignores slot selections", () => {
		expect(getSelectedModuleId("module-a.child.text")).toBe("module-a");
		expect(getSelectedModuleId("module-a:body")).toBeNull();
	});

	it("halves the parent opacity with each additional level", () => {
		expect(SELECTION_PARENT_BASE_OPACITY).toBe(0.5);
		expect(getSelectionParentOpacity(0)).toBe(0.5);
		expect(getSelectionParentOpacity(1)).toBe(0.25);
		expect(getSelectionParentOpacity(2)).toBe(0.125);
	});
});
