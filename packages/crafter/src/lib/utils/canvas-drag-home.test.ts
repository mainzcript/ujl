import { describe, expect, it } from "vitest";
import { createMockNode } from "../../../tests/mockData.js";
import {
	getCanvasDragHomeInsertRequests,
	getCanvasDragHomePosition,
	getCanvasDragHomeTrackedModuleIds,
} from "./canvas-drag-home.js";

describe("canvas-drag-home", () => {
	it("captures previous and next siblings for a middle module", () => {
		const root = [
			createMockNode("module-a", "text", { content: "A" }),
			createMockNode("module-b", "text", { content: "B" }),
			createMockNode("module-c", "text", { content: "C" }),
		];

		expect(getCanvasDragHomePosition(root, "module-b")).toEqual({
			ownerModuleId: null,
			slotName: "root",
			previousSiblingId: "module-a",
			nextSiblingId: "module-c",
		});
	});

	it("captures slot ownership for nested modules", () => {
		const root = [
			createMockNode(
				"container-1",
				"container",
				{},
				{
					body: [
						createMockNode("nested-a", "text", { content: "A" }),
						createMockNode("nested-b", "text", { content: "B" }),
					],
				},
			),
		];

		expect(getCanvasDragHomePosition(root, "nested-a")).toEqual({
			ownerModuleId: "container-1",
			slotName: "body",
			previousSiblingId: null,
			nextSiblingId: "nested-b",
		});
	});

	it("returns deterministic insert requests in original-position priority order", () => {
		expect(
			getCanvasDragHomeInsertRequests({
				ownerModuleId: "container-1",
				slotName: "body",
				previousSiblingId: "nested-a",
				nextSiblingId: "nested-c",
			}),
		).toEqual([
			{ targetId: "nested-c", position: "before" },
			{ targetId: "nested-a", position: "after" },
			{ targetId: "container-1", slotName: "body", position: "into" },
		]);
	});

	it("falls back to a root-slot into request for a single root item", () => {
		expect(
			getCanvasDragHomeInsertRequests({
				ownerModuleId: null,
				slotName: "root",
				previousSiblingId: null,
				nextSiblingId: null,
			}),
		).toEqual([{ targetId: "__root__", slotName: "root", position: "into" }]);
	});

	it("tracks only real home neighbors for self-hover target reconstruction", () => {
		expect(
			getCanvasDragHomeTrackedModuleIds({
				ownerModuleId: null,
				slotName: "root",
				previousSiblingId: "module-a",
				nextSiblingId: "module-c",
			}),
		).toEqual(["module-a", "module-c"]);
	});
});
