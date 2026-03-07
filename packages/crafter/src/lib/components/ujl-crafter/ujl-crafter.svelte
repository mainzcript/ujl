<!--
	UJL Crafter - Main Component
	
	This is the root component for the Crafter visual editor.
	It creates the CrafterStore and provides it via Svelte context.
	
	Architecture:
	- Single Source of Truth: All state managed by CrafterStore
	- Dependency Injection: Store receives all dependencies via factory
	- Unidirectional Data Flow: State flows down, actions flow up
	- Context-based API: Child components access store via context
	
	Note: This component is rendered inside the ujl-crafter-element Custom Element,
	which handles Shadow DOM creation and style injection.
-->
<script lang="ts">
	import { App, AppLogo, AppHeader, AppSidebar, AppCanvas, AppPanel } from "../ui/app/index.js";
	import { Badge, UJLTheme } from "@ujl-framework/ui";
	import { setContext } from "svelte";
	import { toast } from "svelte-sonner";
	import type { UJLCDocument, UJLTDocument } from "@ujl-framework/types";
	import { validateUJLCDocument, validateUJLTDocument } from "@ujl-framework/types";
	import { Composer } from "@ujl-framework/core";
	import { InlineLibraryProvider } from "$lib/library-providers/index.js";

	import {
		createCrafterStore,
		type CrafterStore,
		type CrafterStoreDeps,
		CRAFTER_CONTEXT,
		COMPOSER_CONTEXT,
		SHADOW_ROOT_CONTEXT,
	} from "$lib/stores/index.js";

	import Header from "./header/header.svelte";
	import Editor from "./sidebar/editor.svelte";
	import Preview from "./canvas/preview.svelte";
	import PropertiesPanel from "./panel/properties-panel.svelte";
	import DesignerPanel from "./panel/designer-panel.svelte";
	import CrafterEffects from "./crafter-effects.svelte";
	import ComponentPicker from "./sidebar/component-picker.svelte";

	import showcaseDocument from "@ujl-framework/examples/documents/showcase" with { type: "json" };
	import defaultTheme from "@ujl-framework/examples/themes/default" with { type: "json" };

	import { downloadJsonFile, readJsonFile } from "$lib/utils/files.js";
	import { logger } from "$lib/utils/logger.js";
	import {
		writeToBrowserClipboard,
		readFromBrowserClipboard,
		writeToClipboardEvent,
		readFromClipboardEvent,
		type UJLClipboardData,
	} from "$lib/utils/clipboard.js";
	import {
		findNodeById,
		ROOT_NODE_ID,
		ROOT_SLOT_NAME,
		parseSlotSelection,
		isRootNode,
		isModuleObject,
	} from "$lib/utils/ujlc-tree.js";

	// ============================================
	// PROPS
	// ============================================

	interface Props {
		/** External store (from UJLCrafter class via Custom Element) */
		store?: CrafterStore;
		/** External composer (from UJLCrafter class via Custom Element) */
		composer?: Composer;
		/** Initial content document (optional, defaults to showcase, only if no external store) */
		initialContent?: UJLCDocument;
		/** Initial theme document (optional, defaults to default theme, only if no external store) */
		initialTheme?: UJLTDocument;
		/** Editor theme document (optional, defaults to default theme) - used for Crafter UI styling */
		editorTheme?: UJLTDocument;
		/** Shadow Root reference for scoped DOM queries (from Custom Element host) */
		shadowRoot?: ShadowRoot | null;
	}

	const {
		store: externalStore,
		composer: externalComposer,
		initialContent,
		initialTheme,
		editorTheme,
		shadowRoot,
	}: Props = $props();

	// ============================================
	// STORE CREATION
	// ============================================

	const { store, composer } = (() => {
		if (externalStore) {
			return {
				store: externalStore,
				composer: externalComposer ?? new Composer(),
			};
		} else {
			// Capture initial props in a closure - we intentionally don't react to prop changes
			const { validatedContent, validatedTheme } = (() => {
				const content = initialContent;
				const theme = initialTheme;
				return {
					validatedContent: validateUJLCDocument(
						(content ?? showcaseDocument) as unknown as UJLCDocument,
					),
					validatedTheme: validateUJLTDocument((theme ?? defaultTheme) as unknown as UJLTDocument),
				};
			})();

			const composer = new Composer();

			// Build the library provider (defaults to InlineLibraryProvider)
			// Stateless - no closures needed. Crafter/Store manages all document storage.
			const libraryProvider = new InlineLibraryProvider();

			const storeDeps: CrafterStoreDeps = {
				initialUjlcDocument: validatedContent,
				initialUjltDocument: validatedTheme,
				composer,
				libraryProvider,
			};

			const store = createCrafterStore(storeDeps);

			return { store, composer };
		}
	})();

	setContext(CRAFTER_CONTEXT, store);
	setContext(COMPOSER_CONTEXT, composer);
	// Use getter to avoid Svelte warning about capturing initial value
	setContext(SHADOW_ROOT_CONTEXT, {
		get value() {
			return shadowRoot;
		},
	});

	// ============================================
	// PORTAL CONTAINER
	// ============================================

	// Portal container for overlay components (dropdowns, dialogs, etc.)
	// This ensures overlays render inside Shadow DOM and inherit styles
	let portalContainerRef: HTMLDivElement | undefined = $state();

	// ============================================
	// FULLSCREEN TRACKING
	// ============================================

	// Reference to App container for size tracking
	let appContainerRef: HTMLElement | null = $state(null);

	// ResizeObserver for container size tracking
	$effect(() => {
		if (!appContainerRef) return;

		const observer = new ResizeObserver((entries) => {
			const entry = entries[0];
			if (entry) {
				const width = entry.contentRect.width;
				const height = entry.contentRect.height;
				store.setContainerSize(width, height);
			}
		});

		observer.observe(appContainerRef);

		// Measure initial size on mount
		store.setContainerSize(appContainerRef.offsetWidth, appContainerRef.offsetHeight);

		return () => {
			observer.disconnect();
		};
	});

	// Window resize listener for screen size tracking
	$effect(() => {
		if (typeof window === "undefined") return;

		const handleResize = () => {
			store.setScreenSize(window.innerWidth, window.innerHeight);
		};

		handleResize();
		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);
		};
	});

	// ESC key handler to exit fullscreen
	$effect(() => {
		if (typeof window === "undefined") return;

		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape" && store.isFullscreen) {
				store.toggleFullscreen();
			}
		};

		window.addEventListener("keydown", handleEscape);

		return () => {
			window.removeEventListener("keydown", handleEscape);
		};
	});

	// ============================================
	// EDITOR THEME
	// ============================================

	const editorTokenSet = $derived(
		(editorTheme
			? validateUJLTDocument(editorTheme)
			: validateUJLTDocument(defaultTheme as unknown as UJLTDocument)
		).ujlt.tokens,
	);

	// ============================================
	// IMPORT / EXPORT HANDLERS
	// ============================================

	function handleExportTheme() {
		downloadJsonFile(store.ujltDocument, "theme.ujlt.json");
	}

	function handleExportContent() {
		downloadJsonFile(store.ujlcDocument, "content.ujlc.json");
	}

	async function handleImportTheme(file: File) {
		const data = await readJsonFile(file);
		if (!data) {
			toast.error("Failed to read or parse the theme file.");
			return;
		}
		try {
			const validatedDocument = validateUJLTDocument(data as unknown as UJLTDocument);
			store.setUjltDocument(validatedDocument);
			toast.success("Theme imported successfully.");
		} catch (error) {
			logger.error("Theme validation failed:", error);
			toast.error("Invalid theme file", {
				description: "The imported theme file is invalid. Please check the file format.",
			});
		}
	}

	async function handleImportContent(file: File) {
		const data = await readJsonFile(file);
		if (!data) {
			toast.error("Failed to read or parse the content file.");
			return;
		}
		try {
			const validatedDocument = validateUJLCDocument(data as unknown as UJLCDocument);
			store.setUjlcDocument(validatedDocument);
			toast.success("Content imported successfully.");
		} catch (error) {
			logger.error("Content validation failed:", error);
			toast.error("Invalid content file", {
				description: "The imported content file is invalid. Please check the file format.",
			});
		}
	}

	function handleSave() {
		if (store.onSaveCallback) {
			store.onSaveCallback(store.ujlcDocument, store.ujltDocument);
		}
	}

	// ============================================
	// MODE CHANGE HANDLER
	// ============================================

	function handleModeChange(newMode: string | undefined) {
		if (newMode === "editor" || newMode === "designer") {
			store.setMode(newMode);
		}
	}

	// ============================================
	// VIEWPORT CHANGE HANDLER
	// ============================================

	function handleViewportTypeChange(type: string | undefined) {
		store.setViewportType(type);
	}

	// ============================================
	// KEYBOARD SHORTCUTS - Always active, even when sidebar is hidden
	// ============================================

	// Synchronized with browser clipboard for cross-tab support
	let clipboard = $state<UJLClipboardData | null>(null);
	let isHandlingKeyboardShortcut = $state(false);

	// Component Picker state
	let showComponentPicker = $state(false);
	let insertTargetNodeId = $state<string | null>(null);

	const selectedNodeId = $derived.by(() => {
		return store.mode === "editor" ? store.selectedNodeId : null;
	});

	// Slot selection uses format: parentId:slotName
	const selectedSlotInfo = $derived(parseSlotSelection(selectedNodeId));

	const selectedNode = $derived.by(() => {
		if (!selectedNodeId) return null;

		if (selectedSlotInfo) {
			return findNodeById(store.rootSlot, selectedSlotInfo.parentId);
		}

		return findNodeById(store.rootSlot, selectedNodeId);
	});

	const canCut = $derived(selectedNodeId !== null && !selectedSlotInfo);
	const canCopy = $derived(selectedNodeId !== null && !selectedSlotInfo);
	const canDelete = $derived(
		selectedNodeId !== null && !selectedSlotInfo && !isRootNode(selectedNodeId),
	);
	const canPaste = $derived.by(() => {
		if (!clipboard) return false;

		if (selectedNodeId === ROOT_NODE_ID) {
			return (
				isModuleObject(clipboard) ||
				(clipboard.type === "slot" && clipboard.slotName === ROOT_SLOT_NAME)
			);
		}

		if (!selectedNodeId) return false;

		if (selectedSlotInfo) {
			const parentNode = findNodeById(store.rootSlot, selectedSlotInfo.parentId);
			if (!parentNode && !isRootNode(selectedSlotInfo.parentId)) return false;

			if (isModuleObject(clipboard)) {
				return true;
			}

			if (clipboard.type === "slot") {
				if (isRootNode(selectedSlotInfo.parentId)) {
					return clipboard.slotName === ROOT_SLOT_NAME;
				}
				if (parentNode?.slots) {
					return Object.keys(parentNode.slots).includes(clipboard.slotName);
				}
			}

			return false;
		}

		if (isRootNode(selectedNodeId)) {
			return (
				isModuleObject(clipboard) ||
				(clipboard.type === "slot" && clipboard.slotName === ROOT_SLOT_NAME)
			);
		}

		if (!selectedNode) return false;

		if (isModuleObject(clipboard)) {
			return true;
		}

		if (clipboard.type === "slot" && selectedNode.slots) {
			return Object.keys(selectedNode.slots).includes(clipboard.slotName);
		}

		return false;
	});

	async function handleCopy(nodeId: string) {
		const copiedNode = store.operations.copyNode(nodeId);
		if (copiedNode) {
			clipboard = copiedNode;
			await writeToBrowserClipboard(copiedNode);
		}
	}

	async function handleCut(nodeId: string) {
		const cutNode = store.operations.cutNode(nodeId);
		if (cutNode) {
			clipboard = cutNode;
			await writeToBrowserClipboard(cutNode);
		}
	}

	async function handlePaste(nodeIdOrSlot: string) {
		const browserClipboard = await readFromBrowserClipboard();
		const pasteData = browserClipboard || clipboard;

		if (!pasteData) return;

		if (browserClipboard && browserClipboard !== clipboard) {
			clipboard = browserClipboard;
		}

		performPaste(pasteData, nodeIdOrSlot);
	}

	function performPaste(pasteData: UJLClipboardData, nodeIdOrSlot: string) {
		const slotInfo = parseSlotSelection(nodeIdOrSlot);
		const isSlotSelection = slotInfo !== null;

		if (isModuleObject(pasteData)) {
			let newNodeId: string | null = null;
			if (isSlotSelection && slotInfo) {
				newNodeId = store.operations.pasteNode(
					pasteData,
					slotInfo.parentId,
					slotInfo.slotName,
					"into",
				);
			} else {
				newNodeId = store.operations.pasteNode(pasteData, nodeIdOrSlot, undefined, "after");
			}
			if (newNodeId) {
				store.setSelectedNodeId(newNodeId);
			}
			return;
		}

		if (pasteData.type === "slot") {
			if (isSlotSelection && slotInfo) {
				store.operations.pasteSlot(pasteData, slotInfo.parentId);
			} else {
				store.operations.pasteSlot(pasteData, nodeIdOrSlot);
			}
		}
	}

	function handleDelete(nodeId: string) {
		const success = store.operations.deleteNode(nodeId);
		if (success) {
			store.setSelectedNodeId(null);
		}
	}

	function handleInsert(nodeIdOrSlot: string) {
		insertTargetNodeId = nodeIdOrSlot;
		showComponentPicker = true;
	}

	function handleNodeInsert(componentType: string, nodeId: string): boolean {
		let newNodeId: string | null = null;
		if (isRootNode(nodeId)) {
			// Root: insert at end of document
			newNodeId = store.operations.insertNode(componentType, ROOT_NODE_ID, ROOT_SLOT_NAME, "into");
		} else {
			// Regular module: insert after current module (consistent with paste)
			const targetNode = findNodeById(store.rootSlot, nodeId);
			if (!targetNode) {
				return false;
			}

			newNodeId = store.operations.insertNode(componentType, nodeId, undefined, "after");
		}
		if (newNodeId) {
			store.setSelectedNodeId(newNodeId);
			return true;
		}
		return false;
	}

	function handleSlotInsert(componentType: string, parentId: string, slotName: string): boolean {
		let newNodeId: string | null = null;
		if (isRootNode(parentId)) {
			newNodeId = store.operations.insertNode(componentType, ROOT_NODE_ID, slotName, "into");
		} else {
			const targetNode = findNodeById(store.rootSlot, parentId);
			if (!targetNode) {
				return false;
			}
			newNodeId = store.operations.insertNode(componentType, parentId, slotName, "into");
		}
		if (newNodeId) {
			store.setSelectedNodeId(newNodeId);
			return true;
		}
		return false;
	}

	function handleComponentSelect(componentType: string) {
		if (!insertTargetNodeId) return;

		const slotInfo = parseSlotSelection(insertTargetNodeId);

		if (slotInfo) {
			const { parentId, slotName } = slotInfo;
			handleSlotInsert(componentType, parentId, slotName);
		} else {
			handleNodeInsert(componentType, insertTargetNodeId);
		}

		insertTargetNodeId = null;
		showComponentPicker = false;
	}

	/**
	 * Checks if the keyboard event originated from an editable element.
	 * Uses composedPath() for Shadow DOM compatibility - event.target is
	 * retargeted to the shadow host when events bubble outside Shadow DOM.
	 */
	function isEditableElement(event: KeyboardEvent | ClipboardEvent): boolean {
		const path = event.composedPath();
		const actualTarget = path[0];

		if (!actualTarget || !(actualTarget instanceof HTMLElement)) {
			return false;
		}

		const tagName = actualTarget.tagName.toLowerCase();

		if (tagName === "input" || tagName === "textarea") {
			return true;
		}

		if (actualTarget.isContentEditable) {
			return true;
		}

		if (tagName === "select") {
			return true;
		}

		return false;
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (isEditableElement(event)) return;

		if (event.key === "Escape") {
			if (selectedNodeId) {
				event.preventDefault();
				store.setSelectedNodeId(null);
			}
			return;
		}

		// Ctrl+I (Add) should always work, even without selection
		if ((event.ctrlKey || event.metaKey) && event.key === "i") {
			event.preventDefault();
			if (selectedSlotInfo && selectedNodeId) {
				// Slot selected: insert into slot
				handleInsert(selectedNodeId);
			} else if (selectedNodeId) {
				// Module selected: insert after module (consistent with paste)
				handleInsert(selectedNodeId);
			} else {
				// Nothing selected: insert at end of document
				handleInsert(ROOT_NODE_ID);
			}
			return;
		}

		// For other shortcuts (Copy, Paste, Cut, Delete) we need a selection or clipboard
		if (!selectedNodeId && !clipboard) return;

		if ((event.ctrlKey || event.metaKey) && event.key === "v") {
			if (canPaste) {
				event.preventDefault();
				event.stopImmediatePropagation();
				isHandlingKeyboardShortcut = true;
				const targetId = selectedNodeId || ROOT_NODE_ID;
				handlePaste(targetId).finally(() => {
					setTimeout(() => {
						isHandlingKeyboardShortcut = false;
					}, 0);
				});
			}
			return;
		}

		if (event.key === "Delete" || event.key === "Backspace") {
			if (canDelete && selectedNodeId) {
				event.preventDefault();
				handleDelete(selectedNodeId);
			}
			return;
		}

		if (selectedSlotInfo || !selectedNodeId) return;

		if ((event.ctrlKey || event.metaKey) && event.key === "c") {
			if (canCopy) {
				event.preventDefault();
				event.stopImmediatePropagation();
				isHandlingKeyboardShortcut = true;
				handleCopy(selectedNodeId).finally(() => {
					setTimeout(() => {
						isHandlingKeyboardShortcut = false;
					}, 0);
				});
			}
		}

		if ((event.ctrlKey || event.metaKey) && event.key === "x") {
			if (canCut) {
				event.preventDefault();
				event.stopImmediatePropagation();
				isHandlingKeyboardShortcut = true;
				handleCut(selectedNodeId).finally(() => {
					setTimeout(() => {
						isHandlingKeyboardShortcut = false;
					}, 0);
				});
			}
		}
	}

	function handleCopyEvent(event: ClipboardEvent) {
		if (isHandlingKeyboardShortcut) return;

		if (isEditableElement(event)) return;

		if (!selectedNodeId || selectedSlotInfo) return;
		if (!canCopy) return;

		const copiedNode = store.operations.copyNode(selectedNodeId);
		if (copiedNode) {
			clipboard = copiedNode;
			writeToClipboardEvent(event, copiedNode);
			writeToBrowserClipboard(copiedNode);
		}
	}

	function handleCutEvent(event: ClipboardEvent) {
		if (isHandlingKeyboardShortcut) return;

		if (isEditableElement(event)) return;

		if (!selectedNodeId || selectedSlotInfo) return;
		if (!canCut) return;

		const cutNode = store.operations.cutNode(selectedNodeId);
		if (cutNode) {
			clipboard = cutNode;
			writeToClipboardEvent(event, cutNode);
			writeToBrowserClipboard(cutNode);
		}
	}

	function handlePasteEvent(event: ClipboardEvent) {
		if (isHandlingKeyboardShortcut) return;

		if (isEditableElement(event)) return;

		if (!canPaste) return;

		const eventData = readFromClipboardEvent(event);
		const pasteData = eventData || clipboard;
		if (!pasteData) return;

		if (eventData && eventData !== clipboard) {
			clipboard = eventData;
		}

		const targetId = selectedNodeId || ROOT_NODE_ID;
		performPaste(pasteData, targetId);
	}

	// Setup global keyboard shortcuts in $effect
	$effect(() => {
		if (typeof window === "undefined") return;

		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("copy", handleCopyEvent);
		window.addEventListener("cut", handleCutEvent);
		window.addEventListener("paste", handlePasteEvent);

		// Initialize clipboard from browser on mount
		readFromBrowserClipboard().then((data) => {
			if (data) {
				clipboard = data;
			}
		});

		// Sync clipboard on focus (for cross-tab support)
		const handleFocus = () => {
			readFromBrowserClipboard().then((data) => {
				if (data && data !== clipboard) {
					clipboard = data;
				}
			});
		};

		window.addEventListener("focus", handleFocus);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("copy", handleCopyEvent);
			window.removeEventListener("cut", handleCutEvent);
			window.removeEventListener("paste", handlePasteEvent);
			window.removeEventListener("focus", handleFocus);
		};
	});
