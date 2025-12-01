import type { UJLAbstractNode, UJLTTokenSet } from '@ujl-framework/types';

/**
 * Options for the webAdapter function.
 */
export interface WebAdapterOptions {
	/** DOM element or CSS selector where the Custom Element should be mounted */
	target: string | HTMLElement;
	/** Theme mode: 'light', 'dark', or 'system' (default: 'system') */
	mode?: 'light' | 'dark' | 'system';
	/**
	 * Show metadata attributes on module elements
	 * When true, adds data-ujl-module-id attribute to module elements
	 * (default: false)
	 */
	showMetadata?: boolean;
	/**
	 * Callback function triggered when a module is clicked
	 * Receives the module ID from the clicked element
	 */
	eventCallback?: (moduleId: string) => void;
}

/**
 * Return value from webAdapter containing the mounted element and cleanup function.
 */
export interface MountedElement {
	/** The mounted Custom Element instance */
	element: HTMLElement;
	/** Function to unmount and remove the element from the DOM */
	unmount: () => void;
}

/**
 * Custom Element interface for `<ujl-content>`.
 * Extends HTMLElement with UJL-specific properties.
 */
export interface UJLContentElement extends HTMLElement {
	/** The UJL AST node to render */
	node: UJLAbstractNode;
	/** Optional design token set to apply to the rendered AST */
	tokenSet?: UJLTTokenSet;
	/** Theme mode: 'light', 'dark', or 'system' (default: 'system') */
	mode?: 'light' | 'dark' | 'system';
	/** Show metadata attributes on module elements (default: false) */
	showMetadata?: boolean;
	/** Callback function triggered when a module is clicked */
	eventCallback?: (moduleId: string) => void;
}

declare global {
	interface HTMLElementTagNameMap {
		'ujl-content': UJLContentElement;
	}
}
