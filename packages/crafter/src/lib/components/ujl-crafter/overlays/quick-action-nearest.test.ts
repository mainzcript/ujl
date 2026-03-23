import { describe, expect, it } from "vitest";
import { createMockTree } from "../../../../../tests/mockData.js";
import {
	findNearestModuleId,
	getDirectSlotChildIds,
	getSquaredDistanceToRect,
} from "./quick-action-nearest.js";

describe("quick-action-nearest utilities", () => {
	it("returns zero distance when the pointer is inside a rect", () => {
		expect(
			getSquaredDistanceToRect({ x: 50, y: 60 }, { left: 10, right: 100, top: 20, bottom: 120 }),
		).toBe(0);
	});

	it("picks the geometrically nearer module based on the bounding box distance", () => {
		const nearestId = findNearestModuleId(
			["module-a", "module-b"],
			{ x: 140, y: 40 },
			(moduleId) => {
				if (moduleId === "module-a") {
					return { left: 0, right: 80, top: 0, bottom: 80 };
				}

				if (moduleId === "module-b") {
					return { left: 180, right: 260, top: 0, bottom: 80 };
				}

				return null;
			},
		);

		expect(nearestId).toBe("module-b");
	});

	it("keeps slot order as a tie-breaker when distances are equal", () => {
		const nearestId = findNearestModuleId(["first", "second"], { x: 150, y: 50 }, (moduleId) => {
			if (moduleId === "first") {
				return { left: 0, right: 100, top: 0, bottom: 100 };
			}

			if (moduleId === "second") {
				return { left: 200, right: 300, top: 0, bottom: 100 };
			}

			return null;
		});

		expect(nearestId).toBe("first");
	});

	it("returns only the direct children of the requested slot", () => {
		const tree = createMockTree();

		expect(getDirectSlotChildIds(tree, "root-1", "body")).toEqual(["nested-1", "nested-2"]);
		expect(getDirectSlotChildIds(tree, "nested-1", "content")).toEqual(["leaf-1"]);
		expect(getDirectSlotChildIds(tree, "root-1", "content")).toEqual([]);
	});

	it("ignores nested descendants that are not direct children of the slot", () => {
		const tree = createMockTree();

		expect(getDirectSlotChildIds(tree, "root-1", "body")).not.toContain("leaf-1");
		expect(getDirectSlotChildIds(tree, "root-1", "body")).not.toContain("leaf-2");
	});
});
