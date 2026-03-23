import type { UJLCModuleObject } from "@ujl-framework/types";
import { describe, expect, it } from "vitest";
import { createMockNode } from "../../../../../tests/mockData.js";
import {
	calculateQuickActionDefinitions,
	dedupeQuickActionDefinitions,
	doRectsIntersect,
	filterQuickActionDefinitionsByIslandCollision,
	getEffectiveTrackedModuleIds,
	getInsertButtonRect,
	getInsertRequestKey,
	getSlotMetrics,
	getTrackedModuleIds,
	getTransientTrackedModuleIds,
	inferSlotFlowDirection,
	INSERT_BUTTON_VISUAL_SIZE_PX,
	resolveQuickActionVisibility,
	type SlotQuickActionContext,
} from "./module-quick-actions.js";
import type { RelativeRect } from "./quick-action-position.js";

function createSiblings(ids: string[]): UJLCModuleObject[] {
	return ids.map((id) => createMockNode(id, "card", { title: id }));
}

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

function createContext(
	siblings: UJLCModuleObject[],
	slotRect: RelativeRect | null,
): SlotQuickActionContext {
	return {
		ownerModuleId: "slot-owner",
		slotName: "items",
		slotRect,
		siblings,
	};
}

function createRootContext(
	siblings: UJLCModuleObject[],
	slotRect: RelativeRect | null,
): SlotQuickActionContext {
	return {
		ownerModuleId: null,
		slotName: "root",
		slotRect,
		siblings,
	};
}

