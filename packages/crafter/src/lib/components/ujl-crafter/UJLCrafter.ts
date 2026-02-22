import { createCrafterStore, type CrafterStore, type SaveCallback } from "$lib/stores/index.js";
import { logger } from "$lib/utils/logger.js";
import {
	BackendLibraryProvider,
	Composer,
	InlineLibraryProvider,
	LibraryRegistry,
	type ModuleBase,
} from "@ujl-framework/core";
import type { UJLCDocument, UJLCLibrary, UJLTDocument } from "@ujl-framework/types";
import { validateUJLCDocument, validateUJLTDocument } from "@ujl-framework/types";
import CrafterElement from "./ujl-crafter-element.svelte";

// Register the Custom Element if not already registered
if (!customElements.get("ujl-crafter-internal")) {
	customElements.define(
		"ujl-crafter-internal",
		CrafterElement as unknown as CustomElementConstructor,
	);
}

import showcaseDocument from "@ujl-framework/examples/documents/showcase" with { type: "json" };
import defaultTheme from "@ujl-framework/examples/themes/default" with { type: "json" };

// ============================================
// TYPES
// ============================================

export type NotificationType = "success" | "error" | "info" | "warning";

export type NotificationCallback = (
	type: NotificationType,
	message: string,
	description?: string,
) => void;

export type DocumentChangeCallback = (document: UJLCDocument) => void;

export type ThemeChangeCallback = (theme: UJLTDocument) => void;

// Re-export SaveCallback from store for API consistency
export type { SaveCallback } from "$lib/stores/index.js";

/**
 * Configuration options for the library.
 * Determines how library assets are stored and retrieved.
 *
 * Two adapter modes are available:
 * - `inline`: Assets stored as Base64 in the UJLC document (no additional config needed)
 * - `backend`: Assets stored on a Payload CMS server (requires url and apiKey or proxyUrl)
 *
 * The Composer will automatically select the adapter that matches the
 * `_library.provider` field in the document being composed.
 */
export type LibraryOptions =
	| { provider: "inline" }
	| { provider: "backend"; url: string; apiKey: string }
	| { provider: "backend"; proxyUrl: string };

export interface UJLCrafterOptions {
	/** DOM element or CSS selector where the Crafter should be mounted */
	target: string | HTMLElement;
	/** Initial content document (optional) */
	document?: UJLCDocument;
	/** Initial theme document (optional) - used for preview content */
	theme?: UJLTDocument;
	/** Editor theme document (optional) - used for Crafter UI styling */
	editorTheme?: UJLTDocument;
	/** Library configuration (default: inline storage) */
	library?: LibraryOptions;
	/** Enable data-testid attributes for E2E testing (default: false) */
	testMode?: boolean;
	/**
	 * Custom modules to register alongside the built-in modules.
	 * Modules are registered before the editor mounts, so they are
	 * immediately available in the component picker.
	 */
	modules?: ModuleBase[];
}

/**
 * Interface for the Custom Element's DOM properties.
 * These are set programmatically after element creation.
 */
interface UJLCrafterElement extends HTMLElement {
	store: CrafterStore;
	composer: Composer;
	editorTheme: UJLTDocument;
}

// ============================================
// CLASS
// ============================================

/**
 * UJL Crafter - Visual editor for UJL documents
 *
 * Provides an imperative API for programmatic control of the editor.
 *
 * @example
 * ```typescript
 * const crafter = new UJLCrafter({
 *   target: '#editor',
 *   document: myDocument,
 *   theme: myTheme
 * });
 *
 * // Get current state
 * const doc = crafter.getDocument();
 *
 * // Listen for changes
 * crafter.onDocumentChange((doc) => save(doc));
 *
 * // Cleanup
 * crafter.destroy();
 * ```
 */
export class UJLCrafter {
	private target: HTMLElement;
	private element: UJLCrafterElement | null = null;
	private store: CrafterStore;
	private composer: Composer;
	private editorTheme: UJLTDocument;
	private documentChangeCallbacks = new Set<DocumentChangeCallback>();
	private themeChangeCallbacks = new Set<ThemeChangeCallback>();
	private notificationCallbacks = new Set<NotificationCallback>();

