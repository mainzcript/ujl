<script lang="ts">
	import { getContext, untrack } from "svelte";
	import type { InsertRequest } from "$lib/stores/features/clipboard.js";
	import {
		CRAFTER_CONTEXT,
		type CrafterContext,
		getCanvasDragContext,
		getCanvasInteractionContext,
		getScrollContext,
	} from "$lib/stores/index.js";
	import { findParentOfNode, ROOT_NODE_ID, ROOT_SLOT_NAME } from "$lib/utils/ujlc-tree.js";
	import type { RelativeRect } from "../canvas/targeting/quick-action-position.js";
	import PlacementTargetButton from "./PlacementTargetButton.svelte";
	import {
		calculatePlacementTargetDefinitions,
		dedupePlacementTargetDefinitions,
		filterPlacementTargetDefinitionsByMoveValidity,
		type PlacementTargetDefinition,
		type SlotPlacementContext,
	} from "../canvas/targeting/placement-target-definitions.js";
	import {
		filterPlacementTargetsByActionBarCollision,
		getInsertRequestKey,
		getNearestPlacementTarget,
	} from "../canvas/targeting/placement-target-hit-testing.js";
	import {
		PLACEMENT_TARGET_HOLD_MS,
		resolvePlacementTargetVisibility,
		resolveTrackedModuleIds,
		resolveTransientTrackedModuleIds,
	} from "../canvas/targeting/placement-target-tracking.js";

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
		onInsert: (() => void) | null;
		mode: "insert" | "drop";
		isActive: boolean;
	}

	const FALLBACK_RECOMPUTE_INTERVAL_MS = 200;

	let { containerElement, selectedModuleId = null }: Props = $props();

	const crafter = getContext<CrafterContext>(CRAFTER_CONTEXT);
	const canvasDrag = getCanvasDragContext();
	const canvasInteraction = getCanvasInteractionContext();
	const scrollContext = getScrollContext();

	let overlayRoot: HTMLDivElement | undefined = $state();
	let buttonPositions = $state<ButtonPosition[]>([]);

	let effectiveTrackedModuleIds = $state<string[]>([]);
	let heldTransientModuleIds = $state<string[]>([]);
	let isPlacementTargetsHovered = $state(false);
	let hideTimer: ReturnType<typeof setTimeout> | null = null;

	function arraysEqual(a: string[], b: string[]): boolean {
		return a.length === b.length && a.every((value, index) => value === b[index]);
	}

	function buttonPositionsEqual(a: ButtonPosition[], b: ButtonPosition[]) {
		return (
			a.length === b.length &&
			a.every((value, index) => {
				const other = b[index];
				return (
					value.key === other.key &&
					value.sourceModuleId === other.sourceModuleId &&
					value.x === other.x &&
					value.y === other.y &&
					value.mode === other.mode &&
					value.isActive === other.isActive &&
					getInsertRequestKey(value.insertRequest) === getInsertRequestKey(other.insertRequest)
				);
			})
		);
	}

	function setButtonPositions(nextPositions: ButtonPosition[]) {
		const currentPositions = untrack(() => buttonPositions);
		if (!buttonPositionsEqual(currentPositions, nextPositions)) {
			buttonPositions = nextPositions;
		}
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
		}, PLACEMENT_TARGET_HOLD_MS);
	}

	function isPlacementTargetButtonElement(element: HTMLElement | null) {
		return !!element?.closest('[data-crafter="placement-target-button"]');
	}

	function handlePlacementTargetMouseOver(event: MouseEvent) {
		const target = event.target as HTMLElement | null;
		if (!isPlacementTargetButtonElement(target)) {
			return;
		}

		isPlacementTargetsHovered = true;
		clearHideTimer();
	}

	function handlePlacementTargetMouseOut(event: MouseEvent) {
		const target = event.target as HTMLElement | null;
		if (!isPlacementTargetButtonElement(target)) {
			return;
		}

		const relatedTarget = event.relatedTarget as HTMLElement | null;
		if (isPlacementTargetButtonElement(relatedTarget)) {
			return;
		}

		isPlacementTargetsHovered = false;
	}

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

	function getPointerPositionRelativeToOverlay(point: {
		clientX: number;
		clientY: number;
	}): { x: number; y: number } | null {
		if (!overlayRoot) return null;

		const rootRect = overlayRoot.getBoundingClientRect();
		return {
			x: point.clientX - rootRect.left,
			y: point.clientY - rootRect.top,
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

	function getSlotContext(moduleId: string): SlotPlacementContext {
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

	function getActionBarRelativeRect(): RelativeRect | null {
		if (!overlayRoot || !selectedModuleId) {
			return null;
		}

		const actionBarElement = overlayRoot.parentElement?.querySelector(
			`[data-crafter="overlay-base"][data-module-id="${selectedModuleId}"] [data-crafter="module-action-bar"]`,
		) as HTMLElement | null;

		return actionBarElement ? toRelativeRect(actionBarElement) : null;
	}

	function clearDragTargetState() {
		canvasDrag.setActiveDropRequest(null);
	}

	function getVisibleDefinitions(
		trackedModuleIds: string[],
		excludedModuleId: string | null = canvasDrag.draggedModuleId,
	): PlacementTargetDefinition[] {
		const definitions = trackedModuleIds
			.filter((moduleId) => moduleId !== excludedModuleId)
			.flatMap((moduleId) =>
				calculatePlacementTargetDefinitions(moduleId, getSlotContext(moduleId), getRelativeRect),
			);

		return filterPlacementTargetsByActionBarCollision(
			dedupePlacementTargetDefinitions(definitions, getInsertRequestKey),
			getActionBarRelativeRect(),
		);
	}

	function buildButtonPositions(
		definitions: PlacementTargetDefinition[],
		mode: "insert" | "drop",
		activeDropRequest: InsertRequest | null = null,
	): ButtonPosition[] {
		const activeDropKey = activeDropRequest ? getInsertRequestKey(activeDropRequest) : null;

		return definitions.map((definition) => ({
			...definition,
			mode,
			isActive: activeDropKey === getInsertRequestKey(definition.insertRequest),
			onInsert:
				mode === "insert"
					? () => {
							crafter.requestInsert(definition.insertRequest);
						}
					: null,
		}));
	}

	function updateButtonPositions() {
		if (!overlayRoot) return;

		if (effectiveTrackedModuleIds.length === 0) {
			setButtonPositions([]);
			return;
		}

		setButtonPositions(
			buildButtonPositions(getVisibleDefinitions(effectiveTrackedModuleIds), "insert"),
		);
	}

	function computeDragRenderState() {
		if (!overlayRoot || !canvasDrag.isDragging || !canvasDrag.pointer) {
			return {
				activeDropRequest: null,
				buttonPositions: [] as ButtonPosition[],
			};
		}

		const dragTrackedModuleIds = resolveTrackedModuleIds({
			selectedModuleId,
			hoveredModuleId: canvasInteraction.hoveredModuleId,
			nearestModuleId: canvasInteraction.nearestModuleId,
		});

		const visibleDefinitions = getVisibleDefinitions(dragTrackedModuleIds, null);
		const validDefinitions = filterPlacementTargetDefinitionsByMoveValidity(
			visibleDefinitions,
			crafter.ujlcDocument.ujlc.root,
			canvasDrag.draggedModuleId,
		);
		const relativePoint = getPointerPositionRelativeToOverlay(canvasDrag.pointer);
		const activeDefinition = relativePoint
			? getNearestPlacementTarget(validDefinitions, relativePoint)
			: null;

		return {
			activeDropRequest: activeDefinition?.insertRequest ?? null,
			buttonPositions: buildButtonPositions(
				validDefinitions,
				"drop",
				activeDefinition?.insertRequest ?? null,
			),
		};
	}

	function recomputeDragTargets() {
		const dragState = computeDragRenderState();
		canvasDrag.setActiveDropRequest(dragState.activeDropRequest);
		setButtonPositions(dragState.buttonPositions);
	}

	$effect(() => {
		const refresh = () => {
			if (canvasDrag.isDragging) {
				recomputeDragTargets();
				return;
			}

			updateButtonPositions();
		};

		const unregister = scrollContext.register(refresh);
		const interval = setInterval(refresh, FALLBACK_RECOMPUTE_INTERVAL_MS);
		const resizeObserver = new ResizeObserver(refresh);
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

		root.addEventListener("mouseover", handlePlacementTargetMouseOver);
		root.addEventListener("mouseout", handlePlacementTargetMouseOut);

		return () => {
			root.removeEventListener("mouseover", handlePlacementTargetMouseOver);
			root.removeEventListener("mouseout", handlePlacementTargetMouseOut);
		};
	});

	$effect(() => {
		if (canvasDrag.isDragging) {
			clearHideTimer();
			if (heldTransientModuleIds.length > 0) {
				heldTransientModuleIds = [];
			}
			if (isPlacementTargetsHovered) {
				isPlacementTargetsHovered = false;
			}
			return;
		}

		clearDragTargetState();

		const liveTransientModuleIds = resolveTransientTrackedModuleIds({
			hoveredModuleId: canvasInteraction.hoveredModuleId,
			nearestModuleId: canvasInteraction.nearestModuleId,
		});
		const resolved = resolvePlacementTargetVisibility({
			selectedModuleId,
			liveTransientModuleIds,
			heldTransientModuleIds,
			isPlacementTargetsHovered,
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
	});

	$effect(() => {
		// Track document changes and canvas state as dependencies
		const _ = crafter.ujlcDocument;
		const _hoveredModuleId = canvasInteraction.hoveredModuleId;
		const _nearestModuleId = canvasInteraction.nearestModuleId;
		const _pointer = canvasDrag.pointer;

		if (!overlayRoot) {
			return;
		}

		if (canvasDrag.isDragging) {
			recomputeDragTargets();
			return;
		}

		updateButtonPositions();
	});
</script>

<div
	bind:this={overlayRoot}
	class="pointer-events-none absolute inset-0"
	data-crafter="module-placement-targets"
>
	{#if buttonPositions.length > 0}
		{#each buttonPositions as pos (pos.key)}
			<PlacementTargetButton
				x={pos.x}
				y={pos.y}
				onInsert={pos.onInsert}
				mode={pos.mode}
				isActive={pos.isActive}
				zIndex={45}
			/>
		{/each}
	{/if}
</div>