</script>

<UJLTheme
	tokens={editorTokenSet}
	class={store.isFullscreen ? "fixed inset-0 isolate z-9999 h-full w-full" : "h-full w-full"}
	data-crafter-instance={store.instanceId}
	portalContainer={portalContainerRef}
>
	<App bind:ref={appContainerRef}>
		<!-- Panel-Auto-Open and Close Callback Logic -->
		<CrafterEffects
			mode={store.mode}
			setSelectedNodeId={store.setSelectedNodeId}
			selectedNodeId={store.selectedNodeId}
		/>

		<AppLogo>
			<Badge>UJL</Badge>
		</AppLogo>

		<AppHeader>
			<Header
				mode={store.mode}
				onModeChange={handleModeChange}
				viewportType={store.viewportType}
				onViewportTypeChange={handleViewportTypeChange}
				onSave={store.onSaveCallback ? handleSave : undefined}
				onImportTheme={handleImportTheme}
				onImportContent={handleImportContent}
				onExportTheme={handleExportTheme}
				onExportContent={handleExportContent}
			/>
		</AppHeader>

		<AppSidebar>
			<Editor rootSlot={store.rootSlot} externalClipboard={clipboard} />
		</AppSidebar>

		<AppCanvas>
			<div class="h-full">
				<div
					class="mx-auto min-w-[375px] duration-300"
					style={store.viewportSize ? `width: ${store.viewportSize}px;` : "width: 100%;"}
				>
					<Preview
						ujlcDocument={store.ujlcDocument}
						ujltDocument={store.ujltDocument}
						crafterMode={store.mode}
						{editorTokenSet}
					/>
				</div>
			</div>
		</AppCanvas>

		<AppPanel>
			{#if store.mode === "editor"}
				<PropertiesPanel />
			{:else}
				<DesignerPanel tokens={store.tokens} />
			{/if}
		</AppPanel>
	</App>

	<ComponentPicker bind:open={showComponentPicker} onSelect={handleComponentSelect} />

	<!-- Portal container for overlay components (dropdowns, dialogs, tooltips, etc.) -->
	<!-- Must be inside UJLTheme to inherit theme styles and CSS variables -->
	<div bind:this={portalContainerRef} data-ujl-portal-container class="contents"></div>
</UJLTheme>
