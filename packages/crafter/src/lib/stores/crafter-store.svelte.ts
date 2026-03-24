/**
 * Crafter Store - Centralized State Management
 *
 * This module provides a factory function to create a reactive store for the Crafter.
 * It uses Svelte 5 runes ($state, $derived) for automatic reactivity.
 *
 * Architecture:
 * - Single Source of Truth: All state is managed here
 * - Dependency Injection: All dependencies are passed via factory function
 * - Immutable Updates: All state changes are immutable
 * - Unidirectional Data Flow: State flows down, actions flow up
 *
 * @module crafter-store
 */

import { generateUid, type Composer } from "@ujl-framework/core";
import type {
	LibraryAsset,
	LibraryProvider,
	UJLCDocument,
	UJLCLibrary,
	UJLCSlotObject,
	UJLTDocument,
	UJLTTokenSet,
} from "@ujl-framework/types";
import { readFromBrowserClipboard, writeToBrowserClipboard } from "../utils/clipboard.js";
import { logger } from "../utils/logger.js";
import {
	findParentOfNode,
	findPathToNode,
	isModuleObject,
	isRootNode,
	parseSlotSelection,
} from "../utils/ujlc-tree.js";
import { createClipboardFeature, type ClipboardFeatureState } from "./features/clipboard.js";
import { createLibraryFeature, type LibraryFeatureState } from "./features/library.js";
import { createOperations } from "./operations.js";

/**
 * Crafter mode identifier.
 * 'editor' corresponds to the content editor (UJLC) view.
 * 'designer' corresponds to the theme designer (UJLT) view.
 */
export type CrafterMode = "editor" | "designer";

/**
 * Viewport size for preview simulation.
 * null = full width (responsive)
 */
export type ViewportSize = 1024 | 768 | 375 | null;

/**
 * Library context for field editing.
 * Stores which field is currently being edited in the image library.
 */
export type LibraryContext = {
	fieldName: string;
	nodeId: string;
	currentValue: string | number | null;
} | null;

/**
 * Callback type for save action.
 * Receives both documents so the developer can decide what to persist.
 */
export type SaveCallback = (document: UJLCDocument, theme: UJLTDocument) => void;

/**
 * Dependencies required for creating a CrafterStore.
 * All dependencies are injected to enable testing and flexibility.
 */
export interface CrafterStoreDeps {
	/** Initial UJLC document (content) */
	initialUjlcDocument: UJLCDocument;
	/** Initial UJLT document (theme) */
	initialUjltDocument: UJLTDocument;
	/** Composer instance for AST generation and module registry */
	composer: Composer;
	/** Library provider for asset storage and retrieval */
	libraryProvider: LibraryProvider;
	/** Enable data-testid attributes for E2E testing (default: false) */
	testMode?: boolean;
}

const VIEWPORT_SIZES: Record<string, ViewportSize> = {
	desktop: 1024,
	tablet: 768,
	mobile: 375,
};

/**
 * Creates a new CrafterStore instance with injected dependencies.
 *
 * This factory function encapsulates all state management for the Crafter.
 * State is private and only accessible through the returned API.
 *
 * @param deps - Dependencies (DIP: dependencies are injected, not created)
 * @returns Immutable store API
 *
 * @example
 * ```ts
 * const store = createCrafterStore({
 *   initialUjlcDocument: myDocument,
 *   initialUjltDocument: myTheme,
 *   composer: new Composer(),
 *   libraryProvider: new InlineLibraryProvider(),
 * });
 *
 * // Read state
 * console.log(store.mode); // 'editor'
 *
 * // Update state
 * store.setMode('designer');
 * ```
 */
