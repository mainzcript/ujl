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
	UJLCImageLibrary,
	UJLTTokenSet,
	UJLCDocumentMeta
} from '@ujl-framework/types';
import { generateUid, type Composer } from '@ujl-framework/core';
import { findPathToNode, isRootNode } from '../utils/ujlc-tree.js';
import { createOperations } from './operations.js';
import { logger } from '../utils/logger.js';
import type { ImageService } from '../service-adapters/image-service.js';

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
 * Image library context for field editing.
 * Stores which field is currently being edited in the image library.
 */
export type ImageLibraryContext = {
	fieldName: string;
	nodeId: string;
	currentValue: string | number | null;
} | null;

/**
 * Library configuration from document meta.
 */
export type LibraryConfig = UJLCDocumentMeta['_library'];

/**
 * Function type for immutable image library updates.
 */
export type UpdateImagesFn = (fn: (images: UJLCImageLibrary) => UJLCImageLibrary) => void;

/**
 * Factory interface for creating image services.
 * Allows dependency injection of different storage implementations.
 */
export interface ImageServiceFactory {
	(
		config: LibraryConfig,
		getImages: () => UJLCImageLibrary,
		updateImages: UpdateImagesFn
	): ImageService;
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
	/** Factory function to create image services */
	createImageService: ImageServiceFactory;
	/** Enable data-testid attributes for E2E testing (default: false) */
	testMode?: boolean;
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
 *   createImageService: createImageServiceFactory()
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
		createImageService,
		testMode = false
	} = deps;

	// ============================================
	// INSTANCE IDENTITY (for DOM scoping)
	// ============================================

	/** Unique instance ID for scoping DOM queries to this Crafter instance */
	const instanceId = `crafter-${generateUid(8)}`;

	// ============================================
	// PRIVATE STATE (Single Source of Truth)
	// ============================================

	let _ujlcDocument = $state<UJLCDocument>(initialUjlcDocument);
	let _ujltDocument = $state<UJLTDocument>(initialUjltDocument);
	let _mode = $state<CrafterMode>('editor');
	let _selectedNodeId = $state<string | null>(null);
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	let _expandedNodeIds = $state<Set<string>>(new Set());
	let _isImageLibraryViewActive = $state(false);
	let _imageLibraryContext = $state<ImageLibraryContext>(null);
	let _viewportType = $state<string | undefined>(undefined);

	// Fullscreen state
	let _isFullscreen = $state(false);
	let _containerWidth = $state(0);
	let _containerHeight = $state(0);
	let _screenWidth = $state(typeof window !== 'undefined' ? window.innerWidth : 0);
	let _screenHeight = $state(typeof window !== 'undefined' ? window.innerHeight : 0);

	// ============================================
	// COMPUTED STATE (Derived - Automatic Reactivity)
	// ============================================

	const rootSlot = $derived(_ujlcDocument.ujlc.root);
	const images = $derived(_ujlcDocument.ujlc.images);
	const meta = $derived(_ujlcDocument.ujlc.meta);
	const tokens = $derived(_ujltDocument.ujlt.tokens);

	const viewportSize = $derived<ViewportSize>(
		_viewportType ? (VIEWPORT_SIZES[_viewportType] ?? null) : null
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
	 * Toggle image library view.
	 * @param active - Whether to show the image library
	 * @param context - Optional context for which field is being edited
	 */
	function setImageLibraryViewActive(active: boolean, context?: ImageLibraryContext): void {
		_isImageLibraryViewActive = active;
		if (context !== undefined) {
			_imageLibraryContext = context;
		}
		if (!active) {
			_imageLibraryContext = null;
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
		if (typeof window !== 'undefined' && document.body) {
			document.body.style.overflow = _isFullscreen ? 'hidden' : '';
		}
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
	 * Update image library with immutable function.
	 * @param fn - Function that receives current images and returns new images
	 */
	function updateImages(fn: (images: UJLCImageLibrary) => UJLCImageLibrary): void {
		_ujlcDocument = {
			..._ujlcDocument,
			ujlc: { ..._ujlcDocument.ujlc, images: fn(_ujlcDocument.ujlc.images) }
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

	const imageService = $derived.by(() =>
		createImageService(meta._library, () => images, updateImages)
	);

	// ============================================
	// OPERATIONS (High-Level Document Manipulation)
	// ============================================

	const operations = createOperations(() => rootSlot, updateRootSlot, composer);

	// ============================================
	// PUBLIC API (Immutable Interface)
	// ============================================

	return {
		// Instance Identity
		instanceId,

		// Configuration (readonly)
		testMode,

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
		get isImageLibraryViewActive() {
			return _isImageLibraryViewActive;
		},
		get imageLibraryContext() {
			return _imageLibraryContext;
		},
		get viewportType() {
			return _viewportType;
		},
		get isFullscreen() {
			return _isFullscreen;
		},

		// Computed (readonly via getters)
		get rootSlot() {
			return rootSlot;
		},
		get images() {
			return images;
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

		// Services
		get imageService() {
			return imageService;
		},
		composer,

		// Actions
		setMode,
		setSelectedNodeId,
		setNodeExpanded,
		expandToNode,
		setImageLibraryViewActive,
		setViewportType,
		setContainerSize,
		setScreenSize,
		toggleFullscreen,

		// Functional Updates
		updateRootSlot,
		updateTokenSet,
		updateImages,
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

/**
 * Context type alias for semantic clarity.
 * CrafterContext === CrafterStore (design decision: context IS store)
 */
export type CrafterContext = CrafterStore;

// ============================================
// CONTEXT SYMBOLS
// ============================================

/**
 * Symbol for type-safe CrafterContext access.
 * Using Symbol.for() allows the same symbol to be retrieved across modules.
 */
export const CRAFTER_CONTEXT = Symbol.for('ujl:crafter-context');

/**
 * Symbol for Composer context.
 * Used for direct Composer access in components.
 */
export const COMPOSER_CONTEXT = Symbol.for('ujl:composer-context');

/**
 * Symbol for Shadow Root context access.
 * Used to provide the Shadow Root reference to child components
 * for scoped DOM queries within the Shadow DOM.
 */
export const SHADOW_ROOT_CONTEXT = Symbol.for('ujl:shadow-root-context');

/**
 * Context type for Shadow Root access.
 * Uses a getter to satisfy Svelte 5's reactivity warnings.
 */
export type ShadowRootContext = { readonly value: ShadowRoot | undefined };
