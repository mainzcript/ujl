import { ROOT_SLOT_NAME } from "$lib/utils/ujlc-tree.js";

export interface ActiveSlotTarget {
	ownerModuleId: string | null;
	slotName: string;
}

export interface PointerTargets {
	hoveredModuleId: string | null;
	activeSlot: ActiveSlotTarget | null;
}

type IgnorePredicate = (element: HTMLElement | null) => boolean;
type HitTestRoot = Document | ShadowRoot;

function getElementsFromPoint(
	root: HitTestRoot | undefined,
	point: { clientX: number; clientY: number },
): HTMLElement[] {
	const hitTestRoot = root ?? document;
	const maybeElementsFromPoint = (
		hitTestRoot as HitTestRoot & {
			elementsFromPoint?: (x: number, y: number) => Element[];
			elementFromPoint?: (x: number, y: number) => Element | null;
		}
	).elementsFromPoint;

	if (typeof maybeElementsFromPoint === "function") {
		return maybeElementsFromPoint
			.call(hitTestRoot, point.clientX, point.clientY)
			.filter((element): element is HTMLElement => element instanceof HTMLElement);
	}

	const maybeElementFromPoint = (
		hitTestRoot as HitTestRoot & {
			elementFromPoint?: (x: number, y: number) => Element | null;
		}
	).elementFromPoint;

	if (typeof maybeElementFromPoint === "function") {
		const element = maybeElementFromPoint.call(hitTestRoot, point.clientX, point.clientY);
		return element instanceof HTMLElement ? [element] : [];
	}

	return [];
}

export function resolveHoveredModuleIdFromElement(element: HTMLElement | null): string | null {
	return element?.closest("[data-ujl-module-id]")?.getAttribute("data-ujl-module-id") ?? null;
}

export function resolveActiveSlotFromElement(element: HTMLElement | null): ActiveSlotTarget | null {
	const slotElement = element?.closest("[data-ujl-slot]") as HTMLElement | null;
	if (!slotElement) {
		return null;
	}

	const slotName = slotElement.getAttribute("data-ujl-slot");
	if (!slotName) {
		return null;
	}

	if (slotName === ROOT_SLOT_NAME) {
		return {
			ownerModuleId: null,
			slotName,
		};
	}

	const moduleElement = slotElement.closest("[data-ujl-module-id]") as HTMLElement | null;
	const ownerModuleId = moduleElement?.getAttribute("data-ujl-module-id");
	if (!ownerModuleId) {
		return null;
	}

	return {
		ownerModuleId,
		slotName,
	};
}

export function resolvePointerTargetsFromElements(
	elements: HTMLElement[],
	shouldIgnore: IgnorePredicate,
): PointerTargets {
	let hoveredModuleId: string | null = null;
	let activeSlot: ActiveSlotTarget | null = null;

	for (const element of elements) {
		if (shouldIgnore(element)) {
			continue;
		}

		if (!hoveredModuleId) {
			hoveredModuleId = resolveHoveredModuleIdFromElement(element);
		}

		if (!activeSlot) {
			activeSlot = resolveActiveSlotFromElement(element);
		}

		if (hoveredModuleId && activeSlot) {
			break;
		}
	}

	return { hoveredModuleId, activeSlot };
}

export function resolvePointerTargetsFromTarget(
	target: EventTarget | null,
	shouldIgnore: IgnorePredicate,
): PointerTargets {
	const element = target as HTMLElement | null;
	return resolvePointerTargetsFromElements(element ? [element] : [], shouldIgnore);
}

export function resolvePointerTargetsFromPoint(
	point: { clientX: number; clientY: number },
	shouldIgnore: IgnorePredicate,
	root?: HitTestRoot,
): PointerTargets {
	const elements = getElementsFromPoint(root, point);
	return resolvePointerTargetsFromElements(elements, shouldIgnore);
}
