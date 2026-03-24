import { describe, expect, it } from "vitest";
import { createCanvasInteractionContext } from "./canvas-interaction-context.svelte.js";

describe("canvas-interaction-context", () => {
	it("tracks pointer, hovered module, active slot and nearest module", () => {
		const context = createCanvasInteractionContext();

		context.updateState({
			pointer: { clientX: 10, clientY: 20 },
			inputMode: "mouse",
			hoveredModuleId: "module-a",
			activeSlot: { ownerModuleId: "parent-a", slotName: "content" },
			isHoveringDraggedSource: true,
			nearestModuleId: "module-b",
		});

		expect(context.pointer).toEqual({ clientX: 10, clientY: 20 });
		expect(context.inputMode).toBe("mouse");
		expect(context.hoveredModuleId).toBe("module-a");
		expect(context.activeSlot).toEqual({ ownerModuleId: "parent-a", slotName: "content" });
		expect(context.isHoveringDraggedSource).toBe(true);
		expect(context.lastValidSlot).toEqual({ ownerModuleId: "parent-a", slotName: "content" });
		expect(context.nearestModuleId).toBe("module-b");
	});

	it("keeps the last valid slot when the current active slot disappears", () => {
		const context = createCanvasInteractionContext();

		context.updateState({
			pointer: { clientX: 10, clientY: 20 },
			inputMode: "touch",
			hoveredModuleId: "module-a",
			activeSlot: { ownerModuleId: null, slotName: "root" },
			isHoveringDraggedSource: true,
			nearestModuleId: "module-a",
		});

		context.updateState({
			pointer: { clientX: 30, clientY: 40 },
			hoveredModuleId: null,
			activeSlot: null,
			isHoveringDraggedSource: false,
			nearestModuleId: "module-b",
		});

		expect(context.activeSlot).toBeNull();
		expect(context.inputMode).toBe("touch");
		expect(context.isHoveringDraggedSource).toBe(false);
		expect(context.lastValidSlot).toEqual({ ownerModuleId: null, slotName: "root" });
		expect(context.nearestModuleId).toBe("module-b");
	});

	it("clears all canvas target state", () => {
		const context = createCanvasInteractionContext();

		context.updateState({
			pointer: { clientX: 10, clientY: 20 },
			inputMode: "touch",
			hoveredModuleId: "module-a",
			activeSlot: { ownerModuleId: "parent-a", slotName: "content" },
			isHoveringDraggedSource: true,
			nearestModuleId: "module-b",
		});
		context.clear();

		expect(context.pointer).toBeNull();
		expect(context.inputMode).toBeNull();
		expect(context.hoveredModuleId).toBeNull();
		expect(context.activeSlot).toBeNull();
		expect(context.isHoveringDraggedSource).toBe(false);
		expect(context.lastValidSlot).toBeNull();
		expect(context.nearestModuleId).toBeNull();
	});
});