	constructor(options: UJLCrafterOptions) {
		this.target = this.resolveTarget(options.target);

		// Library configuration (defaults to inline)
		const libraryOptions = options.library ?? { provider: "inline" as const };

		// Validate documents upfront so they can be shared between provider and store
		const initialDoc = options.document
			? validateUJLCDocument(options.document)
			: this.getDefaultDocument();
		const initialTheme = options.theme
			? validateUJLTDocument(options.theme)
			: this.getDefaultTheme();

		// Bridged library accessors: the InlineLibraryProvider needs getLibrary/updateLibrary
		// closures that read from the Store's reactive state. Since the Store is created after
		// the provider (chicken-and-egg), we use indirect references that start pointing at the
		// initial document and get wired to the Store after creation.
		let getLibraryBridge: () => UJLCLibrary = () => initialDoc.ujlc.library;
		let updateLibraryBridge: (fn: (lib: UJLCLibrary) => UJLCLibrary) => void = () => {};

		// Build the library provider
		let libraryProvider;
		if (libraryOptions.provider === "backend") {
			if ("proxyUrl" in libraryOptions) {
				libraryProvider = new BackendLibraryProvider({ proxyUrl: libraryOptions.proxyUrl });
			} else if ("url" in libraryOptions && "apiKey" in libraryOptions) {
				libraryProvider = new BackendLibraryProvider({
					url: libraryOptions.url,
					apiKey: libraryOptions.apiKey,
				});

				// Async connection check (non-blocking)
				libraryProvider.checkConnection().then((status) => {
					if (!status.connected) {
						logger.error("Library backend connection error:", status.error);
						this.notify(
							"error",
							"Library backend connection error",
							`Failed to connect to ${libraryOptions.url}`,
						);
					}
				});
			} else {
				throw new Error(
					"UJLCrafter: Backend library requires either { url, apiKey } or { proxyUrl }",
				);
			}
		} else {
			libraryProvider = new InlineLibraryProvider(
				() => getLibraryBridge(),
				(fn) => updateLibraryBridge(fn),
			);
		}

		// Build library registry for the Composer (auto-selects based on doc._library.adapter)
		const libraryRegistry = new LibraryRegistry();
		libraryRegistry.registerAdapter(libraryProvider);

		this.composer = new Composer(undefined, libraryRegistry);

		if (options.modules) {
			for (const module of options.modules) {
				this.composer.registerModule(module);
			}
		}

		this.editorTheme = options.editorTheme
			? validateUJLTDocument(options.editorTheme)
			: this.getDefaultTheme();

		this.store = createCrafterStore({
			initialUjlcDocument: initialDoc,
			initialUjltDocument: initialTheme,
			composer: this.composer,
			library: libraryProvider,
			testMode: options.testMode ?? false,
		});

		// Wire up the bridge: from now on the provider reads/writes via the Store
		getLibraryBridge = () => this.store.libraryData;
		updateLibraryBridge = (fn) => this.store.updateLibrary(fn);

		this.mount();
	}

	// ============================================
	// PRIVATE METHODS
	// ============================================

	private resolveTarget(target: string | HTMLElement): HTMLElement {
		if (typeof target === "string") {
			const element = document.querySelector(target);
			if (!element) {
				throw new Error(`UJLCrafter: Target element not found: ${target}`);
			}
			return element as HTMLElement;
		}
		return target;
	}

	private mount(): void {
		// Create Custom Element (Shadow DOM is created automatically by Svelte)
		this.element = document.createElement("ujl-crafter-internal") as UJLCrafterElement;

		// Set props via DOM properties (complex objects work fine)
		this.element.store = this.store;
		this.element.composer = this.composer;
		this.element.editorTheme = this.editorTheme;

		// Append to target (this triggers connectedCallback and component mount)
		this.target.appendChild(this.element);
	}

	private getDefaultDocument(): UJLCDocument {
		return validateUJLCDocument(showcaseDocument as unknown as UJLCDocument);
	}

	private getDefaultTheme(): UJLTDocument {
		return validateUJLTDocument(defaultTheme as unknown as UJLTDocument);
	}

	private notifyDocumentChange(document: UJLCDocument): void {
		this.documentChangeCallbacks.forEach((cb) => cb(document));
	}

	private notifyThemeChange(theme: UJLTDocument): void {
		this.themeChangeCallbacks.forEach((cb) => cb(theme));
	}

