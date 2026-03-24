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
	import {
		findParentOfNode,
		isValidMoveInsertRequest,
		ROOT_NODE_ID,
		ROOT_SLOT_NAME,
	} from "$lib/utils/ujlc-tree.js";
	import { getCanvasDragHomeTrackedModuleIds } from "$lib/utils/canvas-drag-home.js";
	import type { RelativeRect } from "../canvas/targeting/quick-action-position.js";
	import PlacementTargetButton from "./PlacementTargetButton.svelte";
	import SlotPlaceholderButton from "./SlotPlaceholderButton.svelte";
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
	} from "../canvas/targeting/placement-target-hit-testing.js";
	import { resolveActiveDragTarget } from "../canvas/targeting/drag-target-resolver.js";
	import {
		getSlotPlaceholderInsertRequest,
		getSlotPlaceholderKey,
		mergeSemanticallyEquivalentInsertTargets,
		SLOT_PLACEHOLDER_HOST_SELECTOR,
	} from "../canvas/targeting/slot-placeholder-targets.js";
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
		width?: number;
		height?: number;
		onInsert: (() => void) | null;
		mode: "insert" | "drop";
		isActive: boolean;
		kind: "placement" | "placeholder";
	}

	interface RenderTargetDefinition extends PlacementTargetDefinition {
		kind: "placement" | "placeholder";
		width?: number;
		height?: number;
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
					value.width === other.width &&
					value.height === other.height &&
					value.mode === other.mode &&
					value.isActive === other.isActive &&
					value.kind === other.kind &&
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
		return !!element?.closest(
			'[data-crafter="placement-target-button"], [data-crafter="slot-placeholder-target"]',
		);
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
	): RenderTargetDefinition[] {
		const definitions = trackedModuleIds
			.filter((moduleId) => moduleId !== excludedModuleId)
			.flatMap((moduleId) =>
				calculatePlacementTargetDefinitions(moduleId, getSlotContext(moduleId), getRelativeRect),
			);

		return filterPlacementTargetsByActionBarCollision(
			dedupePlacementTargetDefinitions(definitions, getInsertRequestKey),
			getActionBarRelativeRect(),
		).map((definition) => ({ ...definition, kind: "placement" as const }));
	}

	function buildButtonPositions(
		definitions: RenderTargetDefinition[],
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

	function getPlaceholderDefinitions(): RenderTargetDefinition[] {
		if (!overlayRoot) {
			return [];
		}

		const hosts = Array.from(
			containerElement.querySelectorAll(SLOT_PLACEHOLDER_HOST_SELECTOR),
		).filter((element): element is HTMLElement => element instanceof HTMLElement);

		return hosts.flatMap((host) => {
			const rect = toRelativeRect(host);
			if (!rect) {
				return [];
			}

			const slotName = host.getAttribute("data-slot-name");
			if (!slotName) {
				return [];
			}

			const ownerModuleId = host.getAttribute("data-slot-owner-module-id") || null;

			return [
				{
					key: `placeholder-${getSlotPlaceholderKey(ownerModuleId, slotName)}`,
					sourceModuleId: ownerModuleId ?? ROOT_NODE_ID,
					insertRequest: getSlotPlaceholderInsertRequest(ownerModuleId, slotName),
					x: rect.left,
					y: rect.top,
					width: rect.width,
					height: rect.height,
					kind: "placeholder" as const,
				},
			];
		});
	}

	function getValidPlaceholderDefinitions(): RenderTargetDefinition[] {
		const definitions = getPlaceholderDefinitions();
		if (!canvasDrag.draggedModuleId) {
			return definitions;
		}

		return definitions.filter((definition) =>
			isValidMoveInsertRequest(
				crafter.ujlcDocument.ujlc.root,
				canvasDrag.draggedModuleId as string,
				definition.insertRequest,
			),
		);
	}

	function mergeRenderableDefinitions(
		definitions: RenderTargetDefinition[],
	): RenderTargetDefinition[] {
		return mergeSemanticallyEquivalentInsertTargets(crafter.ujlcDocument.ujlc.root, definitions);
	}

	function updateButtonPositions() {
		if (!overlayRoot) return;

		const mergedDefinitions = mergeRenderableDefinitions([
			...(effectiveTrackedModuleIds.length > 0
				? getVisibleDefinitions(effectiveTrackedModuleIds)
				: []),
			...getPlaceholderDefinitions(),
		]);

		setButtonPositions(buildButtonPositions(mergedDefinitions, "insert"));
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
		const homeTrackedModuleIds = canvasInteraction.isHoveringDraggedSource
			? getCanvasDragHomeTrackedModuleIds(canvasDrag.homePosition)
			: [];
		const resolvedDragTrackedModuleIds = [
			...new Set([...dragTrackedModuleIds, ...homeTrackedModuleIds]),
		];

		const visibleDefinitions = getVisibleDefinitions(resolvedDragTrackedModuleIds, null);
		const validDefinitions = filterPlacementTargetDefinitionsByMoveValidity(
			visibleDefinitions,
			crafter.ujlcDocument.ujlc.root,
			canvasDrag.draggedModuleId,
		).map((definition) => ({
			...definition,
			kind: "placement" as const,
		}));
		const validPlaceholderDefinitions = getValidPlaceholderDefinitions();
		const relativePoint = getPointerPositionRelativeToOverlay(canvasDrag.pointer);
		const mergedDefinitions = mergeRenderableDefinitions([
			...validDefinitions,
			...validPlaceholderDefinitions,
		]);
		const activeDefinition = resolveActiveDragTarget({
			rootNodes: crafter.ujlcDocument.ujlc.root,
			definitions: mergedDefinitions,
			pointer: relativePoint,
			activePlaceholderSlot: canvasInteraction.activePlaceholderSlot,
			isHoveringDraggedSource: canvasInteraction.isHoveringDraggedSource,
			homePosition: canvasDrag.homePosition,
		});

		return {
			activeDropRequest: activeDefinition?.insertRequest ?? null,
			buttonPositions: buildButtonPositions(
				mergedDefinitions,
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
		const _isHoveringDraggedSource = canvasInteraction.isHoveringDraggedSource;
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
			{#if pos.kind === "placeholder"}
				<SlotPlaceholderButton
					x={pos.x}
					y={pos.y}
					width={pos.width ?? 0}
					height={pos.height ?? 0}
					onInsert={pos.onInsert}
					mode={pos.mode}
					isActive={pos.isActive}
					zIndex={40}
				/>
			{:else}
				<PlacementTargetButton
					x={pos.x}
					y={pos.y}
					onInsert={pos.onInsert}
					mode={pos.mode}
					isActive={pos.isActive}
					zIndex={45}
				/>
			{/if}
		{/each}
	{/if}
</div>
