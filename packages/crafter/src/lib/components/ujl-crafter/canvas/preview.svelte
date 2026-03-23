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
		COMPOSER_CONTEXT,
		CRAFTER_CONTEXT,
		SHADOW_ROOT_CONTEXT,
		createHoverTargetContext,
		createScrollContext,
		setHoverTargetContext,
		setScrollContext,
		type CrafterContext,
		type ShadowRootContext,
		type CrafterMode,
	} from "$lib/stores/index.js";
	import { logger } from "$lib/utils/logger.js";
	import { createScopedSelector } from "$lib/utils/scoped-dom.js";
	import { generateThemeCSSVariables } from "@ujl-framework/ui/utils";
	import {
		Island,
		HoverIndicator,
		SelectionIndicator,
		SelectionParentIndicators,
		ModuleQuickActions,
	} from "../overlays/index.js";
	import { findParentOfNode } from "$lib/utils/ujlc-tree.js";
	import {
		getSelectionParentModuleIds,
		getSelectedModuleId,
	} from "../overlays/selection-parent-indicators.js";

	// Create preview-local contexts for overlay positioning and hover state.
	const scrollContext = createScrollContext();
	setScrollContext(scrollContext);
	const hoverTargetContext = createHoverTargetContext();
	setHoverTargetContext(hoverTargetContext);

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

	const selectedNodeId = $derived.by(() => {
		return crafter.mode === "editor" ? crafter.selectedNodeId : null;
	});

	const selectedModuleId = $derived(getSelectedModuleId(selectedNodeId));

	const selectionParentModuleIds = $derived(
		getSelectionParentModuleIds(crafter.ujlcDocument.ujlc.root, selectedNodeId),
	);

	const composer = getContext<Composer>(COMPOSER_CONTEXT);

	let ast = $state<UJLAbstractNode | null>(null);

	$effect(() => {
		composer.compose(ujlcDocument).then((composedAst) => {
			ast = composedAst;
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

	interface IslandState {
		moduleId: string;
		canMoveUp: boolean;
		canMoveDown: boolean;
	}

	let islandState = $state<IslandState | null>(null);

	// Use the real scrollable canvas element instead of the preview root.
	let scrollContainer = $derived(
		scrollContainerRef
			? ((dom.querySelector('[data-ujl-scroll-container="canvas"]') as HTMLElement | null) ??
					scrollContainerRef)
			: null,
	);

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

	// Recompute island actions whenever the selection changes.
	$effect(() => {
		if (crafterMode !== "editor" || !selectedNodeId || !ast || !scrollContainerRef) {
			islandState = null;
			return;
		}

		const moduleId = getModuleIdFromNodeId(selectedNodeId);
		if (!moduleId) {
			islandState = null;
			return;
		}

		const element = dom.querySelector(`[data-ujl-module-id="${moduleId}"]`) as HTMLElement | null;
		if (!element) {
			islandState = null;
			return;
		}

		const editableNode = findEditableNodeByModuleId(ast, moduleId);
		if (!editableNode) {
			islandState = null;
			return;
		}

		const { canMoveUp, canMoveDown } = getModuleMoveCapabilities(moduleId);

		islandState = {
			moduleId,
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

	function handleIslandSelect() {
		const state = islandState;
		if (!state) return;
		crafter.expandToNode(state.moduleId);
		crafter.setSelectedNodeId(state.moduleId);
	}

	function handleIslandMoveUp() {
		const state = islandState;
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

	function handleIslandMoveDown() {
		const state = islandState;
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

	async function handleIslandCopy() {
		if (!islandState) return;
		await crafter.copyNode(islandState.moduleId);
	}

	async function handleIslandCut() {
		if (!islandState) return;
		await crafter.cutNode(islandState.moduleId);
	}

	async function handleIslandPaste() {
		if (!islandState) return;
		await crafter.pasteNode(islandState.moduleId);
	}

	function handleIslandInsert() {
		if (!islandState) return;
		crafter.requestInsert(islandState.moduleId);
	}

	function handleIslandDelete() {
		if (!islandState) return;
		crafter.deleteNode(islandState.moduleId);
		islandState = null;
	}
</script>

<div
	bind:this={scrollContainerRef}
	class="relative h-full w-full"
	class:ujl-editor-mode={crafterMode === "editor"}
	role={crafterMode === "editor" ? "application" : undefined}
	onclick={handlePreviewClick}
	style={editorTokenSet && crafterMode === "editor"
		? `--editor-accent-light: ${editorCssVars["--accent-light"] ?? "var(--accent-light)"}; --editor-accent-dark: ${editorCssVars["--accent-dark"] ?? "var(--accent-dark)"};`
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
			<SelectionIndicator moduleId={selectedNodeId} containerElement={scrollContainer} />
		{/if}
	{/key}

	<!-- Hover Overlay (Modul-Hover) -->
	{#if crafterMode === "editor" && scrollContainer}
		<HoverIndicator containerElement={scrollContainer} selectedModuleId={selectedNodeId} />
	{/if}

	<!-- Module Quick Actions -->
	{#if crafterMode === "editor" && scrollContainer}
		<ModuleQuickActions containerElement={scrollContainer} selectedModuleId={selectedNodeId} />
	{/if}

	<!-- Module Actions Overlay with {#key} Pattern -->
	{#key selectedNodeId}
		{#if islandState && crafterMode === "editor" && scrollContainer}
			<Island
				moduleId={islandState.moduleId}
				containerElement={scrollContainer}
				canMoveUp={islandState.canMoveUp}
				canMoveDown={islandState.canMoveDown}
				onSelect={handleIslandSelect}
				onMoveUp={handleIslandMoveUp}
				onMoveDown={handleIslandMoveDown}
				onCopy={handleIslandCopy}
				onCut={handleIslandCut}
				onPaste={handleIslandPaste}
				onDelete={handleIslandDelete}
				onInsert={handleIslandInsert}
				canCopy={true}
				canCut={true}
				canPaste={crafter.hasClipboardContent}
				canInsert={true}
			/>
		{/if}
	{/key}
</div>