	private notify(type: NotificationType, message: string, description?: string): void {
		this.notificationCallbacks.forEach((cb) => cb(type, message, description));
	}

	// ============================================
	// PUBLIC API: STATE ACCESS
	// ============================================

	/** Get the current content document */
	getDocument(): UJLCDocument {
		return this.store.ujlcDocument;
	}

	/** Get the current theme document */
	getTheme(): UJLTDocument {
		return this.store.ujltDocument;
	}

	/** Get the current editor mode */
	getMode(): "editor" | "designer" {
		return this.store.mode;
	}

	/** Get the currently selected node ID */
	getSelectedNodeId(): string | null {
		return this.store.selectedNodeId;
	}

	/** Get the Shadow Root of the Custom Element (for advanced use cases) */
	getShadowRoot(): ShadowRoot | null {
		return this.element?.shadowRoot ?? null;
	}

	// ============================================
	// PUBLIC API: STATE MUTATION
	// ============================================

	/** Set a new content document */
	setDocument(document: UJLCDocument): void {
		const validated = validateUJLCDocument(document);
		this.store.setUjlcDocument(validated);
		this.notifyDocumentChange(validated);
	}

	/** Set a new theme document */
	setTheme(theme: UJLTDocument): void {
		const validated = validateUJLTDocument(theme);
		this.store.setUjltDocument(validated);
		this.notifyThemeChange(validated);
	}

	/** Set the editor mode */
	setMode(mode: "editor" | "designer"): void {
		this.store.setMode(mode);
	}

	/** Select a node by ID */
	selectNode(nodeId: string | null): void {
		this.store.setSelectedNodeId(nodeId);
	}

	// ============================================
	// PUBLIC API: EVENT HANDLERS
	// ============================================

	/** Register a callback for document changes */
	onDocumentChange(callback: DocumentChangeCallback): () => void {
		this.documentChangeCallbacks.add(callback);
		return () => this.documentChangeCallbacks.delete(callback);
	}

	/** Register a callback for theme changes */
	onThemeChange(callback: ThemeChangeCallback): () => void {
		this.themeChangeCallbacks.add(callback);
		return () => this.themeChangeCallbacks.delete(callback);
	}

	/** Register a callback for notifications */
	onNotification(callback: NotificationCallback): () => void {
		this.notificationCallbacks.add(callback);
		return () => this.notificationCallbacks.delete(callback);
	}

	/**
	 * Register a callback for the Save button.
	 * When set, the Save button becomes visible in the header.
	 * The callback receives both documents so you can decide what to persist.
	 *
	 * @example
	 * ```typescript
	 * crafter.onSave((document, theme) => {
	 *   saveToServer(document);
	 * });
	 * ```
	 */
	onSave(callback: SaveCallback): () => void {
		this.store.setOnSaveCallback(callback);
		return () => this.store.setOnSaveCallback(null);
	}

	// ============================================
	// PUBLIC API: MODULE REGISTRY
	// ============================================

	/**
	 * Register a custom module in the editor's module registry.
	 * The module becomes available in the component picker immediately.
	 *
	 * @throws {Error} if a module with the same name is already registered
	 *
	 * @example
	 * ```typescript
	 * crafter.registerModule(new MyCustomModule());
	 * ```
	 */
	registerModule(module: ModuleBase): void {
		this.composer.registerModule(module);
	}

	/**
	 * Unregister a module from the editor's module registry.
	 * The module will no longer appear in the component picker.
	 *
	 * @param module - Module instance or module name string
	 *
	 * @example
	 * ```typescript
	 * crafter.unregisterModule('my-custom-module');
	 * crafter.unregisterModule(moduleInstance);
	 * ```
	 */
	unregisterModule(module: ModuleBase | string): void {
		this.composer.unregisterModule(module);
	}

	// ============================================
	// PUBLIC API: LIFECYCLE
	// ============================================

	/** Destroy the editor and clean up resources */
	destroy(): void {
		if (this.element) {
			// Remove element (this triggers disconnectedCallback and cleanup)
			this.element.remove();
			this.element = null;
		}
		this.documentChangeCallbacks.clear();
		this.themeChangeCallbacks.clear();
		this.notificationCallbacks.clear();
	}
}
