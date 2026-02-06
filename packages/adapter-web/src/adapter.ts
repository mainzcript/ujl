import type { UJLAbstractNode, UJLAdapter, UJLTTokenSet } from "@ujl-framework/types";
import type { MountedElement, UJLContentElement, WebAdapterOptions } from "./types.js";

/**
 * Web adapter for UJL Framework
 *
 * Converts UJL AST nodes into Custom Elements (`<ujl-content>`).
 * Uses Svelte Custom Element compilation to create a framework-agnostic Web Component.
 *
 * @param node - The UJL AST node to render
 * @param tokenSet - Design token set to apply to the rendered AST
 * @param options - Adapter configuration options
 * @returns Mounted element instance with cleanup function
 * @throws {Error} If target element is not found
 *
 * @example
 * ```typescript
 * const mounted = webAdapter(ast, tokenSet, {
 *   target: '#container',
 *   mode: 'system',
 *   showMetadata: true,
 *   eventCallback: (moduleId) => console.log('Clicked:', moduleId)
 * });
 * mounted.unmount();
 * ```
 */
export const webAdapter: UJLAdapter<MountedElement, WebAdapterOptions> = (
	node: UJLAbstractNode,
	tokenSet: UJLTTokenSet,
	options: WebAdapterOptions,
): MountedElement => {
	// Resolve target element (selector string or HTMLElement)
	let targetElement: HTMLElement;

	if (typeof options.target === "string") {
		const element = document.querySelector(options.target);
		if (!element) {
			throw new Error(`Target element not found: ${options.target}`);
		}
		targetElement = element as HTMLElement;
	} else {
		targetElement = options.target;
	}

	// Clear target element before mounting
	targetElement.innerHTML = "";

	// Create and configure Custom Element
	const customElement = document.createElement("ujl-content") as UJLContentElement;
	customElement.node = node;
	customElement.tokenSet = tokenSet;
	if (options.mode !== undefined) {
		customElement.mode = options.mode;
	}
	// Pass through metadata and callback options to Custom Element
	if (options.showMetadata !== undefined) {
		customElement.showMetadata = options.showMetadata;
	}
	if (options.eventCallback !== undefined) {
		customElement.eventCallback = options.eventCallback;
	}

	// Mount Custom Element to target
	targetElement.appendChild(customElement);

	// Return mounted element with cleanup function
	return {
		element: customElement,
		unmount: () => {
			customElement.remove();
		},
	};
};
