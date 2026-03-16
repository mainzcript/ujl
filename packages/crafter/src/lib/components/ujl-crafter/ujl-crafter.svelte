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
	import { canPasteIntoSelection } from "$lib/utils/editor-commands.js";
	import {
		writeToBrowserClipboard,
		readFromBrowserClipboard,
		writeToClipboardEvent,
		readFromClipboardEvent,
	} from "$lib/utils/clipboard.js";
	import {
		findNodeById,
		ROOT_NODE_ID,
		parseSlotSelection,
		isRootNode,
	} from "$lib/utils/ujlc-tree.js";

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

	const { store, composer } = (() => {
		if (externalStore) {
			return {
				store: externalStore,
				composer: externalComposer ?? new Composer(),
			};
		} else {
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
	setContext(SHADOW_ROOT_CONTEXT, {
		get value() {
			return shadowRoot;
		},
	});

	let portalContainerRef: HTMLDivElement | undefined = $state();

	let appContainerRef: HTMLElement | null = $state(null);

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

		store.setContainerSize(appContainerRef.offsetWidth, appContainerRef.offsetHeight);

		return () => {
			observer.disconnect();
		};
	});

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

	const editorTokenSet = $derived(
		(editorTheme
			? validateUJLTDocument(editorTheme)
			: validateUJLTDocument(defaultTheme as unknown as UJLTDocument)
		).ujlt.tokens,
	);

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

	function handleModeChange(newMode: string | undefined) {
		if (newMode === "editor" || newMode === "designer") {
			store.setMode(newMode);
		}
	}

	function handleViewportTypeChange(type: string | undefined) {
		store.setViewportType(type);
	}

	let isHandlingKeyboardShortcut = $state(false);

	const selectedNodeId = $derived.by(() => {
		return store.mode === "editor" ? store.selectedNodeId : null;
	});

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
		return canPasteIntoSelection({
			selectedNodeId,
			selectedSlotInfo,
			selectedNode,
			rootSlot: store.rootSlot,
			clipboard: store.clipboard,
			findNodeById,
		});
	});

	async function handleCopy(nodeId: string) {
		await store.copyNode(nodeId);
	}

	async function handleCut(nodeId: string) {
		await store.cutNode(nodeId);
	}

	async function handlePaste(nodeIdOrSlot: string) {
		await store.pasteNode(nodeIdOrSlot);
	}

	function handleDelete(nodeId: string) {
		store.deleteNode(nodeId);
	}

	function handleInsert(nodeIdOrSlot: string) {
		store.requestInsert(nodeIdOrSlot);
	}

	function handleComponentSelect(componentType: string) {
		store.handleComponentSelect(componentType);
	}

	function handleComponentPickerOpenChange(open: boolean) {
		if (!open) {
			store.closeComponentPicker();
		}
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

		if ((event.ctrlKey || event.metaKey) && event.key === "i") {
			event.preventDefault();
			if (selectedSlotInfo && selectedNodeId) {
				handleInsert(selectedNodeId);
			} else if (selectedNodeId) {
				handleInsert(selectedNodeId);
			} else {
				handleInsert(ROOT_NODE_ID);
			}
			return;
		}

		if (!selectedNodeId && !store.clipboard) return;

		if ((event.ctrlKey || event.metaKey) && event.key === "v") {
			if (canPaste) {
				event.preventDefault();
				event.stopImmediatePropagation();
				const targetId = selectedNodeId || ROOT_NODE_ID;
				runKeyboardShortcut(() => handlePaste(targetId));
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
				runKeyboardShortcut(() => handleCopy(selectedNodeId));
			}
		}

		if ((event.ctrlKey || event.metaKey) && event.key === "x") {
			if (canCut) {
				event.preventDefault();
				event.stopImmediatePropagation();
				runKeyboardShortcut(() => handleCut(selectedNodeId));
			}
		}
	}

	function runKeyboardShortcut(task: () => Promise<void>) {
		isHandlingKeyboardShortcut = true;
		task().finally(() => {
			queueMicrotask(() => {
				isHandlingKeyboardShortcut = false;
			});
		});
	}

	function handleCopyEvent(event: ClipboardEvent) {
		if (isHandlingKeyboardShortcut) return;

		if (isEditableElement(event)) return;

		if (!selectedNodeId || selectedSlotInfo) return;
		if (!canCopy) return;

		const copiedNode = store.operations.copyNode(selectedNodeId);
		if (copiedNode) {
			store.setClipboard(copiedNode);
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
			store.setClipboard(cutNode);
			writeToClipboardEvent(event, cutNode);
			writeToBrowserClipboard(cutNode);
		}
	}

	function handlePasteEvent(event: ClipboardEvent) {
		if (isHandlingKeyboardShortcut) return;

		if (isEditableElement(event)) return;

		if (!canPaste) return;

		const eventData = readFromClipboardEvent(event);
		const pasteData = eventData || store.clipboard;
		if (!pasteData) return;

		if (eventData && eventData !== store.clipboard) {
			store.setClipboard(eventData);
		}

		const targetId = selectedNodeId || ROOT_NODE_ID;
		store.performPaste(pasteData, targetId);
	}

	$effect(() => {
		if (typeof window === "undefined") return;

		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("copy", handleCopyEvent);
		window.addEventListener("cut", handleCutEvent);
		window.addEventListener("paste", handlePasteEvent);

		readFromBrowserClipboard().then((data) => {
			if (data) {
				store.setClipboard(data);
			}
		});

		const handleFocus = () => {
			readFromBrowserClipboard().then((data) => {
				if (data && data !== store.clipboard) {
					store.setClipboard(data);
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
			<Editor rootSlot={store.rootSlot} />
		</AppSidebar>

		<AppCanvas>
			<UJLTheme
				tokens={store.tokens}
				data-crafter="canvas-surface"
				class="min-h-full w-full"
				style="background-color: oklch(var(--ambient));"
			>
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
			</UJLTheme>
		</AppCanvas>

		<AppPanel>
			{#if store.mode === "editor"}
				<PropertiesPanel />
			{:else}
				<DesignerPanel tokens={store.tokens} />
			{/if}
		</AppPanel>
	</App>

	<ComponentPicker
		open={store.showComponentPicker}
		onSelect={handleComponentSelect}
		onOpenChange={handleComponentPickerOpenChange}
	/>
	<div bind:this={portalContainerRef} data-ujl-portal-container class="contents"></div>
</UJLTheme>
