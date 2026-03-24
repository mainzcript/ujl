<!-- Preview that composes the UJLC document and renders it with UJLT tokens via AdapterRoot. -->
<script lang="ts">
	import type {
		UJLCDocument,
		UJLTDocument,
		UJLAbstractNode,
		UJLTTokenSet,
		UJLCModuleObject,
	} from "@ujl-framework/types";
	import type { Composer } from "@ujl-framework/core";
	import { AdapterRoot } from "@ujl-framework/adapter-svelte";
	import { getContext } from "svelte";
	import {
		createCanvasDragContext,
		createCanvasInteractionContext,
		COMPOSER_CONTEXT,
		CRAFTER_CONTEXT,
		SHADOW_ROOT_CONTEXT,
		createScrollContext,
		setCanvasDragContext,
		setCanvasInteractionContext,
		setScrollContext,
		type CrafterContext,
		type ShadowRootContext,
		type CrafterMode,
	} from "$lib/stores/index.js";
	import type { InsertRequest } from "$lib/stores/features/clipboard.js";
	import { logger } from "$lib/utils/logger.js";
	import { createScopedSelector } from "$lib/utils/scoped-dom.js";
	import { generateThemeCSSVariables } from "@ujl-framework/ui/utils";
	import {
		CanvasDragGhost,
		ModuleActionBar,
		HoverIndicator,
		SelectionIndicator,
		SelectionParentIndicators,
		ModulePlacementTargets,
	} from "../overlays/index.js";
	import {
		findNodeById,
		findParentOfNode,
		isValidMoveInsertRequest,
	} from "$lib/utils/ujlc-tree.js";
	import {
		getCanvasDragHomePosition,
		type CanvasDragHomePosition,
	} from "$lib/utils/canvas-drag-home.js";
	import {
		getSelectionParentModuleIds,
		getSelectedModuleId,
	} from "../overlays/selection-parent-indicators.js";
	import {
		resolvePointerTargetsFromPoint,
		resolvePointerTargetsFromTarget,
		type ActiveSlotTarget,
	} from "./targeting/pointer-targets.js";
	import { isCanvasOverlayElement } from "./targeting/canvas-overlay-elements.js";
	import {
		type AutoScrollEdgeState,
		getAutoScrollDelta,
		getAutoScrollEdgeZone,
		resolveAutoScrollEdgeState,
	} from "./targeting/auto-scroll.js";
	import { findNearestModuleId, getDirectSlotChildIds } from "./targeting/quick-action-nearest.js";
	import {
		augmentPreviewDocumentWithPlaceholders,
		createPreviewComposer,
	} from "./preview-placeholders.js";

	// Create preview-local contexts for overlay positioning and canvas interaction state.
	const scrollContext = createScrollContext();
	setScrollContext(scrollContext);
	const canvasInteractionContext = createCanvasInteractionContext();
	setCanvasInteractionContext(canvasInteractionContext);
	const canvasDragContext = createCanvasDragContext();
	setCanvasDragContext(canvasDragContext);

	const AUTO_SCROLL_EDGE_PX = 64;
	const AUTO_SCROLL_MAX_STEP_PX = 18;
	const AUTO_SCROLL_START_DELAY_MS = 500;

	function hasChildren(node: UJLAbstractNode): node is UJLAbstractNode & {
		props: { children?: UJLAbstractNode[] };
	} {
		return "children" in node.props;
	}

	function isEditableModule(
		node: UJLAbstractNode,
	): node is UJLAbstractNode & { meta: { moduleId: string; isModuleRoot: true } } {
		if (!("meta" in node)) return false;
		const meta = node.meta as { moduleId?: string; isModuleRoot?: boolean } | undefined;
		return meta?.isModuleRoot === true && typeof meta?.moduleId === "string";
	}

	let {
		ujlcDocument,
		ujltDocument,
		mode = "system",
		crafterMode = "editor",
		editorTokenSet,
	}: {
		ujlcDocument: UJLCDocument;
		ujltDocument: UJLTDocument;
		mode?: "light" | "dark" | "system";
		crafterMode?: CrafterMode;
		editorTokenSet?: UJLTTokenSet;
	} = $props();

	const crafter = getContext<CrafterContext>(CRAFTER_CONTEXT);
	const shadowRootContext = getContext<ShadowRootContext | undefined>(SHADOW_ROOT_CONTEXT);

	const dom = createScopedSelector(crafter.instanceId, shadowRootContext?.value);
	const hitTestRoot = shadowRootContext?.value ?? document;

	const selectedNodeId = $derived.by(() => {
		return crafter.mode === "editor" ? crafter.selectedNodeId : null;
	});

	const selectedModuleId = $derived(getSelectedModuleId(selectedNodeId));

	const selectionParentModuleIds = $derived(
		getSelectionParentModuleIds(crafter.ujlcDocument.ujlc.root, selectedNodeId),
	);

	const composer = getContext<Composer>(COMPOSER_CONTEXT);
	let previewComposer = $state(createPreviewComposer(composer));
	let composeRunId = 0;

	let ast = $state<UJLAbstractNode | null>(null);

	$effect(() => {
		previewComposer = createPreviewComposer(composer);

		const unsubscribe = composer.getRegistry().onChanged(() => {
			previewComposer = createPreviewComposer(composer);
		});

		return () => {
			unsubscribe();
		};
	});

	$effect(() => {
		const activeComposer = crafterMode === "editor" ? previewComposer : composer;
		const activeDocument =
			crafterMode === "editor"
				? augmentPreviewDocumentWithPlaceholders(ujlcDocument)
				: ujlcDocument;
		const currentRunId = ++composeRunId;

		activeComposer.compose(activeDocument).then((composedAst) => {
			if (currentRunId === composeRunId) {
				ast = composedAst;
			}
		});
	});

	const tokenSet = $derived(ujltDocument.ujlt.tokens);

	const editorCssVars = $derived(editorTokenSet ? generateThemeCSSVariables(editorTokenSet) : {});

	function findEditableNodeByModuleId(
		node: UJLAbstractNode,
		targetModuleId: string,
	): (UJLAbstractNode & { meta: { moduleId: string; isModuleRoot: true } }) | null {
		if (isEditableModule(node) && node.meta.moduleId === targetModuleId) {
			return node;
		}

		if (hasChildren(node) && node.props.children) {
			for (const child of node.props.children) {
				const found = findEditableNodeByModuleId(child, targetModuleId);
				if (found) return found;
			}
		}

		if (node.type === "call-to-action" && "actionButtons" in node.props) {
			const buttons = node.props.actionButtons;
			if (buttons.primary) {
				const found = findEditableNodeByModuleId(buttons.primary, targetModuleId);
				if (found) return found;
			}
			if (buttons.secondary) {
				const found = findEditableNodeByModuleId(buttons.secondary, targetModuleId);
				if (found) return found;
			}
		}

		return null;
	}

	function handlePreviewClick(event: MouseEvent) {
		if (crafterMode !== "editor" || crafter.mode !== "editor") return;
		if (canvasDragContext.isDragging) return;

		const clickedElement = (event.target as HTMLElement).closest("[data-ujl-module-id]");
		if (!clickedElement) return;

		event.preventDefault();
		event.stopPropagation();

		const moduleId = clickedElement.getAttribute("data-ujl-module-id");
		if (!moduleId || !ast) return;

		const editableNode = findEditableNodeByModuleId(ast, moduleId);
		if (!editableNode) return;

		crafter.expandToNode(editableNode.meta.moduleId);
		crafter.setSelectedNodeId(editableNode.meta.moduleId);
		scrollToNodeInTree(editableNode.meta.moduleId);
	}

	function scrollToNodeInTree(nodeId: string, remainingFrames = 10) {
		const treeItem = dom.querySelector(`[data-tree-node-id="${nodeId}"]`);
		if (treeItem) {
			treeItem.scrollIntoView({ behavior: "smooth", block: "center" });
			return;
		}

		if (remainingFrames <= 0) {
			logger.warn("Tree item not found after expansion:", nodeId);
			return;
		}

		requestAnimationFrame(() => {
			scrollToNodeInTree(nodeId, remainingFrames - 1);
		});
	}

	let scrollContainerRef: HTMLDivElement | undefined = $state(undefined);

	function getScrollContainer(): HTMLDivElement | null {
		return (
			dom.querySelector<HTMLDivElement>('[data-ujl-scroll-container="canvas"]') ??
			scrollContainerRef ??
			null
		);
	}

	function scrollToComponentInPreview(moduleId: string, retries = 3) {
		const element = dom.querySelector(`[data-ujl-module-id="${moduleId}"]`);
		const container = getScrollContainer();

		if (!element || !container) {
			if (retries > 0) {
				requestAnimationFrame(() => {
					scrollToComponentInPreview(moduleId, retries - 1);
				});
			}
			return;
		}

		const elementRect = element.getBoundingClientRect();
		const containerRect = container.getBoundingClientRect();

		const visibleTop = Math.max(elementRect.top, containerRect.top);
		const visibleBottom = Math.min(elementRect.bottom, containerRect.bottom);
		const visibleHeight = Math.max(0, visibleBottom - visibleTop);
		const elementVisibilityRatio = visibleHeight / elementRect.height;

		const previewFillRatio = elementRect.height / containerRect.height;
		const needsScroll = elementVisibilityRatio < 0.9;

		if (!needsScroll) {
			return;
		}

		let targetScroll: number;

		if (previewFillRatio > 0.5) {
			targetScroll = container.scrollTop + (elementRect.top - containerRect.top) - 100;
		} else {
			targetScroll =
				container.scrollTop +
				(elementRect.top - containerRect.top) -
				containerRect.height / 2 +
				elementRect.height / 2 -
				100;
		}

		container.scrollTo({
			top: Math.max(0, targetScroll),
			behavior: "smooth",
		});
	}

	// Keep the selected module in view after selection changes.
	$effect(() => {
		if (crafterMode === "editor" && selectedNodeId && ast && scrollContainer) {
			requestAnimationFrame(() => {
				scrollToComponentInPreview(selectedNodeId);
			});
		}
	});

	interface ModuleActionBarState {
		moduleId: string;
		dragDisplayName: string;
		dragIconSvg: string | null;
		dragHomePosition: CanvasDragHomePosition | null;
		canMoveUp: boolean;
		canMoveDown: boolean;
	}

	let moduleActionBarState = $state<ModuleActionBarState | null>(null);

	// Use the real scrollable canvas element instead of the preview root.
	let scrollContainer = $derived(
		scrollContainerRef
			? ((dom.querySelector('[data-ujl-scroll-container="canvas"]') as HTMLElement | null) ??
					scrollContainerRef)
			: null,
	);
	let wasDragging = $state(false);

	function getElementsFromPointForCanvas(point: {
		clientX: number;
		clientY: number;
	}): HTMLElement[] {
		const maybeElementsFromPoint = (
			hitTestRoot as typeof hitTestRoot & {
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
			hitTestRoot as typeof hitTestRoot & {
				elementFromPoint?: (x: number, y: number) => Element | null;
			}
		).elementFromPoint;

		if (typeof maybeElementFromPoint === "function") {
			const element = maybeElementFromPoint.call(hitTestRoot, point.clientX, point.clientY);
			return element instanceof HTMLElement ? [element] : [];
		}

		return [];
	}

	function isPointerOverDraggedSource(
		point: { clientX: number; clientY: number },
		draggedModuleId: string | null,
	): boolean {
		if (!draggedModuleId) {
			return false;
		}

		return getElementsFromPointForCanvas(point).some((element) => {
			if (element.closest(`[data-ujl-module-id="${draggedModuleId}"]`)) {
				return true;
			}

			return (
				element.closest('[data-crafter="overlay-base"]')?.getAttribute("data-module-id") ===
				draggedModuleId
			);
		});
	}

	function resolvePointerTargetsForCanvasEvent(event: MouseEvent) {
		const point = { clientX: event.clientX, clientY: event.clientY };
		const target = event.target as HTMLElement | null;

		return isCanvasOverlayElement(target)
			? resolvePointerTargetsFromPoint(point, isCanvasOverlayElement, hitTestRoot)
			: resolvePointerTargetsFromTarget(target, isCanvasOverlayElement);
	}

	function toActiveSlotTarget(
		homePosition: CanvasDragHomePosition | null,
	): ActiveSlotTarget | null {
		if (!homePosition) {
			return null;
		}

		return {
			ownerModuleId: homePosition.ownerModuleId,
			slotName: homePosition.slotName,
		};
	}

	function computeNearestModuleId(
		slot: ActiveSlotTarget,
		point: { clientX: number; clientY: number },
	) {
		const candidateIds = getDirectSlotChildIds(
			crafter.ujlcDocument.ujlc.root,
			slot.ownerModuleId,
			slot.slotName,
		);

		return findNearestModuleId(candidateIds, { x: point.clientX, y: point.clientY }, (moduleId) => {
			const moduleElement = dom.querySelector(
				`[data-ujl-module-id="${moduleId}"]`,
			) as HTMLElement | null;
			return moduleElement?.getBoundingClientRect() ?? null;
		});
	}

	function updateCanvasTargetsFromPointer(
		point: { clientX: number; clientY: number },
		targets: {
			hoveredModuleId: string | null;
			activeSlot: ActiveSlotTarget | null;
			activePlaceholderSlot: ActiveSlotTarget | null;
			isHoveringDraggedSource: boolean;
		},
	) {
		const nearestSlot =
			targets.activePlaceholderSlot ??
			targets.activeSlot ??
			canvasInteractionContext.lastValidSlot ??
			toActiveSlotTarget(canvasDragContext.homePosition);

		canvasInteractionContext.updateState({
			pointer: point,
			hoveredModuleId: targets.hoveredModuleId,
			activeSlot: targets.activePlaceholderSlot ?? targets.activeSlot,
			activePlaceholderSlot: targets.activePlaceholderSlot,
			isHoveringDraggedSource: targets.isHoveringDraggedSource,
			nearestModuleId: nearestSlot ? computeNearestModuleId(nearestSlot, point) : null,
		});
	}

	function handleCanvasPointerMove(event: MouseEvent) {
		if (canvasDragContext.isDragging) {
			return;
		}

		const point = { clientX: event.clientX, clientY: event.clientY };
		const targets = resolvePointerTargetsForCanvasEvent(event);

		updateCanvasTargetsFromPointer(point, {
			...targets,
			isHoveringDraggedSource: isPointerOverDraggedSource(point, canvasDragContext.draggedModuleId),
		});
	}

	function handleCanvasPointerLeave() {
		if (canvasDragContext.isDragging) {
			return;
		}

		canvasInteractionContext.clear();
	}

	$effect(() => {
		if (!scrollContainer) return;

		const handleScroll = () => {
			scrollContext.updatePosition(scrollContainer.scrollLeft, scrollContainer.scrollTop);
		};

		handleScroll();
		scrollContainer.addEventListener("scroll", handleScroll, { passive: true });

		return () => {
			scrollContainer.removeEventListener("scroll", handleScroll);
		};
	});

	$effect(() => {
		if (!scrollContainer) {
			return;
		}

		scrollContainer.addEventListener("mousemove", handleCanvasPointerMove, { passive: true });
		scrollContainer.addEventListener("mouseleave", handleCanvasPointerLeave, { passive: true });

		return () => {
			scrollContainer.removeEventListener("mousemove", handleCanvasPointerMove);
			scrollContainer.removeEventListener("mouseleave", handleCanvasPointerLeave);
		};
	});

	$effect(() => {
		if (!canvasDragContext.isDragging || !canvasDragContext.pointer) {
			return;
		}

		updateCanvasTargetsFromPointer(canvasDragContext.pointer, {
			...resolvePointerTargetsFromPoint(
				canvasDragContext.pointer,
				isCanvasOverlayElement,
				hitTestRoot,
			),
			isHoveringDraggedSource: isPointerOverDraggedSource(
				canvasDragContext.pointer,
				canvasDragContext.draggedModuleId,
			),
		});
	});

	$effect(() => {
		if (canvasDragContext.isDragging) {
			wasDragging = true;
			return;
		}

		if (wasDragging) {
			wasDragging = false;
			canvasInteractionContext.clear();
		}
	});

	$effect(() => {
		if (!scrollContainer) {
			return;
		}

		const refreshTargets = () => {
			if (!canvasInteractionContext.pointer) {
				return;
			}

			updateCanvasTargetsFromPointer(canvasInteractionContext.pointer, {
				...resolvePointerTargetsFromPoint(
					canvasInteractionContext.pointer,
					isCanvasOverlayElement,
					hitTestRoot,
				),
				isHoveringDraggedSource: isPointerOverDraggedSource(
					canvasInteractionContext.pointer,
					canvasDragContext.draggedModuleId,
				),
			});
		};

		const unregister = scrollContext.register(refreshTargets);
		const interval = setInterval(refreshTargets, 200);
		const resizeObserver = new ResizeObserver(refreshTargets);
		resizeObserver.observe(scrollContainer);

		return () => {
			unregister();
			clearInterval(interval);
			resizeObserver.disconnect();
		};
	});

	$effect(() => {
		if (!scrollContainer || !canvasDragContext.isDragging) return;

		let frameId: number | null = null;
		let autoScrollEdgeState: AutoScrollEdgeState = {
			activeZone: null,
			zoneEnteredAt: null,
		};

		const tick = () => {
			if (!scrollContainer || !canvasDragContext.isDragging || !canvasDragContext.pointer) {
				return;
			}

			const containerRect = scrollContainer.getBoundingClientRect();
			const activeZone = getAutoScrollEdgeZone(
				canvasDragContext.pointer.clientY,
				containerRect,
				AUTO_SCROLL_EDGE_PX,
			);
			const resolved = resolveAutoScrollEdgeState(
				activeZone,
				autoScrollEdgeState,
				performance.now(),
				AUTO_SCROLL_START_DELAY_MS,
			);
			autoScrollEdgeState = resolved.nextState;
			const delta = resolved.isScrollActive
				? getAutoScrollDelta(
						canvasDragContext.pointer.clientY,
						containerRect,
						AUTO_SCROLL_EDGE_PX,
						AUTO_SCROLL_MAX_STEP_PX,
					)
				: 0;

			if (delta !== 0) {
				const nextScrollTop = Math.max(
					0,
					Math.min(
						scrollContainer.scrollTop + delta,
						scrollContainer.scrollHeight - scrollContainer.clientHeight,
					),
				);
				scrollContainer.scrollTop = nextScrollTop;
			}

			frameId = requestAnimationFrame(tick);
		};

		frameId = requestAnimationFrame(tick);

		return () => {
			if (frameId !== null) {
				cancelAnimationFrame(frameId);
			}
		};
	});

	// Recompute the selected module action bar whenever the selection changes.
	$effect(() => {
		if (crafterMode !== "editor" || !selectedNodeId || !ast || !scrollContainerRef) {
			moduleActionBarState = null;
			return;
		}

		const moduleId = getModuleIdFromNodeId(selectedNodeId);
		if (!moduleId) {
			moduleActionBarState = null;
			return;
		}

		const element = dom.querySelector(`[data-ujl-module-id="${moduleId}"]`) as HTMLElement | null;
		if (!element) {
			moduleActionBarState = null;
			return;
		}

		const editableNode = findEditableNodeByModuleId(ast, moduleId);
		if (!editableNode) {
			moduleActionBarState = null;
			return;
		}

		const { canMoveUp, canMoveDown } = getModuleMoveCapabilities(moduleId);
		const { dragDisplayName, dragIconSvg } = getModuleDragMetadata(moduleId);
		const dragHomePosition = getCanvasDragHomePosition(crafter.ujlcDocument.ujlc.root, moduleId);

		moduleActionBarState = {
			moduleId,
			dragDisplayName,
			dragIconSvg,
			dragHomePosition,
			canMoveUp,
			canMoveDown,
		};
	});

	function getModuleIdFromNodeId(nodeId: string): string | null {
		if (!nodeId.includes(".")) {
			return nodeId;
		}
		const parts = nodeId.split(".");
		return parts[0] || null;
	}

	function getModuleMoveCapabilities(moduleId: string): {
		canMoveUp: boolean;
		canMoveDown: boolean;
	} {
		const parentInfo = findParentOfNode(crafter.ujlcDocument.ujlc.root, moduleId);
		if (!parentInfo) return { canMoveUp: false, canMoveDown: false };

		const { slotName, index } = parentInfo;

		let slotContent: UJLCModuleObject[];
		if (parentInfo.parent && parentInfo.parent.slots && parentInfo.parent.slots[slotName]) {
			slotContent = parentInfo.parent.slots[slotName];
		} else if (slotName === "__root__") {
			slotContent = crafter.ujlcDocument.ujlc.root;
		} else {
			return { canMoveUp: false, canMoveDown: false };
		}

		return {
			canMoveUp: index > 0,
			canMoveDown: index < slotContent.length - 1,
		};
	}

	function getModuleDragMetadata(moduleId: string): {
		dragDisplayName: string;
		dragIconSvg: string | null;
	} {
		const moduleNode = findNodeById(crafter.ujlcDocument.ujlc.root, moduleId);
		if (!moduleNode) {
			return {
				dragDisplayName: moduleId,
				dragIconSvg: null,
			};
		}

		return {
			dragDisplayName: composer.getRegistry().getDisplayName(moduleNode),
			dragIconSvg: composer.getRegistry().getModule(moduleNode.type)?.getSvgIcon() ?? null,
		};
	}

	function handleModuleActionBarSelect() {
		const state = moduleActionBarState;
		if (!state) return;
		crafter.expandToNode(state.moduleId);
		crafter.setSelectedNodeId(state.moduleId);
	}

	function handleModuleActionBarMoveUp() {
		const state = moduleActionBarState;
		if (!state) return;
		const moduleId = state.moduleId;

		const parentInfo = findParentOfNode(crafter.ujlcDocument.ujlc.root, moduleId);
		if (!parentInfo) return;

		const { parent, slotName, index } = parentInfo;
		if (index <= 0) return;

		let slotContent: UJLCModuleObject[];
		let parentId: string;
		if (parent && parent.slots && parent.slots[slotName]) {
			slotContent = parent.slots[slotName];
			parentId = parent.meta.id;
		} else if (slotName === "__root__") {
			slotContent = crafter.ujlcDocument.ujlc.root;
			parentId = "__root__";
		} else {
			return;
		}

		const targetId = slotContent[index - 1]?.meta.id;
		if (targetId) {
			crafter.operations.moveNode(
				moduleId,
				targetId,
				parentId === "__root__" ? undefined : parentId,
				"before",
			);
		}
	}

	function handleModuleActionBarMoveDown() {
		const state = moduleActionBarState;
		if (!state) return;
		const moduleId = state.moduleId;

		const parentInfo = findParentOfNode(crafter.ujlcDocument.ujlc.root, moduleId);
		if (!parentInfo) return;

		const { parent, slotName, index } = parentInfo;

		let slotContent: UJLCModuleObject[];
		let parentId: string;
		if (parent && parent.slots && parent.slots[slotName]) {
			slotContent = parent.slots[slotName];
			parentId = parent.meta.id;
		} else if (slotName === "__root__") {
			slotContent = crafter.ujlcDocument.ujlc.root;
			parentId = "__root__";
		} else {
			return;
		}

		if (index === -1 || index >= slotContent.length - 1) return;

		const targetId = slotContent[index + 1]?.meta.id;
		if (targetId) {
			crafter.operations.moveNode(
				moduleId,
				targetId,
				parentId === "__root__" ? undefined : parentId,
				"after",
			);
		}
	}

	async function handleModuleActionBarCopy() {
		if (!moduleActionBarState) return;
		await crafter.copyNode(moduleActionBarState.moduleId);
	}

	async function handleModuleActionBarCut() {
		if (!moduleActionBarState) return;
		await crafter.cutNode(moduleActionBarState.moduleId);
	}

	async function handleModuleActionBarPaste() {
		if (!moduleActionBarState) return;
		await crafter.pasteNode(moduleActionBarState.moduleId);
	}

	function handleModuleActionBarInsert() {
		if (!moduleActionBarState) return;
		crafter.requestInsert(moduleActionBarState.moduleId);
	}

	function handleModuleActionBarDragDrop(request: InsertRequest) {
		const state = moduleActionBarState;
		if (!state) return;
		if (!isValidMoveInsertRequest(crafter.ujlcDocument.ujlc.root, state.moduleId, request)) {
			return;
		}

		crafter.operations.moveNode(
			state.moduleId,
			request.targetId,
			request.slotName,
			request.position,
		);
	}

	function handleModuleActionBarDelete() {
		if (!moduleActionBarState) return;
		crafter.deleteNode(moduleActionBarState.moduleId);
		moduleActionBarState = null;
	}
</script>

<div
	bind:this={scrollContainerRef}
	class="relative h-full w-full"
	class:ujl-editor-mode={crafterMode === "editor"}
	role={crafterMode === "editor" ? "application" : undefined}
	onclick={handlePreviewClick}
	style={editorTokenSet && crafterMode === "editor"
		? `--editor-accent-light: ${editorCssVars["--accent-light"] ?? "var(--accent-light)"}; --editor-accent-dark: ${editorCssVars["--accent-dark"] ?? "var(--accent-dark)"}; --editor-radius: ${editorCssVars["--radius"] ?? "var(--radius)"};`
		: undefined}
>
	{#if ast}
		<AdapterRoot node={ast} {tokenSet} {mode} showMetadata={true} />
	{:else}
		<div class="flex h-full w-full items-center justify-center">
			<div class="text-sm text-muted-foreground">Loading preview...</div>
		</div>
	{/if}

	<!-- Selection Overlay with {#key} Pattern -->
	{#key selectedNodeId}
		{#if crafterMode === "editor" && selectedModuleId && selectionParentModuleIds.length > 0 && scrollContainer}
			<SelectionParentIndicators
				moduleId={selectedModuleId}
				parentModuleIds={selectionParentModuleIds}
				containerElement={scrollContainer}
			/>
		{/if}

		{#if crafterMode === "editor" && selectedNodeId && scrollContainer}
			<SelectionIndicator
				moduleId={selectedModuleId ?? selectedNodeId}
				containerElement={scrollContainer}
			/>
		{/if}
	{/key}

	<!-- Hover Overlay (Modul-Hover) -->
	{#if crafterMode === "editor" && scrollContainer && !canvasDragContext.isDragging}
		<HoverIndicator containerElement={scrollContainer} {selectedModuleId} />
	{/if}

	{#if crafterMode === "editor"}
		<CanvasDragGhost containerElement={scrollContainerRef ?? null} />
	{/if}

	<!-- Module Quick Actions -->
	{#if crafterMode === "editor" && scrollContainer}
		<ModulePlacementTargets containerElement={scrollContainer} {selectedModuleId} />
	{/if}

	<!-- Module Actions Overlay with {#key} Pattern -->
	{#key selectedNodeId}
		{#if moduleActionBarState && crafterMode === "editor" && scrollContainer}
			<ModuleActionBar
				moduleId={moduleActionBarState.moduleId}
				containerElement={scrollContainer}
				dragDisplayName={moduleActionBarState.dragDisplayName}
				dragIconSvg={moduleActionBarState.dragIconSvg}
				dragHomePosition={moduleActionBarState.dragHomePosition}
				canMoveUp={moduleActionBarState.canMoveUp}
				canMoveDown={moduleActionBarState.canMoveDown}
				onSelect={handleModuleActionBarSelect}
				onMoveUp={handleModuleActionBarMoveUp}
				onMoveDown={handleModuleActionBarMoveDown}
				onCopy={handleModuleActionBarCopy}
				onCut={handleModuleActionBarCut}
				onPaste={handleModuleActionBarPaste}
				onDelete={handleModuleActionBarDelete}
				onInsert={handleModuleActionBarInsert}
				onDragDrop={handleModuleActionBarDragDrop}
				canCopy={true}
				canCut={true}
				canPaste={crafter.hasClipboardContent}
				canInsert={true}
			/>
		{/if}
	{/key}
</div>
