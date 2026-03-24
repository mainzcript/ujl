import { cleanup, fireEvent, render } from "@testing-library/svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SlotPlaceholderButton from "./SlotPlaceholderButton.svelte";

describe("SlotPlaceholderButton", () => {
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

	it("highlights the centered button when hovering anywhere in the placeholder box", async () => {
		const { container } = render(SlotPlaceholderButton, {
			x: 10,
			y: 20,
			width: 180,
			height: 72,
			mode: "insert",
			isActive: false,
		});

		const placeholderTarget = container.querySelector('[data-crafter="slot-placeholder-target"]');
		const visualButton = container.querySelector('[data-crafter="placement-target-button"]');

		if (!placeholderTarget || !visualButton) {
			throw new Error("Slot placeholder target not rendered");
		}

		expect(placeholderTarget.getAttribute("data-highlighted")).toBe("false");
		expect(visualButton.getAttribute("data-highlighted")).toBe("false");

		await fireEvent.mouseEnter(placeholderTarget);

		expect(placeholderTarget.getAttribute("data-highlighted")).toBe("true");
		expect(visualButton.getAttribute("data-highlighted")).toBe("true");

		await fireEvent.mouseLeave(placeholderTarget);

		expect(placeholderTarget.getAttribute("data-highlighted")).toBe("false");
		expect(visualButton.getAttribute("data-highlighted")).toBe("false");
	});

	it("triggers insert when clicking anywhere inside the placeholder box", async () => {
		const onInsert = vi.fn();
		const { container } = render(SlotPlaceholderButton, {
			x: 10,
			y: 20,
			width: 180,
			height: 72,
			mode: "insert",
			isActive: false,
			onInsert,
		});

		const placeholderTarget = container.querySelector('[data-crafter="slot-placeholder-target"]');
		if (!placeholderTarget) {
			throw new Error("Slot placeholder target not rendered");
		}

		await fireEvent.click(placeholderTarget);
		expect(onInsert).toHaveBeenCalledTimes(1);
	});

	it("shows the crosshair icon in drag mode", () => {
		const { container } = render(SlotPlaceholderButton, {
			x: 10,
			y: 20,
			width: 180,
			height: 72,
			mode: "drop",
			isActive: true,
		});

		const visualButton = container.querySelector('[data-crafter="placement-target-button"]');
		if (!visualButton) {
			throw new Error("Placement target button not rendered");
		}

		expect(visualButton.getAttribute("data-icon")).toBe("crosshair");
	});
});
