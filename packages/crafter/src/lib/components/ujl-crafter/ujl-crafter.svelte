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
	import type { UJLCDocument, UJLCLibrary, UJLTDocument } from "@ujl-framework/types";
	import { validateUJLCDocument, validateUJLTDocument } from "@ujl-framework/types";
	import { Composer, InlineLibraryProvider } from "@ujl-framework/core";

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

	import showcaseDocument from "@ujl-framework/examples/documents/showcase" with { type: "json" };
	import defaultTheme from "@ujl-framework/examples/themes/default" with { type: "json" };

	import { downloadJsonFile, readJsonFile } from "$lib/utils/files.js";
	import { logger } from "$lib/utils/logger.js";

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

			// Bridged library accessors: the InlineLibraryProvider needs to read/write
			// the Store's reactive state. Since the Store is created after the provider,
			// we use indirect references that start pointing at the initial document data
			// and get wired to the Store after creation.
			let getLibraryBridge: () => UJLCLibrary = () => validatedContent.ujlc.library;
			let updateLibraryBridge: (fn: (lib: UJLCLibrary) => UJLCLibrary) => void = () => {};

			const libraryProvider = new InlineLibraryProvider(
				() => getLibraryBridge(),
				(fn) => updateLibraryBridge(fn),
			);

			const storeDeps: CrafterStoreDeps = {
				initialUjlcDocument: validatedContent,
				initialUjltDocument: validatedTheme,
				composer,
				library: libraryProvider,
			};

			const store = createCrafterStore(storeDeps);

			// Wire up the bridge: from now on the provider reads/writes via the Store
			getLibraryBridge = () => store.libraryData;
			updateLibraryBridge = (fn) => store.updateLibrary(fn);

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
			<Editor rootSlot={store.rootSlot} />
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

	<!-- Portal container for overlay components (dropdowns, dialogs, tooltips, etc.) -->
	<!-- Must be inside UJLTheme to inherit theme styles and CSS variables -->
	<div bind:this={portalContainerRef} data-ujl-portal-container class="contents"></div>
</UJLTheme>
