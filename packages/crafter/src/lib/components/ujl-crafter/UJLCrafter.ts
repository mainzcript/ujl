import type { UJLCDocument, UJLTDocument } from '@ujl-framework/types';
import { validateUJLCDocument, validateUJLTDocument } from '@ujl-framework/types';
import { Composer } from '@ujl-framework/core';
import {
	createCrafterStore,
	createImageServiceFactory,
	type CrafterStore
} from '$lib/stores/index.js';
import { logger } from '$lib/utils/logger.js';
import CrafterElement from './ujl-crafter-element.svelte';

// Register the Custom Element if not already registered
if (!customElements.get('ujl-crafter-internal')) {
	customElements.define(
		'ujl-crafter-internal',
		CrafterElement as unknown as CustomElementConstructor
	);
}

import showcaseDocument from '@ujl-framework/examples/documents/showcase' with { type: 'json' };
import defaultTheme from '@ujl-framework/examples/themes/default' with { type: 'json' };

// ============================================
// TYPES
// ============================================

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export type NotificationCallback = (
	type: NotificationType,
	message: string,
	description?: string
) => void;

export type DocumentChangeCallback = (document: UJLCDocument) => void;

export type ThemeChangeCallback = (theme: UJLTDocument) => void;

/**
 * Configuration options for the library.
 * Determines how image assets are stored and retrieved.
 *
 * Two storage modes are available:
 * - `inline`: Images stored as Base64 in the UJLC document (no additional config needed)
 * - `backend`: Images stored on a Payload CMS server (requires url and apiKey)
 *
 * Note: Document-level _library configuration is ignored.
 * Only this options-based configuration is used.
 */
export type LibraryOptions =
	| { storage: 'inline' }
	| { storage: 'backend'; url: string; apiKey: string };

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
		this.composer = new Composer();

		this.editorTheme = options.editorTheme
			? validateUJLTDocument(options.editorTheme)
			: this.getDefaultTheme();

		// Library configuration from options (defaults to inline storage)
		// Note: Document-level _library configuration is ignored - only options are used
		const library = options.library ?? { storage: 'inline' as const };

		// Runtime validation for backend storage
		if (library.storage === 'backend') {
			if (!library.url || !library.apiKey) {
				throw new Error('UJLCrafter: Backend storage requires both url and apiKey');
			}
		}

		const imageServiceFactory = createImageServiceFactory({
			preferredStorage: library.storage,
			backendUrl: library.storage === 'backend' ? library.url : undefined,
			backendApiKey: library.storage === 'backend' ? library.apiKey : undefined,
			showToasts: false,
			onConnectionError: (error, url) => {
				logger.error('Image backend connection error:', error, url);
				this.notify('error', 'Image backend connection error', `Failed to connect to ${url}`);
			}
		});

		this.store = createCrafterStore({
			initialUjlcDocument: options.document
				? validateUJLCDocument(options.document)
				: this.getDefaultDocument(),
			initialUjltDocument: options.theme
				? validateUJLTDocument(options.theme)
				: this.getDefaultTheme(),
			composer: this.composer,
			createImageService: imageServiceFactory,
			testMode: options.testMode ?? false
		});

		this.mount();
	}

	// ============================================
	// PRIVATE METHODS
	// ============================================

	private resolveTarget(target: string | HTMLElement): HTMLElement {
		if (typeof target === 'string') {
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
		this.element = document.createElement('ujl-crafter-internal') as UJLCrafterElement;

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
	getMode(): 'editor' | 'designer' {
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
	setMode(mode: 'editor' | 'designer'): void {
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
