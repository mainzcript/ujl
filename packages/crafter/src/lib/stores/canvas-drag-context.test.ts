import { describe, expect, it } from "vitest";
import { createCanvasDragContext } from "./canvas-drag-context.svelte.js";

describe("canvas-drag-context", () => {
	it("tracks drag lifecycle and resets on end", () => {
		const context = createCanvasDragContext();

		context.startDrag("module-a", 3, { clientX: 10, clientY: 20 });
		context.setActiveDropRequest({ targetId: "module-b", position: "after" });
		context.updatePointer({ clientX: 30, clientY: 40 });

		expect(context.isDragging).toBe(true);
		expect(context.draggedModuleId).toBe("module-a");
		expect(context.pointerId).toBe(3);
		expect(context.pointer).toEqual({ clientX: 30, clientY: 40 });
		expect(context.activeDropRequest).toEqual({ targetId: "module-b", position: "after" });

		expect(context.endDrag()).toEqual({
			draggedModuleId: "module-a",
			activeDropRequest: { targetId: "module-b", position: "after" },
		});
		expect(context.isDragging).toBe(false);
		expect(context.draggedModuleId).toBeNull();
		expect(context.pointerId).toBeNull();
		expect(context.pointer).toBeNull();
		expect(context.activeDropRequest).toBeNull();
	});

	it("clears all state on cancel", () => {
		const context = createCanvasDragContext();

		context.startDrag("module-a", 7, { clientX: 50, clientY: 60 });
		context.setActiveDropRequest({ targetId: "module-c", position: "before" });
		context.cancelDrag();

		expect(context.isDragging).toBe(false);
		expect(context.draggedModuleId).toBeNull();
		expect(context.pointerId).toBeNull();
		expect(context.pointer).toBeNull();
		expect(context.activeDropRequest).toBeNull();
	});
});
