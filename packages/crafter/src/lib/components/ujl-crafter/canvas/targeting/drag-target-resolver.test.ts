import type { CanvasDragHomePosition } from "$lib/utils/canvas-drag-home.js";
import type { UJLCModuleObject } from "@ujl-framework/types";
import { describe, expect, it } from "vitest";
import { createMockNode } from "../../../../../../tests/mockData.js";
import { resolveActiveDragTarget } from "./drag-target-resolver.js";

type TestDefinition = {
	key: string;
	insertRequest: {
		targetId: string;
		slotName?: string;
		position?: "before" | "after" | "into";
	};
	x: number;
	y: number;
	kind: "placement" | "placeholder";
};

function createRoot(ids: string[]): UJLCModuleObject[] {
	return ids.map((id) => createMockNode(id, "text", { content: id }));
}

function createDefinition(
	key: string,
	insertRequest: TestDefinition["insertRequest"],
	x: number,
	y: number,
	kind: TestDefinition["kind"] = "placement",
): TestDefinition {
	return { key, insertRequest, x, y, kind };
}

describe("drag target resolver", () => {
	it("keeps before(nextSibling) as the original position for a middle module during self-hover", () => {
		const root = createRoot(["module-a", "module-b", "module-c"]);
		const definitions = [
			createDefinition("after-a", { targetId: "module-a", position: "after" }, 20, 20),
			createDefinition("before-c", { targetId: "module-c", position: "before" }, 200, 20),
		];
		const homePosition: CanvasDragHomePosition = {
			ownerModuleId: null,
			slotName: "root",
			previousSiblingId: "module-a",
			nextSiblingId: "module-c",
		};

		expect(
			resolveActiveDragTarget({
				rootNodes: root,
				definitions,
				pointer: { x: 22, y: 22 },
				activePlaceholderSlot: null,
				isHoveringDraggedSource: true,
				homePosition,
			}),
		).toEqual(definitions[1]);
	});

	it("keeps after(previousSibling) for the last module during self-hover", () => {
		const root = createRoot(["module-a", "module-b"]);
		const definitions = [
			createDefinition("after-a", { targetId: "module-a", position: "after" }, 20, 20),
		];
		const homePosition: CanvasDragHomePosition = {
			ownerModuleId: null,
			slotName: "root",
			previousSiblingId: "module-a",
			nextSiblingId: null,
		};

		expect(
			resolveActiveDragTarget({
				rootNodes: root,
				definitions,
				pointer: { x: 100, y: 100 },
				activePlaceholderSlot: null,
				isHoveringDraggedSource: true,
				homePosition,
			}),
		).toEqual(definitions[0]);
	});

	it("falls back to into(slot) for a single module during self-hover", () => {
		const root = createRoot(["module-a"]);
		const definitions = [
			createDefinition(
				"placeholder-root",
				{ targetId: "__root__", slotName: "root", position: "into" },
				100,
				100,
				"placeholder",
			),
		];
		const homePosition: CanvasDragHomePosition = {
			ownerModuleId: null,
			slotName: "root",
			previousSiblingId: null,
			nextSiblingId: null,
		};

		expect(
			resolveActiveDragTarget({
				rootNodes: root,
				definitions,
				pointer: { x: 10, y: 10 },
				activePlaceholderSlot: null,
				isHoveringDraggedSource: true,
				homePosition,
			}),
		).toEqual(definitions[0]);
	});

	it("falls back to the normal nearest target when no home target exists", () => {
		const root = createRoot(["module-a", "module-b"]);
		const definitions = [
			createDefinition("before-a", { targetId: "module-a", position: "before" }, 20, 20),
			createDefinition("after-b", { targetId: "module-b", position: "after" }, 200, 20),
		];
		const homePosition: CanvasDragHomePosition = {
			ownerModuleId: null,
			slotName: "root",
			previousSiblingId: "missing-prev",
			nextSiblingId: "missing-next",
		};

		expect(
			resolveActiveDragTarget({
				rootNodes: root,
				definitions,
				pointer: { x: 190, y: 20 },
				activePlaceholderSlot: null,
				isHoveringDraggedSource: true,
				homePosition,
			}),
		).toEqual(definitions[1]);
	});

	it("keeps placeholder priority in normal drag mode", () => {
		const root = [createMockNode("container-1", "container", {}, { body: [] })];
		const definitions = [
			createDefinition("before-other", { targetId: "other", position: "before" }, 20, 20),
			createDefinition(
				"placeholder-body",
				{ targetId: "container-1", slotName: "body", position: "into" },
				120,
				120,
				"placeholder",
			),
		];

		expect(
			resolveActiveDragTarget({
				rootNodes: root,
				definitions,
				pointer: { x: 22, y: 22 },
				activePlaceholderSlot: { ownerModuleId: "container-1", slotName: "body" },
				isHoveringDraggedSource: false,
				homePosition: null,
			}),
		).toEqual(definitions[1]);
	});
});