export function createCrafterStore(deps: CrafterStoreDeps) {
	const {
		initialUjlcDocument,
		initialUjltDocument,
		composer,
		libraryProvider,
		testMode = false,
	} = deps;

	/** Unique instance ID for scoping DOM queries to this Crafter instance */
	const instanceId = `crafter-${generateUid(8)}`;

	let _ujlcDocument = $state<UJLCDocument>(initialUjlcDocument);
	let _ujltDocument = $state<UJLTDocument>(initialUjltDocument);
	let _mode = $state<CrafterMode>("editor");
	let _selectedNodeId = $state<string | null>(null);
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	let _expandedNodeIds = $state<Set<string>>(new Set());
	let _isLibraryViewActive = $state(false);
	let _libraryContext = $state<LibraryContext>(null);

	const libraryState = $state<LibraryFeatureState>({
		libraryItems: [],
		libraryCursor: undefined,
		libraryHasMore: true,
		libraryLoading: false,
		providerInitialized: false,
	});

	function mergeLibraryItemsById(
		existing: Array<{ id: string } & LibraryAsset>,
		incoming: Array<{ id: string } & LibraryAsset>,
	): Array<{ id: string } & LibraryAsset> {
		const seen: Record<string, true> = {};
		const merged: Array<{ id: string } & LibraryAsset> = [];

		for (const item of existing) {
			if (seen[item.id]) continue;
			seen[item.id] = true;
			merged.push(item);
		}

		for (const item of incoming) {
			if (seen[item.id]) continue;
			seen[item.id] = true;
			merged.push(item);
		}

		return merged;
	}
	let _viewportType = $state<string | undefined>(undefined);

	let _isFullscreen = $state(false);
	let _containerWidth = $state(0);
	let _containerHeight = $state(0);
	let _screenWidth = $state(typeof window !== "undefined" ? window.innerWidth : 0);
	let _screenHeight = $state(typeof window !== "undefined" ? window.innerHeight : 0);

	let _onSaveCallback = $state<SaveCallback | null>(null);

	const clipboardState = $state<ClipboardFeatureState>({
		showComponentPicker: false,
		insertTargetNodeId: null,
		clipboard: null,
	});
	const _hasClipboardContent = $derived(!!clipboardState.clipboard);

	const rootSlot = $derived(_ujlcDocument.ujlc.root);
	const libraryData = $derived(_ujlcDocument.ujlc.library);
	const meta = $derived(_ujlcDocument.ujlc.meta);
	const tokens = $derived(_ujltDocument.ujlt.tokens);

	const viewportSize = $derived<ViewportSize>(
		_viewportType ? (VIEWPORT_SIZES[_viewportType] ?? null) : null,
	);

	/**
	 * Returns true if the fullscreen button should be shown.
	 * Shows button when container takes less than 80% of screen area, or when already in fullscreen mode (to allow minimizing).
	 */
	const _shouldShowFullscreenButton = $derived.by(() => {
		if (_isFullscreen) return true;

		if (_screenWidth === 0 || _screenHeight === 0) return false;
		if (_containerWidth === 0 || _containerHeight === 0) return false;

		const screenArea = _screenWidth * _screenHeight;
		const containerArea = _containerWidth * _containerHeight;
		const percentage = (containerArea / screenArea) * 100;

		return percentage < 80;
	});

	/**
	 * Set editor/designer mode.
	 * Business Rule: Clear selection when switching to designer mode.
	 */
	function setMode(mode: CrafterMode): void {
		_mode = mode;
		if (mode === "designer") {
			_selectedNodeId = null;
		}
	}

	/**
	 * Select a node by ID.
	 * Business Rules:
	 * - Only allow selection in editor mode
	 * - Do not allow root node selection
	 */
	function setSelectedNodeId(nodeId: string | null): void {
		if (nodeId && (_mode !== "editor" || isRootNode(nodeId))) return;
		_selectedNodeId = nodeId;
	}

	/**
	 * Expand or collapse a tree node.
	 * @param nodeId - The node ID to toggle
	 * @param expanded - Whether the node should be expanded
	 */
	function setNodeExpanded(nodeId: string, expanded: boolean): void {
		_expandedNodeIds = expanded
			? // eslint-disable-next-line svelte/prefer-svelte-reactivity
				new Set([..._expandedNodeIds, nodeId])
			: // eslint-disable-next-line svelte/prefer-svelte-reactivity
				new Set([..._expandedNodeIds].filter((id) => id !== nodeId));
	}

	/**
	 * Expand all parent nodes to make a target node visible.
	 * @param nodeId - The target node ID
	 */
	function expandToNode(nodeId: string): void {
		const path = findPathToNode(_ujlcDocument.ujlc.root, nodeId);
		if (!path) {
			logger.warn("Could not find path to node:", nodeId);
			return;
		}
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		_expandedNodeIds = new Set([..._expandedNodeIds, ...path]);
	}

	/**
	 * Toggle library view.
	 * @param active - Whether to show the library
	 * @param context - Optional context for which field is being edited
	 */
	function setLibraryViewActive(active: boolean, context?: LibraryContext): void {
		_isLibraryViewActive = active;
		if (context !== undefined) {
			_libraryContext = context;
		}
		if (!active) {
			_libraryContext = null;
		}
	}

	/**
	 * Set viewport simulation type.
	 * @param type - The viewport type ('desktop', 'tablet', 'mobile') or undefined for full width
	 */
	function setViewportType(type: string | undefined): void {
		_viewportType = type;
	}

	/**
	 * Set container dimensions for fullscreen button visibility calculation.
	 * @param width - Container width in pixels
	 * @param height - Container height in pixels
	 */
	function setContainerSize(width: number, height: number): void {
		_containerWidth = width;
		_containerHeight = height;
	}

	/**
	 * Set screen dimensions for fullscreen button visibility calculation.
	 * @param width - Screen width in pixels
	 * @param height - Screen height in pixels
	 */
	function setScreenSize(width: number, height: number): void {
		_screenWidth = width;
		_screenHeight = height;
	}

	/**
	 * Toggle fullscreen mode.
	 * Manages document.body overflow to prevent scrolling when in fullscreen.
	 */
	function toggleFullscreen(): void {
		_isFullscreen = !_isFullscreen;
		if (typeof window !== "undefined" && document.body) {
			document.body.style.overflow = _isFullscreen ? "hidden" : "";
		}
	}

	/**
	 * Set the save callback.
	 * When set, the Save button becomes visible in the header.
	 * @param callback - The callback to invoke on save, or null to hide the button
	 */
	function setOnSaveCallback(callback: SaveCallback | null): void {
		_onSaveCallback = callback;
	}

	/**
	 * Update root slot with immutable function.
	 * @param fn - Function that receives current slot and returns new slot
	 */
	function updateRootSlot(fn: (slot: UJLCSlotObject) => UJLCSlotObject): void {
		_ujlcDocument = {
			..._ujlcDocument,
			ujlc: { ..._ujlcDocument.ujlc, root: fn(_ujlcDocument.ujlc.root) },
		};
	}

	/**
	 * Update theme tokens with immutable function.
	 * @param fn - Function that receives current tokens and returns new tokens
	 */
	function updateTokenSet(fn: (tokens: UJLTTokenSet) => UJLTTokenSet): void {
		_ujltDocument = {
			..._ujltDocument,
			ujlt: { ..._ujltDocument.ujlt, tokens: fn(_ujltDocument.ujlt.tokens) },
		};
	}

	/**
	 * Update library with immutable function.
	 * @param fn - Function that receives current library and returns new library
	 */
	function updateLibrary(fn: (library: UJLCLibrary) => UJLCLibrary): void {
		_ujlcDocument = {
			..._ujlcDocument,
			ujlc: { ..._ujlcDocument.ujlc, library: fn(_ujlcDocument.ujlc.library) },
		};
	}

	/**
	 * Replace entire UJLC document (for import).
	 * Resets selection and library state on document change.
	 * @param doc - The new UJLC document
	 */
	function setUjlcDocument(doc: UJLCDocument): void {
		_ujlcDocument = doc;
		_selectedNodeId = null;
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		_expandedNodeIds = new Set();

		libraryState.libraryItems = [];
		libraryState.libraryCursor = undefined;
		libraryState.libraryHasMore = true;
		libraryState.libraryLoading = false;
		libraryState.providerInitialized = false;
		_isLibraryViewActive = false;
		_libraryContext = null;
		clipboardState.showComponentPicker = false;
		clipboardState.insertTargetNodeId = null;
	}

	/**
	 * Replace entire UJLT document (for import).
	 * @param doc - The new UJLT document
	 */
	function setUjltDocument(doc: UJLTDocument): void {
		_ujltDocument = doc;
	}

	const operations = createOperations(() => rootSlot, updateRootSlot, composer);
	const clipboardFeature = createClipboardFeature({
		operations,
		state: clipboardState,
		getRootSlot: () => rootSlot,
		setSelectedNodeId,
		findParentOfNode,
		parseSlotSelection,
		isModuleObject,
		readFromBrowserClipboard,
		writeToBrowserClipboard,
	});
	const libraryFeature = createLibraryFeature({
		libraryProvider,
		state: libraryState,
		getLibraryData: () => libraryData,
		updateLibrary,
		mergeLibraryItemsById,
	});

	const {
		setClipboard,
		copyNode,
		cutNode,
		deleteNode,
		performPaste,
		pasteNode,
		requestInsert,
		closeComponentPicker,
		handleComponentSelect,
	} = clipboardFeature;

	const {
		loadMoreLibraryItems,
		searchLibraryItems,
		getLibraryAsset,
		selectLibraryAsset,
		uploadLibraryAsset,
		deleteLibraryAsset,
		updateLibraryMetadata,
		canUploadLibrary,
		canDeleteLibrary,
		canUpdateLibraryMetadata,
	} = libraryFeature;

	return {
		instanceId,

		testMode,

		get ujlcDocument() {
			return _ujlcDocument;
		},
		get ujltDocument() {
			return _ujltDocument;
		},
		get mode() {
			return _mode;
		},
		get selectedNodeId() {
			return _selectedNodeId;
		},
		get expandedNodeIds() {
			return _expandedNodeIds;
		},
		get isLibraryViewActive() {
			return _isLibraryViewActive;
		},
		get libraryContext() {
			return _libraryContext;
		},
		get viewportType() {
			return _viewportType;
		},
		get isFullscreen() {
			return _isFullscreen;
		},
		get onSaveCallback() {
			return _onSaveCallback;
		},

		get rootSlot() {
			return rootSlot;
		},
		get libraryData() {
			return libraryData;
		},
		get meta() {
			return meta;
		},
		get tokens() {
			return tokens;
		},
		get viewportSize() {
			return viewportSize;
		},
		get shouldShowFullscreenButton() {
			return _shouldShowFullscreenButton;
		},

		get libraryItems() {
			return libraryState.libraryItems;
		},
		get libraryLoading() {
			return libraryState.libraryLoading;
		},
		get libraryHasMore() {
			return libraryState.libraryHasMore;
		},

		libraryProvider,
		composer,

		setMode,
		setSelectedNodeId,
		setNodeExpanded,
		expandToNode,
		setLibraryViewActive,
		setViewportType,
		setContainerSize,
		setScreenSize,
		toggleFullscreen,
		setOnSaveCallback,

		updateRootSlot,
		updateTokenSet,
		updateLibrary,
		setUjlcDocument,
		setUjltDocument,

		loadMoreLibraryItems,
		searchLibraryItems,
		getLibraryAsset,
		selectLibraryAsset,
		uploadLibraryAsset,
		deleteLibraryAsset,
		updateLibraryMetadata,
		canUploadLibrary,
		canDeleteLibrary,
		canUpdateLibraryMetadata,

		operations,

		deleteNode,
		copyNode,
		cutNode,
		pasteNode,
		requestInsert,
		closeComponentPicker,
		handleComponentSelect,
		performPaste,

		setClipboard,
		get clipboard() {
			return clipboardState.clipboard;
		},
		get hasClipboardContent() {
			return _hasClipboardContent;
		},

		get showComponentPicker() {
			return clipboardState.showComponentPicker;
		},
		get insertTargetNodeId() {
			return clipboardState.insertTargetNodeId;
		},
	} as const;
}

/** Store type derived from factory return type */
export type CrafterStore = ReturnType<typeof createCrafterStore>;

/**
 * Context type alias for semantic clarity.
 * CrafterContext === CrafterStore (design decision: context IS store)
 */
export type CrafterContext = CrafterStore;

/**
 * Symbol for type-safe CrafterContext access.
 * Using Symbol.for() allows the same symbol to be retrieved across modules.
 */
export const CRAFTER_CONTEXT = Symbol.for("ujl:crafter-context");

/**
 * Symbol for Composer context.
 * Used for direct Composer access in components.
 */
export const COMPOSER_CONTEXT = Symbol.for("ujl:composer-context");

/**
 * Symbol for Shadow Root context access.
 * Used to provide the Shadow Root reference to child components
 * for scoped DOM queries within the Shadow DOM.
 */
export const SHADOW_ROOT_CONTEXT = Symbol.for("ujl:shadow-root-context");

/**
 * Context type for Shadow Root access.
 * Uses a getter to satisfy Svelte 5's reactivity warnings.
 */
export type ShadowRootContext = { readonly value: ShadowRoot | undefined };
