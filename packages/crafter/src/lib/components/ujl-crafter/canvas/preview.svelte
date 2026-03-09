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
		type CrafterContext,
		type ShadowRootContext,
		type CrafterMode,
	} from "$lib/stores/index.js";
	import { logger } from "$lib/utils/logger.js";
	import { createScopedSelector } from "$lib/utils/scoped-dom.js";
	import { generateThemeCSSVariables } from "@ujl-framework/ui/utils";
	import Island from "../island.svelte";
	import { findParentOfNode } from "$lib/utils/ujlc-tree.js";

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

	// Scoped DOM queries - ensures multi-instance isolation
	// Uses Shadow Root when available for proper Shadow DOM support
	const dom = createScopedSelector(crafter.instanceId, shadowRootContext?.value);

	const selectedNodeId = $derived.by(() => {
		return crafter.mode === "editor" ? crafter.selectedNodeId : null;
	});

	const composer = getContext<Composer>(COMPOSER_CONTEXT);

	let ast = $state<UJLAbstractNode | null>(null);

	$effect(() => {
		// Composer composes the document into an AST
		composer.compose(ujlcDocument).then((composedAst) => {
			ast = composedAst;
		});
	});

	const tokenSet = $derived(ujltDocument.ujlt.tokens);

	const editorCssVars = $derived(editorTokenSet ? generateThemeCSSVariables(editorTokenSet) : {});

	/**
	 * Find an editable node in the AST by its moduleId
	 * @param node - The AST node to search in
	 * @param targetModuleId - The moduleId to find
	 * @returns The found editable node or null
	 */
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

	/**
	 * Handle click events on the preview container.
	 * Extracts moduleId from DOM and checks editability in AST.
	 * Prevents default actions (like link navigation) in editor mode.
	 */
	function handlePreviewClick(event: MouseEvent) {
		if (crafterMode !== "editor" || crafter.mode !== "editor") return;

		const clickedElement = (event.target as HTMLElement).closest("[data-ujl-module-id]");
		if (!clickedElement) return;

		// Prevent default actions (link navigation, form submission, etc.) in editor mode
		event.preventDefault();
		event.stopPropagation();

		const moduleId = clickedElement.getAttribute("data-ujl-module-id");
		if (!moduleId || !ast) return;

		// Only editable nodes with isModuleRoot === true are selectable
		const editableNode = findEditableNodeByModuleId(ast, moduleId);
		if (!editableNode) return;

		crafter.expandToNode(editableNode.meta.moduleId);
		crafter.setSelectedNodeId(editableNode.meta.moduleId);
		scrollToNodeInTree(editableNode.meta.moduleId);
	}

	function scrollToNodeInTree(nodeId: string) {
		// Timeout allows tree expansion animation to complete before scrolling
		setTimeout(() => {
			const treeItem = dom.querySelector(`[data-tree-node-id="${nodeId}"]`);
			if (treeItem) {
				treeItem.scrollIntoView({ behavior: "smooth", block: "center" });
			} else {
				logger.warn("Tree item not found after expansion:", nodeId);
			}
		}, 300);
	}

	let scrollContainerRef: HTMLDivElement;

	function getScrollContainer(): HTMLDivElement | null {
		return (
			dom.querySelector<HTMLDivElement>('[data-ujl-scroll-container="canvas"]') ??
			scrollContainerRef
		);
	}

	/**
	 * Scroll to component in preview; retry if DOM or ref is not ready.
	 */
	function scrollToComponentInPreview(moduleId: string, retries = 3) {
		const element = dom.querySelector(`[data-ujl-module-id="${moduleId}"]`);
		const container = getScrollContainer();

		if (!element || !container) {
			if (retries > 0) {
				setTimeout(() => scrollToComponentInPreview(moduleId, retries - 1), 100);
			}
			return;
		}

		const elementRect = element.getBoundingClientRect();
		const containerRect = container.getBoundingClientRect();

		const targetScroll =
			container.scrollTop +
			(elementRect.top - containerRect.top) -
			containerRect.height / 2 +
			elementRect.height / 2;

		container.scrollTo({
			top: Math.max(0, targetScroll),
			behavior: "smooth",
		});
	}

	/**
	 * Apply selection to a module element with retry mechanism.
	 * This is needed because when a new module is created, the AST update
	 * is asynchronous, so the element might not be in the DOM yet.
	 */
	function applySelection(moduleId: string, retries = 10) {
		const element = dom.querySelector(`[data-ujl-module-id="${moduleId}"]`);
		if (element) {
			element.classList.add("ujl-selected");
			scrollToComponentInPreview(moduleId);
			return true;
		}
		if (retries > 0) {
			setTimeout(() => applySelection(moduleId, retries - 1), 50);
		} else {
			logger.warn("Could not find element for selection after retries:", moduleId);
		}
		return false;
	}

	$effect(() => {
		// Remove selection only from elements within this Crafter instance
		dom.querySelectorAll("[data-ujl-module-id].ujl-selected").forEach((el) => {
			el.classList.remove("ujl-selected");
		});

		if (crafterMode === "editor" && selectedNodeId && ast) {
			setTimeout(() => {
				applySelection(selectedNodeId);
			}, 0);
		}
	});

	// ============================================
	// ISLAND STATE (Selection-based)
	// ============================================

	interface IslandState {
		moduleId: string;
		canMoveUp: boolean;
		canMoveDown: boolean;
		// Position für die Island (relativ zum Container)
		top: number;
		left: number;
	}

	let islandState = $state<IslandState | null>(null);

	/**
	 * Update Island position when selection changes
	 */
	$effect(() => {
		if (crafterMode !== "editor" || !selectedNodeId || !ast || !scrollContainerRef) {
			islandState = null;
			return;
		}

		// Find the module element for the selected node
		const moduleId = getModuleIdFromNodeId(selectedNodeId);
		if (!moduleId) {
			islandState = null;
			return;
		}

		// Find element in DOM
		const element = dom.querySelector(`[data-ujl-module-id="${moduleId}"]`) as HTMLElement | null;
		if (!element) {
			islandState = null;
			return;
		}

		// Find editable node for label
		const editableNode = findEditableNodeByModuleId(ast, moduleId);
		if (!editableNode) {
			islandState = null;
			return;
		}

		// Calculate move capabilities
		const { canMoveUp, canMoveDown } = getModuleMoveCapabilities(moduleId);

		// Calculate position relative to container
		const containerRect = scrollContainerRef.getBoundingClientRect();
		const moduleRect = element.getBoundingClientRect();
		const islandHeight = 36;
		const margin = 4;

		const top = moduleRect.top - containerRect.top - islandHeight - margin;
		const left = moduleRect.right - containerRect.left - 220;

		islandState = {
			moduleId,
			canMoveUp,
			canMoveDown,
			top,
			left,
		};
	});

	/**
	 * Extract module ID from a node ID (handles module IDs and slot paths)
	 */
	function getModuleIdFromNodeId(nodeId: string): string | null {
		// If it's a module ID directly
		if (!nodeId.includes(".")) {
			return nodeId;
		}
		// If it's a slot path like "moduleId.children.0", return "moduleId"
		const parts = nodeId.split(".");
		return parts[0] || null;
	}

	/**
	 * Check if a module can be moved up or down in its parent slot
	 */
	function getModuleMoveCapabilities(moduleId: string): {
		canMoveUp: boolean;
		canMoveDown: boolean;
	} {
		const parentInfo = findParentOfNode(crafter.ujlcDocument.ujlc.root, moduleId);
		if (!parentInfo) return { canMoveUp: false, canMoveDown: false };

		const { slotName, index } = parentInfo;

		// Get the slot content (works for root and nested slots)
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

	/**
	 * Island action handlers
	 */
	function handleIslandSelect() {
		// Panel öffnen / Fokus auf selektiertes Modul
		const state = islandState;
		if (!state) return;
		crafter.expandToNode(state.moduleId);
		crafter.setSelectedNodeId(state.moduleId);
	}

	function handleIslandMoveUp() {
		const state = islandState;
		if (!state) return;
		const moduleId = state.moduleId;

		// Find parent and slot containing this module
		const parentInfo = findParentOfNode(crafter.ujlcDocument.ujlc.root, moduleId);
		if (!parentInfo) return;

		const { parent, slotName, index } = parentInfo;
		if (index <= 0) return;

		// Get the slot content
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

		// Get target (previous module in same slot)
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

		// Find parent and slot containing this module
		const parentInfo = findParentOfNode(crafter.ujlcDocument.ujlc.root, moduleId);
		if (!parentInfo) return;

		const { parent, slotName, index } = parentInfo;

		// Get the slot content
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

		// Get target (next module in same slot)
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

	<!-- Module Island - Selection based -->
	{#if islandState && crafterMode === "editor"}
		<Island
			top={islandState.top}
			left={islandState.left}
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
</div>
