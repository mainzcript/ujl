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

import type {
	UJLCDocument,
	UJLTDocument,
	UJLCSlotObject,
	UJLCMediaLibrary,
	UJLTTokenSet,
	UJLCDocumentMeta
} from '@ujl-framework/types';
import type { Composer } from '@ujl-framework/core';
import { findPathToNode, isRootNode } from '$lib/utils/ujlc-tree.js';
import { createOperations } from './operations.js';
import { logger } from '$lib/utils/logger.js';
import type { MediaService } from '$lib/services/media-service.js';

// ============================================
// TYPES
// ============================================

/**
 * Crafter mode identifier.
 * 'editor' corresponds to the content editor (UJLC) view.
 * 'designer' corresponds to the theme designer (UJLT) view.
 */
export type CrafterMode = 'editor' | 'designer';

/**
 * Viewport size for preview simulation.
 * null = full width (responsive)
 */
export type ViewportSize = 1024 | 768 | 375 | null;

/**
 * Media library context for field editing.
 * Stores which field is currently being edited in the media library.
 */
export type MediaLibraryContext = {
	fieldName: string;
	nodeId: string;
	currentValue: string | number | null;
} | null;

/**
 * Media library configuration from document meta.
 */
export type MediaLibraryConfig = UJLCDocumentMeta['media_library'];

/**
 * Function type for immutable media library updates.
 */
export type UpdateMediaFn = (fn: (media: UJLCMediaLibrary) => UJLCMediaLibrary) => void;

/**
 * Factory interface for creating media services.
 * Allows dependency injection of different storage implementations.
 */
export interface MediaServiceFactory {
	(
		config: MediaLibraryConfig,
		getMedia: () => UJLCMediaLibrary,
		updateMedia: UpdateMediaFn
	): MediaService;
}

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
	/** Factory function to create media services */
	createMediaService: MediaServiceFactory;
}

// ============================================
// CONSTANTS
// ============================================

const VIEWPORT_SIZES: Record<string, ViewportSize> = {
	desktop: 1024,
	tablet: 768,
	mobile: 375
};

