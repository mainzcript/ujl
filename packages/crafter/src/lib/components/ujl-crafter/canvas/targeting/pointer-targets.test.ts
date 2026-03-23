import { describe, expect, it } from "vitest";
import {
	resolveActiveSlotFromElement,
	resolvePointerTargetsFromElements,
	resolvePointerTargetsFromPoint,
	type PointerTargets,
} from "./pointer-targets.js";

function ignoreNothing() {
	return false;
}

function getPointerTargets(markup: string, selector: string): PointerTargets {
	const container = document.createElement("div");
	container.innerHTML = markup;
	const element = container.querySelector(selector) as HTMLElement | null;
	if (!element) {
		throw new Error(`Missing test element for selector: ${selector}`);
	}

	return resolvePointerTargetsFromElements([element], ignoreNothing);
}

describe("pointer target resolver", () => {
	it("resolves hovered module id and active slot for a nested module in another slot", () => {
		const targets = getPointerTargets(
			`
				<div data-ujl-module-id="container-a" data-ujl-slot="body">
					<div data-ujl-module-id="module-a"></div>
				</div>
				<div data-ujl-module-id="container-b" data-ujl-slot="content">
					<div data-ujl-module-id="module-b">
						<span data-testid="target"></span>
					</div>
				</div>
			`,
			'[data-testid="target"]',
		);

		expect(targets).toEqual({
			hoveredModuleId: "module-b",
			activeSlot: {
				ownerModuleId: "container-b",
				slotName: "content",
			},
		});
	});

	it("treats the root slot as owner-less", () => {
		const container = document.createElement("div");
		container.innerHTML = `<div data-ujl-slot="root"><span data-testid="target"></span></div>`;

		const target = container.querySelector('[data-testid="target"]') as HTMLElement | null;
		expect(resolveActiveSlotFromElement(target)).toEqual({
			ownerModuleId: null,
			slotName: "root",
		});
	});

	it("uses the provided hit-test root instead of the global document", () => {
		const root = document.createElement("div");
		root.innerHTML = `
			<div data-ujl-module-id="container-b" data-ujl-slot="content">
				<div data-ujl-module-id="module-b">
					<span data-testid="target"></span>
				</div>
			</div>
		`;

		const target = root.querySelector('[data-testid="target"]') as HTMLElement | null;
		const hitTestRoot = {
			elementsFromPoint: () => (target ? [target] : []),
		} as unknown as Document;

		expect(
			resolvePointerTargetsFromPoint({ clientX: 10, clientY: 20 }, ignoreNothing, hitTestRoot),
		).toEqual({
			hoveredModuleId: "module-b",
			activeSlot: {
				ownerModuleId: "container-b",
				slotName: "content",
			},
		});
	});
});
