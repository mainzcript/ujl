import { describe, expect, it, vi } from "vitest";
import { overlayPositioning } from "./overlay-position.js";

describe("overlayPositioning", () => {
	it("cleans up old listeners and intervals on update and destroy", () => {
		const node = document.createElement("div");
		const containerA = document.createElement("div");
		const containerB = document.createElement("div");

		const addA = vi.spyOn(containerA, "addEventListener");
		const removeA = vi.spyOn(containerA, "removeEventListener");
		const addB = vi.spyOn(containerB, "addEventListener");
		const removeB = vi.spyOn(containerB, "removeEventListener");
		const clearIntervalSpy = vi.spyOn(globalThis, "clearInterval");

		const observerInstances: Array<{ disconnect: ReturnType<typeof vi.fn> }> = [];
		class ResizeObserverMock {
			observe = vi.fn();
			disconnect = vi.fn();

			constructor() {
				observerInstances.push(this);
			}
		}
		vi.stubGlobal("ResizeObserver", ResizeObserverMock);

		const action = overlayPositioning(node, {
			containerElement: containerA,
			getModuleId: () => null,
		});

		expect(addA).toHaveBeenCalledTimes(1);
		expect(action.update).toBeTypeOf("function");
		expect(action.destroy).toBeTypeOf("function");

		action.update?.({
			containerElement: containerB,
			getModuleId: () => null,
		});

		expect(removeA).toHaveBeenCalledTimes(1);
		expect(addB).toHaveBeenCalledTimes(1);
		expect(clearIntervalSpy).toHaveBeenCalledTimes(1);
		expect(observerInstances[0]?.disconnect).toHaveBeenCalledTimes(1);

		action.destroy?.();

		expect(removeB).toHaveBeenCalledTimes(1);
		expect(clearIntervalSpy).toHaveBeenCalledTimes(2);
		expect(observerInstances[1]?.disconnect).toHaveBeenCalledTimes(1);
	});
});
