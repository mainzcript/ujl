import { describe, expect, it } from "vitest";
import { isCanvasOverlayElement } from "./canvas-overlay-elements.js";

describe("canvas overlay elements", () => {
	it("treats slot placeholder targets as canvas overlays", () => {
		const placeholderTarget = document.createElement("div");
		placeholderTarget.setAttribute("data-crafter", "slot-placeholder-target");

		expect(isCanvasOverlayElement(placeholderTarget)).toBe(true);
	});

	it("treats regular module content as non-overlay content", () => {
		const module = document.createElement("div");
		module.setAttribute("data-ujl-module-id", "module-a");

		expect(isCanvasOverlayElement(module)).toBe(false);
	});
});
