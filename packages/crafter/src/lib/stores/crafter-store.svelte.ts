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
import { LibraryError } from "@ujl-framework/types";
import {
	readFromBrowserClipboard,
	writeToBrowserClipboard,
	type UJLClipboardData,
} from "../utils/clipboard.js";
import { logger } from "../utils/logger.js";
import {
	findPathToNode,
	isModuleObject,
	isRootNode,
	parseSlotSelection,
} from "../utils/ujlc-tree.js";
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

	let _libraryItems = $state<Array<{ id: string } & LibraryAsset>>([]);
	let _libraryCursor = $state<string | undefined>(undefined);
	let _libraryHasMore = $state(true);
	let _libraryLoading = $state(false);
	let _providerInitialized = $state(false);

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

	let _showComponentPicker = $state(false);
	let _insertTargetNodeId = $state<string | null>(null);
	let _clipboard = $state<UJLClipboardData | null>(null);
	const _hasClipboardContent = $derived(!!_clipboard);

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
	 * Unified delete handler - deletes node and clears selection if needed.
	 * @param nodeId - The node ID to delete
	 * @returns true if successful
	 */
	function deleteNode(nodeId: string): boolean {
		const success = operations.deleteNode(nodeId);
		if (success && _selectedNodeId === nodeId) {
			setSelectedNodeId(null);
		}
		return success;
	}

	/**
	 * Set clipboard data (used by event handlers)
	 * @param data - The clipboard data
	 */
	function setClipboard(data: UJLClipboardData | null): void {
		_clipboard = data;
	}

	/**
	 * Unified copy handler - copies node to clipboard and browser API.
	 * @param nodeId - The node ID to copy
	 */
	async function copyNode(nodeId: string): Promise<void> {
		const copied = operations.copyNode(nodeId);
		if (copied) {
			_clipboard = copied;
			await writeToBrowserClipboard(copied);
		}
	}

	/**
	 * Unified cut handler - cuts node to clipboard and browser API.
	 * @param nodeId - The node ID to cut
	 */
	async function cutNode(nodeId: string): Promise<void> {
		await copyNode(nodeId);
		deleteNode(nodeId);
	}

	/**
	 * Performs paste logic (shared between paste and handleComponentSelect).
	 * Handles both module and slot paste, with slot vs module detection.
	 * @param pasteData - The data to paste
	 * @param targetId - The target ID (node or slot)
	 */
	function performPaste(pasteData: UJLClipboardData, targetId: string): void {
		const slotInfo = parseSlotSelection(targetId);
		const isSlotSelection = slotInfo !== null;

		if (isModuleObject(pasteData)) {
			let newNodeId: string | null;
			if (isSlotSelection && slotInfo) {
				newNodeId = operations.pasteNode(pasteData, slotInfo.parentId, slotInfo.slotName, "into");
			} else {
				newNodeId = operations.pasteNode(pasteData, targetId, undefined, "after");
			}
			if (newNodeId) {
				setSelectedNodeId(newNodeId);
			}
			return;
		}

		if (pasteData.type === "slot") {
			if (isSlotSelection && slotInfo) {
				operations.pasteSlot(pasteData, slotInfo.parentId);
			} else {
				operations.pasteSlot(pasteData, targetId);
			}
		}
	}

	/**
	 * Unified paste handler - reads from clipboard and pastes at target.
	 * @param targetId - The target ID (node or slot)
	 */
	async function pasteNode(targetId: string): Promise<void> {
		const browserClipboard = await readFromBrowserClipboard();
		const pasteData = browserClipboard || _clipboard;

		if (!pasteData) return;

		if (browserClipboard && browserClipboard !== _clipboard) {
			_clipboard = browserClipboard;
		}

		performPaste(pasteData, targetId);
	}

	/**
	 * Request insert - shows ComponentPicker for target.
	 * Unified between Island and NavTree.
	 * @param targetId - The target ID (node or slot)
	 */
	function requestInsert(targetId: string): void {
		_insertTargetNodeId = targetId;
		_showComponentPicker = true;
	}

	/**
	 * Close ComponentPicker and reset target.
	 */
	function closeComponentPicker(): void {
		_showComponentPicker = false;
		_insertTargetNodeId = null;
	}

	/**
	 * Handle ComponentPicker selection - insert new component.
	 * @param componentType - The component type to insert
	 */
	function handleComponentSelect(componentType: string): void {
		if (!_insertTargetNodeId) return;

		const targetId = _insertTargetNodeId;
		const slotInfo = parseSlotSelection(targetId);
		let newNodeId: string | null;

		if (slotInfo) {
			newNodeId = operations.insertNode(
				componentType,
				slotInfo.parentId,
				slotInfo.slotName,
				"into",
			);
		} else {
			newNodeId = operations.insertNode(componentType, targetId, undefined, "after");
		}

		if (newNodeId) {
			setSelectedNodeId(newNodeId);
		}

		closeComponentPicker();
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

		_libraryItems.splice(0, _libraryItems.length);
		_libraryCursor = undefined;
		_libraryHasMore = true;
		_libraryLoading = false;
		_providerInitialized = false;
		_isLibraryViewActive = false;
		_libraryContext = null;
	}

	/**
	 * Replace entire UJLT document (for import).
	 * @param doc - The new UJLT document
	 */
	function setUjltDocument(doc: UJLTDocument): void {
		_ujltDocument = doc;
	}

	/**
	 * Initialize the library provider (called automatically before first use)
	 */
	async function initLibraryProvider(): Promise<void> {
		if (_providerInitialized || !libraryProvider.init) return;
		await libraryProvider.init();
		_providerInitialized = true;
	}

	/**
	 * Load more library assets (Infinite Scroll)
	 * @param limit - Number of items to load
	 */
	async function loadMoreLibraryItems(limit = 50): Promise<void> {
		if (_libraryLoading || !_libraryHasMore) return;

		await initLibraryProvider();
		_libraryLoading = true;

		try {
			const result = await libraryProvider.list(libraryData, {
				limit,
				cursor: _libraryCursor,
			});

			_libraryItems = mergeLibraryItemsById(_libraryItems, result.items);
			_libraryCursor = result.nextCursor;
			_libraryHasMore = result.hasMore;
		} finally {
			_libraryLoading = false;
		}
	}

	/**
	 * Search library assets (resets pagination)
	 * @param query - Search query
	 * @param limit - Number of items to load
	 */
	async function searchLibraryItems(query: string, limit = 50): Promise<void> {
		_libraryItems = [];
		_libraryCursor = undefined;
		_libraryHasMore = true;

		await initLibraryProvider();
		_libraryLoading = true;

		try {
			const result = await libraryProvider.list(libraryData, {
				limit,
				search: query,
			});

			_libraryItems = mergeLibraryItemsById([], result.items);
			_libraryCursor = result.nextCursor;
			_libraryHasMore = result.hasMore;
		} finally {
			_libraryLoading = false;
		}
	}

	/**
	 * Get a single library asset by ID
	 * @param id - Asset ID
	 * @returns The asset or null if not found
	 */
	async function getLibraryAsset(id: string): Promise<LibraryAsset | null> {
		await initLibraryProvider();
		return libraryProvider.get(libraryData, id);
	}

	/**
	 * Upload a file to the library
	 * @param file - File to upload
	 * @returns The uploaded asset with ID
	 */
	async function uploadLibraryAsset(file: File): Promise<{ id: string } & LibraryAsset> {
		if (!libraryProvider.upload) {
			throw new LibraryError("Upload not supported", "NOT_SUPPORTED");
		}

		await initLibraryProvider();
		const buffer = await file.arrayBuffer();
		const asset = await libraryProvider.upload(buffer, {
			filename: file.name,
			type: file.type,
		});

		const id = crypto.randomUUID();
		updateLibrary((lib) => ({ ...lib, [id]: asset }));

		const assetWithId = { id, ...asset };
		_libraryItems = mergeLibraryItemsById([assetWithId], _libraryItems);

		return assetWithId;
	}

	/**
	 * Delete a library asset
	 * @param id - Asset ID
	 */
	async function deleteLibraryAsset(id: string): Promise<void> {
		await initLibraryProvider();

		if (!libraryProvider.delete) {
			throw new LibraryError("Delete not supported by this provider", "NOT_SUPPORTED");
		}

		await libraryProvider.delete(id);

		updateLibrary((lib) => {
			const { [id]: _, ...rest } = lib;
			return rest;
		});

		_libraryItems = _libraryItems.filter((item) => item.id !== id);
	}

	/**
	 * Update asset metadata
	 * @param id - Asset ID
	 * @param metadata - Metadata to update
	 */
	async function updateLibraryMetadata(
		id: string,
		metadata: Record<string, unknown>,
	): Promise<void> {
		await initLibraryProvider();

		if (!libraryProvider.updateMetadata) {
			throw new LibraryError("Metadata update not supported", "NOT_SUPPORTED");
		}

		const updated = await libraryProvider.updateMetadata(libraryData, id, metadata);

		updateLibrary((lib) => ({ ...lib, [id]: updated }));

		const index = _libraryItems.findIndex((item) => item.id === id);
		if (index !== -1) {
			_libraryItems[index] = { id, ...updated };
		}
	}

	/**
	 * Select a library asset for use in a module.
	 * Ensures the asset is persisted in the document library before returning its ID.
	 * @param id - Asset ID from _libraryItems
	 * @returns The asset ID (guaranteed to be in doc.ujlc.library after this call)
	 */
	async function selectLibraryAsset(id: string): Promise<string> {
		if (libraryData[id]) {
			return id;
		}

		const asset = _libraryItems.find((item) => item.id === id);
		if (!asset) {
			throw new LibraryError(`Asset ${id} not found in library items`, "NOT_FOUND");
		}

		const { id: _, ...assetData } = asset;
		updateLibrary((lib) => ({ ...lib, [id]: assetData }));

		return id;
	}

	/**
	 * Capability checks
	 */
	function canUploadLibrary(): boolean {
		return !!libraryProvider.upload;
	}

	function canDeleteLibrary(): boolean {
		return !!libraryProvider.delete;
	}

	function canUpdateLibraryMetadata(): boolean {
		return !!libraryProvider.updateMetadata;
	}

	const operations = createOperations(() => rootSlot, updateRootSlot, composer);

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
			return _libraryItems;
		},
		get libraryLoading() {
			return _libraryLoading;
		},
		get libraryHasMore() {
			return _libraryHasMore;
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
			return _clipboard;
		},
		get hasClipboardContent() {
			return _hasClipboardContent;
		},

		get showComponentPicker() {
			return _showComponentPicker;
		},
		get insertTargetNodeId() {
			return _insertTargetNodeId;
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