// ============================================
// STORE FACTORY
// ============================================

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
 *   createMediaService: createMediaServiceFactory()
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
	const { initialUjlcDocument, initialUjltDocument, composer, createMediaService } = deps;

	// ============================================
	// PRIVATE STATE (Single Source of Truth)
	// ============================================

	let _ujlcDocument = $state<UJLCDocument>(initialUjlcDocument);
	let _ujltDocument = $state<UJLTDocument>(initialUjltDocument);
	let _mode = $state<CrafterMode>('editor');
	let _selectedNodeId = $state<string | null>(null);
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	let _expandedNodeIds = $state<Set<string>>(new Set());
	let _isMediaLibraryViewActive = $state(false);
	let _mediaLibraryContext = $state<MediaLibraryContext>(null);
	let _viewportType = $state<string | undefined>(undefined);

	// ============================================
	// COMPUTED STATE (Derived - Automatic Reactivity)
	// ============================================

	const rootSlot = $derived(_ujlcDocument.ujlc.root);
	const media = $derived(_ujlcDocument.ujlc.media);
	const meta = $derived(_ujlcDocument.ujlc.meta);
	const tokens = $derived(_ujltDocument.ujlt.tokens);

	const viewportSize = $derived<ViewportSize>(
		_viewportType ? (VIEWPORT_SIZES[_viewportType] ?? null) : null
	);

	// ============================================
	// ACTIONS (Command Pattern - Single Responsibility)
	// ============================================

	/**
	 * Set editor/designer mode.
	 * Business Rule: Clear selection when switching to designer mode.
	 */
	function setMode(mode: CrafterMode): void {
		_mode = mode;
		if (mode === 'designer') {
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
		if (nodeId && (_mode !== 'editor' || isRootNode(nodeId))) return;
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
			logger.warn('Could not find path to node:', nodeId);
			return;
		}
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		_expandedNodeIds = new Set([..._expandedNodeIds, ...path]);
	}

	/**
	 * Toggle media library view.
	 * @param active - Whether to show the media library
	 * @param context - Optional context for which field is being edited
	 */
	function setMediaLibraryViewActive(active: boolean, context?: MediaLibraryContext): void {
		_isMediaLibraryViewActive = active;
		if (context !== undefined) {
			_mediaLibraryContext = context;
		}
		if (!active) {
			_mediaLibraryContext = null;
		}
	}

	/**
	 * Set viewport simulation type.
	 * @param type - The viewport type ('desktop', 'tablet', 'mobile') or undefined for full width
	 */
	function setViewportType(type: string | undefined): void {
		_viewportType = type;
	}

	// ============================================
	// FUNCTIONAL UPDATES (Immutable State Updates)
	// ============================================

	/**
	 * Update root slot with immutable function.
	 * @param fn - Function that receives current slot and returns new slot
	 */
	function updateRootSlot(fn: (slot: UJLCSlotObject) => UJLCSlotObject): void {
		_ujlcDocument = {
			..._ujlcDocument,
			ujlc: { ..._ujlcDocument.ujlc, root: fn(_ujlcDocument.ujlc.root) }
		};
	}

	/**
	 * Update theme tokens with immutable function.
	 * @param fn - Function that receives current tokens and returns new tokens
	 */
	function updateTokenSet(fn: (tokens: UJLTTokenSet) => UJLTTokenSet): void {
		_ujltDocument = {
			..._ujltDocument,
			ujlt: { ..._ujltDocument.ujlt, tokens: fn(_ujltDocument.ujlt.tokens) }
		};
	}

	/**
	 * Update media library with immutable function.
	 * @param fn - Function that receives current media and returns new media
	 */
	function updateMedia(fn: (media: UJLCMediaLibrary) => UJLCMediaLibrary): void {
		_ujlcDocument = {
			..._ujlcDocument,
			ujlc: { ..._ujlcDocument.ujlc, media: fn(_ujlcDocument.ujlc.media) }
		};
	}

	/**
	 * Replace entire UJLC document (for import).
	 * Resets selection on document change.
	 * @param doc - The new UJLC document
	 */
	function setUjlcDocument(doc: UJLCDocument): void {
		_ujlcDocument = doc;
		_selectedNodeId = null;
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		_expandedNodeIds = new Set();
	}

	/**
	 * Replace entire UJLT document (for import).
	 * @param doc - The new UJLT document
	 */
	function setUjltDocument(doc: UJLTDocument): void {
		_ujltDocument = doc;
	}

	// ============================================
	// SERVICES (Lazy Initialization via $derived.by)
	// ============================================

	const mediaService = $derived.by(() =>
		createMediaService(meta.media_library, () => media, updateMedia)
	);

	// ============================================
	// OPERATIONS (High-Level Document Manipulation)
	// ============================================

	const operations = createOperations(() => rootSlot, updateRootSlot, composer);

	// ============================================
	// PUBLIC API (Immutable Interface)
	// ============================================

	return {
		// State (readonly via getters - encapsulation)
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
		get isMediaLibraryViewActive() {
			return _isMediaLibraryViewActive;
		},
		get mediaLibraryContext() {
			return _mediaLibraryContext;
		},
		get viewportType() {
			return _viewportType;
		},

		// Computed (readonly via getters)
		get rootSlot() {
			return rootSlot;
		},
		get media() {
			return media;
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

		// Services
		get mediaService() {
			return mediaService;
		},
		composer,

		// Actions
		setMode,
		setSelectedNodeId,
		setNodeExpanded,
		expandToNode,
		setMediaLibraryViewActive,
		setViewportType,

		// Functional Updates
		updateRootSlot,
		updateTokenSet,
		updateMedia,
		setUjlcDocument,
		setUjltDocument,

		// Operations
		operations
	} as const;
}

// ============================================
// TYPE EXPORT
// ============================================

/** Store type derived from factory return type */
export type CrafterStore = ReturnType<typeof createCrafterStore>;
