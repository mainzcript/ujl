import { describe, expect, it } from "vitest";
import { getEdgeAnchor, getGapAnchor, type RelativeRect } from "./quick-action-position.js";

function createRect(partial: Partial<RelativeRect>): RelativeRect {
	return {
		left: 0,
		right: 100,
		top: 0,
		bottom: 100,
		width: 100,
		height: 100,
		centerX: 50,
		centerY: 50,
		...partial,
	};
}

describe("quick-action-position", () => {
	it("places a vertical gap anchor between two stacked modules", () => {
		const previous = createRect({
			left: 20,
			right: 220,
			top: 20,
			bottom: 120,
			width: 200,
			centerX: 120,
			centerY: 70,
		});
		const current = createRect({
			left: 40,
			right: 200,
			top: 180,
			bottom: 280,
			width: 160,
			centerX: 120,
			centerY: 230,
		});

		expect(getGapAnchor(previous, current, "vertical")).toEqual({ x: 120, y: 150 });
	});

	it("places a horizontal gap anchor between side-by-side modules", () => {
		const current = createRect({
			left: 20,
			right: 120,
			top: 40,
			bottom: 220,
			height: 180,
			centerX: 70,
			centerY: 130,
		});
		const next = createRect({
			left: 180,
			right: 280,
			top: 80,
			bottom: 180,
			height: 100,
			centerX: 230,
			centerY: 130,
		});

		expect(getGapAnchor(current, next, "horizontal")).toEqual({ x: 150, y: 130 });
	});

	it("falls back to fromRect center on the secondary axis when intervals are disjoint", () => {
		const current = createRect({
			left: 20,
			right: 120,
			top: 40,
			bottom: 140,
			centerX: 70,
			centerY: 90,
		});
		const next = createRect({
			left: 180,
			right: 280,
			top: 220,
			bottom: 320,
			centerX: 230,
			centerY: 270,
		});

		expect(getGapAnchor(current, next, "horizontal")).toEqual({ x: 150, y: 90 });
	});

	it("keeps the vertical gap centered on the primary axis while falling back on the secondary axis", () => {
		const current = createRect({
			left: 40,
			right: 140,
			top: 180,
			bottom: 280,
			centerX: 90,
			centerY: 230,
		});
		const previous = createRect({
			left: 0,
			right: 100,
			top: 20,
			bottom: 120,
			centerX: 50,
			centerY: 70,
		});

		expect(getGapAnchor(current, previous, "vertical")).toEqual({ x: 70, y: 150 });
	});

	it("places edge anchors on the leading and trailing side of the flow", () => {
		const rect = createRect({
			left: 30,
			right: 130,
			top: 60,
			bottom: 160,
			centerX: 80,
			centerY: 110,
		});

		expect(getEdgeAnchor(rect, "vertical", "before")).toEqual({ x: 80, y: 60 });
		expect(getEdgeAnchor(rect, "vertical", "after")).toEqual({ x: 80, y: 160 });
		expect(getEdgeAnchor(rect, "horizontal", "before")).toEqual({ x: 30, y: 110 });
		expect(getEdgeAnchor(rect, "horizontal", "after")).toEqual({ x: 130, y: 110 });
	});
});
