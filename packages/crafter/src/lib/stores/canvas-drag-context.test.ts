import { describe, expect, it } from "vitest";
import { createCanvasDragContext } from "./canvas-drag-context.svelte.js";

describe("canvas-drag-context", () => {
	it("tracks pointer and drag metadata for the active drag", () => {
		const context = createCanvasDragContext();
		const homePosition = {
			ownerModuleId: "container-a",
			slotName: "body",
			previousSiblingId: "module-prev",
			nextSiblingId: "module-next",
		};

		context.startDrag(
			"module-a",
			7,
			{ clientX: 100, clientY: 200 },
			{
				dragDisplayName: "Main banner",
				dragIconSvg: "<svg>hero</svg>",
				homePosition,
			},
		);

		expect(context.draggedModuleId).toBe("module-a");
		expect(context.pointerId).toBe(7);
		expect(context.pointer).toEqual({ clientX: 100, clientY: 200 });
		expect(context.dragDisplayName).toBe("Main banner");
		expect(context.dragIconSvg).toBe("<svg>hero</svg>");
		expect(context.homePosition).toEqual(homePosition);
		expect(context.isDragging).toBe(true);
	});

	it("falls back to the module id when no drag display name is provided", () => {
		const context = createCanvasDragContext();

		context.startDrag("module-a", 7, { clientX: 10, clientY: 20 });

		expect(context.dragDisplayName).toBe("module-a");
		expect(context.dragIconSvg).toBeNull();
	});

	it("returns drag metadata in the snapshot and resets state on end", () => {
		const context = createCanvasDragContext();

		context.startDrag(
			"module-a",
			7,
			{ clientX: 10, clientY: 20 },
			{ dragDisplayName: "Join Now", dragIconSvg: "<svg>cta</svg>" },
		);
		context.setActiveDropRequest({ targetId: "module-b", position: "after" });
		context.updatePointer({ clientX: 30, clientY: 40 });

		expect(context.endDrag()).toEqual({
			draggedModuleId: "module-a",
			dragDisplayName: "Join Now",
			dragIconSvg: "<svg>cta</svg>",
			activeDropRequest: { targetId: "module-b", position: "after" },
		});
		expect(context.isDragging).toBe(false);
		expect(context.draggedModuleId).toBeNull();
		expect(context.pointerId).toBeNull();
		expect(context.pointer).toBeNull();
		expect(context.dragDisplayName).toBeNull();
		expect(context.dragIconSvg).toBeNull();
		expect(context.homePosition).toBeNull();
		expect(context.activeDropRequest).toBeNull();
	});

	it("clears all state on cancel", () => {
		const context = createCanvasDragContext();

		context.startDrag(
			"module-a",
			7,
			{ clientX: 50, clientY: 60 },
			{ dragDisplayName: "Image", dragIconSvg: "<svg>image</svg>" },
		);
		context.setActiveDropRequest({ targetId: "module-c", position: "before" });
		context.cancelDrag();

		expect(context.isDragging).toBe(false);
		expect(context.draggedModuleId).toBeNull();
		expect(context.pointerId).toBeNull();
		expect(context.pointer).toBeNull();
		expect(context.dragDisplayName).toBeNull();
		expect(context.dragIconSvg).toBeNull();
		expect(context.homePosition).toBeNull();
		expect(context.activeDropRequest).toBeNull();
	});

	it("does not churn activeDropRequest when the same request is set repeatedly", () => {
		const context = createCanvasDragContext();

		context.startDrag("module-a", 7, { clientX: 50, clientY: 60 });
		context.setActiveDropRequest({ targetId: "module-c", position: "before" });
		const firstRequest = context.activeDropRequest;

		context.setActiveDropRequest({ targetId: "module-c", position: "before" });

		expect(context.activeDropRequest).toBe(firstRequest);
		expect(context.activeDropRequest).toEqual({ targetId: "module-c", position: "before" });
	});
});
