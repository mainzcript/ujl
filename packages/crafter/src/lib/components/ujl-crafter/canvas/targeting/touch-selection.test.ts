import { describe, expect, it } from "vitest";
import {
	createTouchTapSession,
	isTapSelectionPointerType,
	resolveModuleIdFromEventTarget,
	resolveTouchTapSelectionTarget,
	shouldCancelTouchTapSession,
	shouldSuppressSyntheticMouseEvent,
} from "./touch-selection.js";

describe("touch selection helpers", () => {
	it("resolves a module id from an event target inside a module", () => {
		const container = document.createElement("div");
		container.innerHTML = `
			<div data-ujl-module-id="module-a">
				<span data-testid="target"></span>
			</div>
		`;

		expect(resolveModuleIdFromEventTarget(container.querySelector('[data-testid="target"]'))).toBe(
			"module-a",
		);
	});

	it("creates a tap session only when a module target exists", () => {
		expect(createTouchTapSession(7, { clientX: 10, clientY: 20 }, "module-a")).toEqual({
			pointerId: 7,
			startX: 10,
			startY: 20,
			targetModuleId: "module-a",
		});
		expect(createTouchTapSession(7, { clientX: 10, clientY: 20 }, null)).toBeNull();
	});

	it("cancels a tap session when movement exceeds the threshold", () => {
		const session = createTouchTapSession(7, { clientX: 10, clientY: 20 }, "module-a");

		expect(shouldCancelTouchTapSession(session, { clientX: 15, clientY: 24 }, 10)).toBe(false);
		expect(shouldCancelTouchTapSession(session, { clientX: 21, clientY: 20 }, 10)).toBe(true);
	});

	it("selects only when the touch ends on the original module", () => {
		const session = createTouchTapSession(7, { clientX: 10, clientY: 20 }, "module-a");
		const container = document.createElement("div");
		container.innerHTML = `
			<div data-ujl-module-id="module-a">
				<span data-testid="same"></span>
			</div>
			<div data-ujl-module-id="module-b">
				<span data-testid="other"></span>
			</div>
		`;

		expect(
			resolveTouchTapSelectionTarget(session, container.querySelector('[data-testid="same"]')),
		).toBe("module-a");
		expect(
			resolveTouchTapSelectionTarget(session, container.querySelector('[data-testid="other"]')),
		).toBeNull();
	});

	it("suppresses synthetic mouse events shortly after touch input", () => {
		expect(shouldSuppressSyntheticMouseEvent("touch", 1000, 1200, 500)).toBe(true);
		expect(shouldSuppressSyntheticMouseEvent("pen", 1000, 1200, 500)).toBe(true);
		expect(shouldSuppressSyntheticMouseEvent("touch", 1000, 1600, 500)).toBe(false);
		expect(shouldSuppressSyntheticMouseEvent("mouse", 1000, 1200, 500)).toBe(false);
	});

	it("treats touch and pen as tap-selection pointer types", () => {
		expect(isTapSelectionPointerType("touch")).toBe(true);
		expect(isTapSelectionPointerType("pen")).toBe(true);
		expect(isTapSelectionPointerType("mouse")).toBe(false);
	});
});
