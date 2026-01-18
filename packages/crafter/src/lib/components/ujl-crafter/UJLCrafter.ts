import { mount, unmount } from 'svelte';
import type { UJLCDocument, UJLTDocument } from '@ujl-framework/types';
import { validateUJLCDocument, validateUJLTDocument } from '@ujl-framework/types';
import { Composer } from '@ujl-framework/core';
import {
	createCrafterStore,
	createMediaServiceFactory,
	type CrafterStore
} from '../../stores/index.js';
import UJLCrafterSvelte from './ujl-crafter.svelte';
import { logger } from '../../utils/logger.js';

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
 * Configuration options for the media library.
 * Determines how media assets (images, etc.) are stored and retrieved.
 *
 * Two storage modes are available:
 * - `inline`: Media stored as Base64 in the UJLC document (no additional config needed)
 * - `backend`: Media stored on a Payload CMS server (requires endpoint and apiKey)
 *
 * Note: Document-level media_library configuration is ignored.
 * Only this options-based configuration is used.
 */
export type MediaLibraryOptions =
	| { storage: 'inline' }
	| { storage: 'backend'; endpoint: string; apiKey: string };

export interface UJLCrafterOptions {
	/** DOM element or CSS selector where the Crafter should be mounted */
	target: string | HTMLElement;
	/** Initial content document (optional) */
	document?: UJLCDocument;
	/** Initial theme document (optional) - used for preview content */
	theme?: UJLTDocument;
	/** Editor theme document (optional) - used for Crafter UI styling */
	editorTheme?: UJLTDocument;
	/** Media library configuration (default: inline storage) */
	mediaLibrary?: MediaLibraryOptions;
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
	private store: CrafterStore;
	private composer: Composer;
	private editorTheme: UJLTDocument;
	private component: ReturnType<typeof mount> | null = null;
	private documentChangeCallbacks = new Set<DocumentChangeCallback>();
	private themeChangeCallbacks = new Set<ThemeChangeCallback>();
	private notificationCallbacks = new Set<NotificationCallback>();

	constructor(options: UJLCrafterOptions) {
		this.target = this.resolveTarget(options.target);
		this.composer = new Composer();

		this.editorTheme = options.editorTheme
			? validateUJLTDocument(options.editorTheme)
			: this.getDefaultTheme();

		// Media library configuration from options (defaults to inline storage)
		// Note: Document-level media_library configuration is ignored - only options are used
		const mediaLibrary = options.mediaLibrary ?? { storage: 'inline' as const };

		// Runtime validation for backend storage
		if (mediaLibrary.storage === 'backend') {
			if (!mediaLibrary.endpoint || !mediaLibrary.apiKey) {
				throw new Error('UJLCrafter: Backend storage requires both endpoint and apiKey');
			}
		}

		const mediaServiceFactory = createMediaServiceFactory({
			preferredStorage: mediaLibrary.storage,
			backendEndpoint: mediaLibrary.storage === 'backend' ? mediaLibrary.endpoint : undefined,
			backendApiKey: mediaLibrary.storage === 'backend' ? mediaLibrary.apiKey : undefined,
			showToasts: false,
			onConnectionError: (error, endpoint) => {
				logger.error('Media backend connection error:', error, endpoint);
				this.notify('error', 'Media backend connection error', `Failed to connect to ${endpoint}`);
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
			createMediaService: mediaServiceFactory
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
		this.target.innerHTML = '';
		this.component = mount(UJLCrafterSvelte, {
			target: this.target,
			props: {
				store: this.store,
				composer: this.composer,
				editorTheme: this.editorTheme
			}
		});
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
		if (this.component) {
			unmount(this.component);
			this.component = null;
		}
		this.target.innerHTML = '';
		this.documentChangeCallbacks.clear();
		this.themeChangeCallbacks.clear();
		this.notificationCallbacks.clear();
	}
}
