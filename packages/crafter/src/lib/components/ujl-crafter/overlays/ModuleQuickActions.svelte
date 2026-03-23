<script lang="ts">
	import { getContext } from "svelte";
	import type { InsertRequest } from "$lib/stores/features/clipboard.js";
	import {
		CRAFTER_CONTEXT,
		type CrafterContext,
		getHoverTargetContext,
		getScrollContext,
	} from "$lib/stores/index.js";
	import { findParentOfNode, ROOT_NODE_ID, ROOT_SLOT_NAME } from "$lib/utils/ujlc-tree.js";
	import type { RelativeRect } from "./quick-action-position.js";
	import InsertButton from "./InsertButton.svelte";
	import {
		findNearestModuleId,
		getDirectSlotChildIds,
		type PointerPosition,
	} from "./quick-action-nearest.js";
	import {
		calculateQuickActionDefinitions,
		dedupeQuickActionDefinitions,
		filterQuickActionDefinitionsByIslandCollision,
		getTransientTrackedModuleIds,
		QUICK_ACTION_HOLD_MS,
		resolveQuickActionVisibility,
		type SlotQuickActionContext,
	} from "./module-quick-actions.js";

	interface Props {
		containerElement: HTMLElement;
		selectedModuleId?: string | null;
	}

	interface ButtonPosition {
		key: string;
		sourceModuleId: string;
		insertRequest: InsertRequest;
		x: number;
		y: number;
		onInsert: () => void;
	}

	interface ActiveSlot {
		moduleId: string;
		slotName: string;
	}

	const FALLBACK_RECOMPUTE_INTERVAL_MS = 200;

	let { containerElement, selectedModuleId = null }: Props = $props();

	const crafter = getContext<CrafterContext>(CRAFTER_CONTEXT);
	const hoverTargets = getHoverTargetContext();
	const scrollContext = getScrollContext();

	let overlayRoot: HTMLDivElement | undefined = $state();
	let buttonPositions = $state<ButtonPosition[]>([]);

	let activeSlot = $state<ActiveSlot | null>(null);
	let lastPointer = $state<PointerPosition | null>(null);
	let nearestModuleId = $state<string | null>(null);

	let effectiveTrackedModuleIds = $state<string[]>([]);
	let heldTransientModuleIds = $state<string[]>([]);
	let isQuickActionsHovered = $state(false);
	let hideTimer: ReturnType<typeof setTimeout> | null = null;

	function arraysEqual(a: string[], b: string[]): boolean {
		return a.length === b.length && a.every((value, index) => value === b[index]);
	}

	function clearHideTimer() {
		if (hideTimer) {
			clearTimeout(hideTimer);
			hideTimer = null;
		}
	}

	function scheduleHideTimer() {
		if (hideTimer) {
			return;
		}

		hideTimer = setTimeout(() => {
			hideTimer = null;
			heldTransientModuleIds = [];
		}, QUICK_ACTION_HOLD_MS);
	}

	function isInsertButtonElement(element: HTMLElement | null) {
		return !!element?.closest('[data-crafter="insert-button"]');
	}

	function isQuickActionElement(element: HTMLElement | null) {
		return !!element?.closest('[data-crafter="module-quick-actions"]');
	}

	function handleQuickActionMouseOver(event: MouseEvent) {
		const target = event.target as HTMLElement | null;
		if (!isInsertButtonElement(target)) {
			return;
		}

		isQuickActionsHovered = true;
		clearHideTimer();
	}

	function handleQuickActionMouseOut(event: MouseEvent) {
		const target = event.target as HTMLElement | null;
		if (!isInsertButtonElement(target)) {
			return;
		}

		const relatedTarget = event.relatedTarget as HTMLElement | null;
		if (isInsertButtonElement(relatedTarget)) {
			return;
		}

		isQuickActionsHovered = false;
	}

	// DOM and rect resolution
	function toRelativeRect(element: HTMLElement): RelativeRect | null {
		if (!overlayRoot) return null;

		const elementRect = element.getBoundingClientRect();
		const rootRect = overlayRoot.getBoundingClientRect();

		return {
			left: elementRect.left - rootRect.left,
			right: elementRect.right - rootRect.left,
			top: elementRect.top - rootRect.top,
			bottom: elementRect.bottom - rootRect.top,
			width: elementRect.width,
			height: elementRect.height,
			centerX: elementRect.left - rootRect.left + elementRect.width / 2,
			centerY: elementRect.top - rootRect.top + elementRect.height / 2,
		};
	}

	function getRelativeRect(moduleId: string): RelativeRect | null {
		if (!overlayRoot) return null;

		const moduleElement = containerElement.querySelector(
			`[data-ujl-module-id="${moduleId}"]`,
		) as HTMLElement | null;

		return moduleElement ? toRelativeRect(moduleElement) : null;
	}

	function getSlotRelativeRect(
		ownerModuleId: string | null,
		slotName: string,
	): RelativeRect | null {
		if (!overlayRoot) {
			return null;
		}

		if (slotName === ROOT_SLOT_NAME) {
			return toRelativeRect(containerElement);
		}

		if (!ownerModuleId) {
			return null;
		}

		const slotElement =
			(containerElement.querySelector(
				`[data-ujl-module-id="${ownerModuleId}"][data-ujl-slot="${slotName}"]`,
			) as HTMLElement | null) ??
			(containerElement.querySelector(
				`[data-ujl-module-id="${ownerModuleId}"] [data-ujl-slot="${slotName}"]`,
			) as HTMLElement | null);

		return slotElement ? toRelativeRect(slotElement) : null;
	}

	function getSlotContext(moduleId: string): SlotQuickActionContext {
		const parentInfo = findParentOfNode(crafter.ujlcDocument.ujlc.root, moduleId);

		if (!parentInfo || !parentInfo.parent) {
			return {
				ownerModuleId: null,
				slotName: ROOT_SLOT_NAME,
				slotRect: getSlotRelativeRect(null, ROOT_SLOT_NAME),
				siblings: crafter.ujlcDocument.ujlc.root,
			};
		}

		const ownerModuleId =
			parentInfo.parent.meta.id === ROOT_NODE_ID ? null : parentInfo.parent.meta.id;
		const siblings =
			ownerModuleId === null
				? crafter.ujlcDocument.ujlc.root
				: (parentInfo.parent.slots?.[parentInfo.slotName] ?? []);

		return {
			ownerModuleId,
			slotName: parentInfo.slotName,
			slotRect: getSlotRelativeRect(ownerModuleId, parentInfo.slotName),
			siblings,
		};
	}

	function getIslandRelativeRect(): RelativeRect | null {
		if (!overlayRoot || !selectedModuleId) {
			return null;
		}

		const islandElement = overlayRoot.parentElement?.querySelector(
			`[data-crafter="overlay-base"][data-module-id="${selectedModuleId}"] [data-crafter="module-island"]`,
		) as HTMLElement | null;

		return islandElement ? toRelativeRect(islandElement) : null;
	}

	// Local tracking for selected, hovered and nearest targets.
	// Nearest stays local because it only exists to enrich quick actions and no longer drives a debug overlay.
	function clearNearestState() {
		activeSlot = null;
		lastPointer = null;
		nearestModuleId = null;
	}

	function getActiveSlotFromTarget(target: EventTarget | null): ActiveSlot | null {
		const element = target as HTMLElement | null;
		const slotElement = element?.closest("[data-ujl-slot]") as HTMLElement | null;
		if (!slotElement) return null;

		const moduleElement = slotElement.closest("[data-ujl-module-id]") as HTMLElement | null;
		const moduleId = moduleElement?.getAttribute("data-ujl-module-id");
		const slotName = slotElement.getAttribute("data-ujl-slot");

		if (!moduleId || !slotName) {
			return null;
		}

		return { moduleId, slotName };
	}

	function recomputeNearest() {
		if (!activeSlot || !lastPointer) {
			nearestModuleId = null;
			return;
		}

		const candidateIds = getDirectSlotChildIds(
			crafter.ujlcDocument.ujlc.root,
			activeSlot.moduleId,
			activeSlot.slotName,
		);

		nearestModuleId = findNearestModuleId(candidateIds, lastPointer, (moduleId) => {
			const moduleElement = containerElement.querySelector(
				`[data-ujl-module-id="${moduleId}"]`,
			) as HTMLElement | null;

			return moduleElement?.getBoundingClientRect() ?? null;
		});
	}

	function handleCanvasMouseMove(event: MouseEvent) {
		const target = event.target as HTMLElement | null;
		if (isQuickActionElement(target)) {
			if (activeSlot) {
				lastPointer = { x: event.clientX, y: event.clientY };
				recomputeNearest();
			}
			return;
		}

		const slot = getActiveSlotFromTarget(event.target);
		if (!slot) {
			clearNearestState();
			return;
		}

		activeSlot = slot;
		lastPointer = { x: event.clientX, y: event.clientY };
		recomputeNearest();
	}

	function handleCanvasMouseLeave() {
		clearNearestState();
	}

	function updateButtonPositions() {
		if (!overlayRoot) return;

		if (effectiveTrackedModuleIds.length === 0) {
			buttonPositions = [];
			return;
		}

		const definitions = effectiveTrackedModuleIds.flatMap((moduleId) =>
			calculateQuickActionDefinitions(moduleId, getSlotContext(moduleId), getRelativeRect),
		);
		const visibleDefinitions = filterQuickActionDefinitionsByIslandCollision(
			dedupeQuickActionDefinitions(definitions),
			getIslandRelativeRect(),
		);

		buttonPositions = visibleDefinitions.map((definition) => ({
			...definition,
			onInsert: () => {
				crafter.requestInsert(definition.insertRequest);
			},
		}));
	}

	$effect(() => {
		if (!containerElement) {
			return;
		}

		containerElement.addEventListener("mousemove", handleCanvasMouseMove, { passive: true });
		containerElement.addEventListener("mouseleave", handleCanvasMouseLeave, { passive: true });

		return () => {
			containerElement.removeEventListener("mousemove", handleCanvasMouseMove);
			containerElement.removeEventListener("mouseleave", handleCanvasMouseLeave);
		};
	});

	$effect(() => {
		const unregister = scrollContext.register(() => {
			recomputeNearest();
			updateButtonPositions();
		});

		const interval = setInterval(() => {
			recomputeNearest();
			updateButtonPositions();
		}, FALLBACK_RECOMPUTE_INTERVAL_MS);

		const resizeObserver = new ResizeObserver(() => {
			recomputeNearest();
			updateButtonPositions();
		});
		resizeObserver.observe(containerElement);

		return () => {
			unregister();
			clearInterval(interval);
			clearHideTimer();
			resizeObserver.disconnect();
		};
	});

	$effect(() => {
		if (!overlayRoot) {
			return;
		}

		const root = overlayRoot;

		root.addEventListener("mouseover", handleQuickActionMouseOver);
		root.addEventListener("mouseout", handleQuickActionMouseOut);

		return () => {
			root.removeEventListener("mouseover", handleQuickActionMouseOver);
			root.removeEventListener("mouseout", handleQuickActionMouseOut);
		};
	});

	$effect(() => {
		const _ = crafter.ujlcDocument;
		if (activeSlot && lastPointer) {
			requestAnimationFrame(recomputeNearest);
		}
	});

	$effect(() => {
		const liveTransientModuleIds = getTransientTrackedModuleIds({
			hoveredModuleId: hoverTargets.hoveredModuleId,
			nearestModuleId,
		});
		const resolved = resolveQuickActionVisibility({
			selectedModuleId,
			liveTransientModuleIds,
			heldTransientModuleIds,
			isQuickActionsHovered,
		});

		if (!arraysEqual(heldTransientModuleIds, resolved.nextHeldTransientModuleIds)) {
			heldTransientModuleIds = resolved.nextHeldTransientModuleIds;
		}

		if (!arraysEqual(effectiveTrackedModuleIds, resolved.effectiveTrackedModuleIds)) {
			effectiveTrackedModuleIds = resolved.effectiveTrackedModuleIds;
		}

		if (resolved.shouldScheduleHide) {
			scheduleHideTimer();
		} else {
			clearHideTimer();
		}

		if (overlayRoot) {
			updateButtonPositions();
		}
	});
</script>

<div
	bind:this={overlayRoot}
	class="pointer-events-none absolute inset-0"
	data-crafter="module-quick-actions"
>
	{#if buttonPositions.length > 0}
		{#each buttonPositions as pos (pos.key)}
			<InsertButton x={pos.x} y={pos.y} onInsert={pos.onInsert} zIndex={45} />
		{/each}
	{/if}
</div>
