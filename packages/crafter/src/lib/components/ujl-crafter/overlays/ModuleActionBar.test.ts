import type { useApp } from "$lib/components/ui/app/context.svelte.js";
import type { CanvasDragContext } from "$lib/stores/index.js";
import { cleanup, fireEvent, render } from "@testing-library/svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TestWrapper from "./module-action-bar-test-wrapper.svelte";

type Helpers = {
	app: ReturnType<typeof useApp>;
	canvasDrag: CanvasDragContext;
	container: HTMLDivElement | null;
};

describe("ModuleActionBar", () => {
	beforeEach(() => {
		class ResizeObserverMock {
			observe() {}
			disconnect() {}
		}

		vi.stubGlobal("ResizeObserver", ResizeObserverMock);
	});

	afterEach(() => {
		cleanup();
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it("cancels an active drag when Escape is pressed", async () => {
		let helpers: Helpers | undefined;
		const onDragDrop = vi.fn();

		render(TestWrapper, {
			onReady: (value: Helpers) => {
				helpers = value;
			},
			onDragDrop,
		});

		await new Promise((resolve) => setTimeout(resolve, 10));

		if (!helpers) {
			throw new Error("Test helpers not received");
		}

		helpers.app.setContainerWidth(1440);

		const handle = document.querySelector(
			'[data-crafter="module-drag-handle"]',
		) as HTMLElement | null;
		if (!handle) {
			throw new Error("Drag handle not found");
		}

		const setPointerCapture = vi.fn();
		const releasePointerCapture = vi.fn();
		let hasPointerCapture = true;

		Object.defineProperty(handle, "setPointerCapture", {
			value: setPointerCapture,
			configurable: true,
		});
		Object.defineProperty(handle, "releasePointerCapture", {
			value: (pointerId: number) => {
				hasPointerCapture = false;
				releasePointerCapture(pointerId);
			},
			configurable: true,
		});
		Object.defineProperty(handle, "hasPointerCapture", {
			value: () => hasPointerCapture,
			configurable: true,
		});

		await fireEvent.pointerDown(handle, {
			pointerId: 7,
			clientX: 20,
			clientY: 30,
		});

		expect(helpers.canvasDrag.isDragging).toBe(true);
		expect(setPointerCapture).toHaveBeenCalledWith(7);

		const event = new KeyboardEvent("keydown", {
			key: "Escape",
			bubbles: true,
			cancelable: true,
		});
		const stopImmediatePropagation = vi.fn();
		Object.defineProperty(event, "stopImmediatePropagation", {
			value: stopImmediatePropagation,
		});

		window.dispatchEvent(event);
		await new Promise((resolve) => setTimeout(resolve, 0));

		expect(helpers.canvasDrag.isDragging).toBe(false);
		expect(helpers.canvasDrag.draggedModuleId).toBeNull();
		expect(releasePointerCapture).toHaveBeenCalledWith(7);
		expect(stopImmediatePropagation).toHaveBeenCalled();
		expect(onDragDrop).not.toHaveBeenCalled();
		expect(document.querySelector('[data-crafter="module-action-bar"]')).not.toBeNull();
	});
});
