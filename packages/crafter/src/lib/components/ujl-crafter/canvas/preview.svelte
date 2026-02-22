<!-- Preview that composes the UJLC document and renders it with UJLT tokens via AdapterRoot. -->
<script lang="ts">
	import type {
		UJLCDocument,
		UJLTDocument,
		UJLAbstractNode,
		UJLTTokenSet,
	} from "@ujl-framework/types";
	import type { Composer } from "@ujl-framework/core";
	import { AdapterRoot } from "@ujl-framework/adapter-svelte";
	// Note: Adapter styles are now bundled via Shadow DOM injection (see bundle.css)
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
		// Composer auto-selects the library provider via doc._library.adapter + LibraryRegistry
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
</script>

<div
	bind:this={scrollContainerRef}
	class="h-full w-full"
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
</div>
