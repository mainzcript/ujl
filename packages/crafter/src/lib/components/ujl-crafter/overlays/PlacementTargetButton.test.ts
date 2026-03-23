import { cleanup, fireEvent, render } from "@testing-library/svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PlacementTargetButton from "./PlacementTargetButton.svelte";

describe("PlacementTargetButton", () => {
	beforeEach(() => {
		HTMLElement.prototype.animate = vi.fn(
			() =>
				({
					cancel() {},
					finished: Promise.resolve(),
					play() {},
				}) as unknown as Animation,
		);
	});

	afterEach(() => {
		cleanup();
		vi.restoreAllMocks();
	});

	it("uses the same highlighted state for hover in insert mode", async () => {
		const { container } = render(PlacementTargetButton, {
			x: 100,
			y: 120,
			mode: "insert",
			isActive: false,
		});

		const button = container.querySelector('[data-crafter="placement-target-button"]');
		if (!button) {
			throw new Error("Placement target button not found");
		}
		const interactiveButton = button.querySelector("button");
		if (!interactiveButton) {
			throw new Error("Interactive placement target button not found");
		}

		expect(button.getAttribute("data-highlighted")).toBe("false");

		await fireEvent.mouseEnter(interactiveButton);
		expect(button.getAttribute("data-highlighted")).toBe("true");

		await fireEvent.mouseLeave(interactiveButton);
		expect(button.getAttribute("data-highlighted")).toBe("false");
	});

	it("switches to the crosshair icon for drop-mode targets", () => {
		const { container } = render(PlacementTargetButton, {
			x: 100,
			y: 120,
			mode: "drop",
			isActive: false,
		});

		const button = container.querySelector('[data-crafter="placement-target-button"]');
		if (!button) {
			throw new Error("Placement target button not found");
		}

		expect(button.getAttribute("data-icon")).toBe("crosshair");
		expect(button.getAttribute("data-highlighted")).toBe("false");
	});
});