describe("module-quick-actions helpers", () => {
	it("keeps the source priority order selected > hovered > nearest", () => {
		expect(
			getTrackedModuleIds({
				selectedModuleId: "selected",
				hoveredModuleId: "hovered",
				nearestModuleId: "nearest",
			}),
		).toEqual(["selected", "hovered", "nearest"]);
	});

	it("removes duplicate module ids across selected, hovered and nearest", () => {
		expect(
			getTrackedModuleIds({
				selectedModuleId: "same",
				hoveredModuleId: "same",
				nearestModuleId: "same",
			}),
		).toEqual(["same"]);
	});

	it("derives transient tracked ids only from hovered and nearest sources", () => {
		expect(
			getTransientTrackedModuleIds({
				hoveredModuleId: "hovered",
				nearestModuleId: "nearest",
			}),
		).toEqual(["hovered", "nearest"]);
	});

	it("combines selected and transient tracked ids without duplicates", () => {
		expect(getEffectiveTrackedModuleIds("selected", ["selected", "nearest"])).toEqual([
			"selected",
			"nearest",
		]);
	});

	it("resolves live quick-action targets immediately", () => {
		expect(
			resolveQuickActionVisibility({
				selectedModuleId: "selected",
				liveTransientModuleIds: ["hovered", "nearest"],
				heldTransientModuleIds: [],
				isQuickActionsHovered: false,
			}),
		).toEqual({
			effectiveTrackedModuleIds: ["selected", "hovered", "nearest"],
			nextHeldTransientModuleIds: ["hovered", "nearest"],
			shouldScheduleHide: false,
		});
	});

	it("keeps held transient targets during the hold when no selection exists", () => {
		expect(
			resolveQuickActionVisibility({
				selectedModuleId: null,
				liveTransientModuleIds: [],
				heldTransientModuleIds: ["hovered", "nearest"],
				isQuickActionsHovered: false,
			}),
		).toEqual({
			effectiveTrackedModuleIds: ["hovered", "nearest"],
			nextHeldTransientModuleIds: ["hovered", "nearest"],
			shouldScheduleHide: true,
		});
	});

	it("keeps held transient targets without scheduling hide while a button is hovered", () => {
		expect(
			resolveQuickActionVisibility({
				selectedModuleId: null,
				liveTransientModuleIds: [],
				heldTransientModuleIds: ["hovered"],
				isQuickActionsHovered: true,
			}),
		).toEqual({
			effectiveTrackedModuleIds: ["hovered"],
			nextHeldTransientModuleIds: ["hovered"],
			shouldScheduleHide: false,
		});
	});

	it("falls back to selection-only buttons when hover and nearest disappear", () => {
		expect(
			resolveQuickActionVisibility({
				selectedModuleId: "selected",
				liveTransientModuleIds: [],
				heldTransientModuleIds: ["hovered"],
				isQuickActionsHovered: false,
			}),
		).toEqual({
			effectiveTrackedModuleIds: ["selected"],
			nextHeldTransientModuleIds: [],
			shouldScheduleHide: false,
		});
	});

	it("dedupes buttons by insert request instead of position", () => {
		const deduped = dedupeQuickActionDefinitions([
			{
				key: "selected-before",
				sourceModuleId: "selected",
				insertRequest: { targetId: "module-a", position: "before" },
				x: 10,
				y: 10,
			},
			{
				key: "hovered-before",
				sourceModuleId: "hovered",
				insertRequest: { targetId: "module-a", position: "before" },
				x: 100,
				y: 100,
			},
		]);

		expect(deduped).toHaveLength(1);
		expect(deduped[0]?.sourceModuleId).toBe("selected");
	});

	it("keeps the first origin when multiple sources produce the same insert target", () => {
		expect(getInsertRequestKey({ targetId: "module-a", position: "before" })).toBe(
			"before:module-a",
		);
		expect(getInsertRequestKey({ targetId: "module-a", position: "after" })).toBe("after:module-a");
	});

	it("returns exactly two buttons for a single tracked module", () => {
		const siblings = createSiblings(["module-a", "module-b", "module-c"]);
		const definitions = calculateQuickActionDefinitions(
			"module-b",
			createContext(
				siblings,
				createRect({
					left: 0,
					right: 120,
					top: 0,
					bottom: 420,
					width: 120,
					height: 420,
					centerX: 60,
					centerY: 210,
				}),
			),
			(moduleId) =>
				({
					"module-a": {
						left: 0,
						right: 100,
						top: 0,
						bottom: 100,
						width: 100,
						height: 100,
						centerX: 50,
						centerY: 50,
					},
					"module-b": {
						left: 0,
						right: 100,
						top: 160,
						bottom: 260,
						width: 100,
						height: 100,
						centerX: 50,
						centerY: 210,
					},
					"module-c": {
						left: 0,
						right: 100,
						top: 320,
						bottom: 420,
						width: 100,
						height: 100,
						centerX: 50,
						centerY: 370,
					},
				})[moduleId] ?? null,
		);

		expect(definitions).toHaveLength(2);
		expect(definitions.map((definition) => definition.insertRequest.position)).toEqual([
			"before",
			"after",
		]);
	});

	it("infers a vertical slot flow for stacked children", () => {
		const metrics = {
			slotRect: createRect({
				left: 0,
				right: 240,
				top: 0,
				bottom: 340,
				width: 240,
				height: 340,
				centerX: 120,
				centerY: 170,
			}),
			childRects: [
				createRect({
					left: 20,
					right: 220,
					top: 20,
					bottom: 120,
					width: 200,
					centerX: 120,
					centerY: 70,
				}),
				createRect({
					left: 20,
					right: 220,
					top: 180,
					bottom: 280,
					width: 200,
					centerX: 120,
					centerY: 230,
				}),
			],
			slotWidth: 240,
			slotHeight: 340,
			childCount: 2,
		};

		expect(inferSlotFlowDirection(metrics)).toBe("vertical");
	});

	it("infers a horizontal slot flow when cards are side by side", () => {
		const metrics = {
			slotRect: createRect({
				left: 0,
				right: 320,
				top: 0,
				bottom: 120,
				width: 320,
				height: 120,
				centerX: 160,
				centerY: 60,
			}),
			childRects: [
				createRect({ left: 0, right: 120, width: 120, centerX: 60 }),
				createRect({ left: 180, right: 300, width: 120, centerX: 240 }),
			],
			slotWidth: 320,
			slotHeight: 120,
			childCount: 2,
		};

		expect(inferSlotFlowDirection(metrics)).toBe("horizontal");
	});

	it("keeps a grid slot globally horizontal across multiple rows", () => {
		const metrics = {
			slotRect: createRect({
				left: 0,
				right: 320,
				top: 0,
				bottom: 260,
				width: 320,
				height: 260,
				centerX: 160,
				centerY: 130,
			}),
			childRects: [
				createRect({ left: 0, right: 120, width: 120, centerX: 60 }),
				createRect({ left: 180, right: 300, width: 120, centerX: 240 }),
				createRect({
					left: 0,
					right: 120,
					top: 160,
					bottom: 260,
					width: 120,
					centerX: 60,
					centerY: 210,
				}),
			],
			slotWidth: 320,
			slotHeight: 260,
			childCount: 3,
		};

		expect(inferSlotFlowDirection(metrics)).toBe("horizontal");
	});

	it("uses the single-child width heuristic for a horizontal slot", () => {
		const metrics = {
			slotRect: createRect({
				left: 0,
				right: 260,
				top: 0,
				bottom: 120,
				width: 260,
				height: 120,
				centerX: 130,
				centerY: 60,
			}),
			childRects: [createRect({ left: 20, right: 120, width: 100, centerX: 70 })],
			slotWidth: 260,
			slotHeight: 120,
			childCount: 1,
		};

		expect(inferSlotFlowDirection(metrics)).toBe("horizontal");
	});

	it("uses the single-child width heuristic for a root-level slot when a slot rect is present", () => {
		const siblings = createSiblings(["module-a"]);
		const definitions = calculateQuickActionDefinitions(
			"module-a",
			createRootContext(
				siblings,
				createRect({
					left: 0,
					right: 280,
					top: 0,
					bottom: 140,
					width: 280,
					height: 140,
					centerX: 140,
					centerY: 70,
				}),
			),
			(moduleId) =>
				({
					"module-a": createRect({
						left: 20,
						right: 120,
						top: 20,
						bottom: 120,
						width: 100,
						height: 100,
						centerX: 70,
						centerY: 70,
					}),
				})[moduleId] ?? null,
		);

		expect(definitions).toEqual([
			expect.objectContaining({ key: "before-edge-module-a", x: 20, y: 70 }),
			expect.objectContaining({ key: "after-edge-module-a", x: 120, y: 70 }),
		]);
	});

	it("uses the single-child width heuristic for a vertical slot when space is tight", () => {
		const metrics = {
			slotRect: createRect({
				left: 0,
				right: 180,
				top: 0,
				bottom: 120,
				width: 180,
				height: 120,
				centerX: 90,
				centerY: 60,
			}),
			childRects: [createRect({ left: 20, right: 120, width: 100, centerX: 70 })],
			slotWidth: 180,
			slotHeight: 120,
			childCount: 1,
		};

		expect(inferSlotFlowDirection(metrics)).toBe("vertical");
	});

	it("places the trailing action on the right edge when the next document sibling starts a new row", () => {
		const siblings = createSiblings(["module-a", "module-b", "module-c"]);
		const rects: Record<string, RelativeRect> = {
			"module-a": createRect({
				left: 0,
				right: 120,
				top: 0,
				bottom: 100,
				width: 120,
				centerX: 60,
				centerY: 50,
			}),
			"module-b": createRect({
				left: 180,
				right: 300,
				top: 0,
				bottom: 100,
				width: 120,
				centerX: 240,
				centerY: 50,
			}),
			"module-c": createRect({
				left: 0,
				right: 120,
				top: 160,
				bottom: 260,
				width: 120,
				centerX: 60,
				centerY: 210,
			}),
		};
		const context = createContext(
			siblings,
			createRect({
				left: 0,
				right: 320,
				top: 0,
				bottom: 260,
				width: 320,
				height: 260,
				centerX: 160,
				centerY: 130,
			}),
		);

		expect(
			inferSlotFlowDirection(getSlotMetrics(context, (moduleId) => rects[moduleId] ?? null)),
		).toBe("horizontal");

		const definitions = calculateQuickActionDefinitions(
			"module-b",
			context,
			(moduleId) => rects[moduleId] ?? null,
		);

		expect(definitions).toHaveLength(2);
		expect(definitions).toEqual([
			expect.objectContaining({
				key: "before-gap-module-b",
				x: 150,
				y: 50,
			}),
			expect.objectContaining({
				key: "after-edge-module-b",
				x: 330,
				y: 50,
			}),
		]);
	});

	it("mirrors the trailing edge anchor from a horizontal before-gap", () => {
		const siblings = createSiblings(["module-a", "module-b"]);
		const rects: Record<string, RelativeRect> = {
			"module-a": createRect({
				left: 0,
				right: 120,
				top: 0,
				bottom: 100,
				width: 120,
				centerX: 60,
				centerY: 50,
			}),
			"module-b": createRect({
				left: 180,
				right: 300,
				top: 0,
				bottom: 100,
				width: 120,
				centerX: 240,
				centerY: 50,
			}),
		};

		const definitions = calculateQuickActionDefinitions(
			"module-b",
			createContext(
				siblings,
				createRect({
					left: 0,
					right: 320,
					top: 0,
					bottom: 120,
					width: 320,
					height: 120,
					centerX: 160,
					centerY: 60,
				}),
			),
			(moduleId) => rects[moduleId] ?? null,
		);

		expect(definitions).toEqual([
			expect.objectContaining({ key: "before-gap-module-b", x: 150, y: 50 }),
			expect.objectContaining({ key: "after-edge-module-b", x: 330, y: 50 }),
		]);
	});

	it("mirrors the leading edge anchor from a horizontal after-gap", () => {
		const siblings = createSiblings(["module-a", "module-b"]);
		const rects: Record<string, RelativeRect> = {
			"module-a": createRect({
				left: 0,
				right: 120,
				top: 0,
				bottom: 100,
				width: 120,
				centerX: 60,
				centerY: 50,
			}),
			"module-b": createRect({
				left: 180,
				right: 300,
				top: 0,
				bottom: 100,
				width: 120,
				centerX: 240,
				centerY: 50,
			}),
		};

		const definitions = calculateQuickActionDefinitions(
			"module-a",
			createContext(
				siblings,
				createRect({
					left: 0,
					right: 320,
					top: 0,
					bottom: 120,
					width: 320,
					height: 120,
					centerX: 160,
					centerY: 60,
				}),
			),
			(moduleId) => rects[moduleId] ?? null,
		);

		expect(definitions).toEqual([
			expect.objectContaining({ key: "after-gap-module-a", x: 150, y: 50 }),
			expect.objectContaining({ key: "before-edge-module-a", x: -30, y: 50 }),
		]);
	});

	it("mirrors the opposite edge anchor in a vertical slot", () => {
		const siblings = createSiblings(["module-a", "module-b"]);
		const rects: Record<string, RelativeRect> = {
			"module-a": createRect({
				left: 20,
				right: 120,
				top: 0,
				bottom: 100,
				width: 100,
				centerX: 70,
				centerY: 50,
			}),
			"module-b": createRect({
				left: 20,
				right: 120,
				top: 160,
				bottom: 260,
				width: 100,
				centerX: 70,
				centerY: 210,
			}),
		};

		const definitions = calculateQuickActionDefinitions(
			"module-a",
			createContext(
				siblings,
				createRect({
					left: 0,
					right: 160,
					top: 0,
					bottom: 280,
					width: 160,
					height: 280,
					centerX: 80,
					centerY: 140,
				}),
			),
			(moduleId) => rects[moduleId] ?? null,
		);

		expect(definitions).toEqual([
			expect.objectContaining({ key: "after-gap-module-a", x: 70, y: 130 }),
			expect.objectContaining({ key: "before-edge-module-a", x: 70, y: -30 }),
		]);
	});

	it("places single-child actions left and right in a horizontal slot", () => {
		const siblings = createSiblings(["module-a"]);
		const rects: Record<string, RelativeRect> = {
			"module-a": createRect({
				left: 20,
				right: 120,
				top: 20,
				bottom: 120,
				width: 100,
				centerX: 70,
				centerY: 70,
			}),
		};

		const definitions = calculateQuickActionDefinitions(
			"module-a",
			createContext(
				siblings,
				createRect({
					left: 0,
					right: 260,
					top: 0,
					bottom: 140,
					width: 260,
					height: 140,
					centerX: 130,
					centerY: 70,
				}),
			),
			(moduleId) => rects[moduleId] ?? null,
		);

		expect(definitions).toEqual([
			expect.objectContaining({ key: "before-edge-module-a", x: 20, y: 70 }),
			expect.objectContaining({ key: "after-edge-module-a", x: 120, y: 70 }),
		]);
	});

	it("places single-child actions above and below in a vertical slot", () => {
		const siblings = createSiblings(["module-a"]);
		const rects: Record<string, RelativeRect> = {
			"module-a": createRect({
				left: 20,
				right: 120,
				top: 20,
				bottom: 120,
				width: 100,
				centerX: 70,
				centerY: 70,
			}),
		};

		const definitions = calculateQuickActionDefinitions(
			"module-a",
			createContext(
				siblings,
				createRect({
					left: 0,
					right: 180,
					top: 0,
					bottom: 140,
					width: 180,
					height: 140,
					centerX: 90,
					centerY: 70,
				}),
			),
			(moduleId) => rects[moduleId] ?? null,
		);

		expect(definitions).toEqual([
			expect.objectContaining({ key: "before-edge-module-a", x: 70, y: 20 }),
			expect.objectContaining({ key: "after-edge-module-a", x: 70, y: 120 }),
		]);
	});

	it("derives the visible insert-button rect from its anchor point", () => {
		expect(getInsertButtonRect(100, 120)).toEqual(
			expect.objectContaining({
				left: 100 - INSERT_BUTTON_VISUAL_SIZE_PX / 2,
				right: 100 + INSERT_BUTTON_VISUAL_SIZE_PX / 2,
				top: 120 - INSERT_BUTTON_VISUAL_SIZE_PX / 2,
				bottom: 120 + INSERT_BUTTON_VISUAL_SIZE_PX / 2,
			}),
		);
	});

	it("treats overlapping rects as intersecting", () => {
		expect(
			doRectsIntersect(
				createRect({ left: 10, right: 30, top: 10, bottom: 30 }),
				createRect({ left: 20, right: 40, top: 20, bottom: 40 }),
			),
		).toBe(true);
	});

	it("treats touching edges as intersecting", () => {
		expect(
			doRectsIntersect(
				createRect({ left: 10, right: 30, top: 10, bottom: 30 }),
				createRect({ left: 30, right: 50, top: 10, bottom: 30 }),
			),
		).toBe(true);
	});

	it("keeps all quick actions when no island rect is present", () => {
		const definitions = [
			{
				key: "before-edge-module-a",
				sourceModuleId: "module-a",
				insertRequest: { targetId: "module-a", position: "before" as const },
				x: 50,
				y: 50,
			},
			{
				key: "after-edge-module-a",
				sourceModuleId: "module-a",
				insertRequest: { targetId: "module-a", position: "after" as const },
				x: 150,
				y: 50,
			},
		];

		expect(filterQuickActionDefinitionsByIslandCollision(definitions, null)).toEqual(definitions);
	});

	it("filters only the quick action that collides with the island", () => {
		const definitions = [
			{
				key: "before-edge-module-a",
				sourceModuleId: "module-a",
				insertRequest: { targetId: "module-a", position: "before" as const },
				x: 50,
				y: 50,
			},
			{
				key: "after-edge-module-a",
				sourceModuleId: "module-a",
				insertRequest: { targetId: "module-a", position: "after" as const },
				x: 150,
				y: 50,
			},
			{
				key: "before-edge-module-b",
				sourceModuleId: "module-b",
				insertRequest: { targetId: "module-b", position: "before" as const },
				x: 250,
				y: 50,
			},
		];
		const islandRect = createRect({
			left: 132,
			right: 168,
			top: 32,
			bottom: 68,
			width: 36,
			height: 36,
			centerX: 150,
			centerY: 50,
		});

		expect(filterQuickActionDefinitionsByIslandCollision(definitions, islandRect)).toEqual([
			definitions[0],
			definitions[2],
		]);
	});
});
