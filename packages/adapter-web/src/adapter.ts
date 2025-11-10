import type { UJLAdapter, UJLAbstractNode, UJLTTokenSet } from '@ujl-framework/core';
import type { WebAdapterOptions, MountedElement, UJLContentElement } from './types.js';

/**
 * Web adapter for UJL Framework
 *
 * Converts UJL AST nodes into Custom Elements (`<ujl-content>`).
 * Uses Svelte Custom Element compilation to create a framework-agnostic Web Component.
 */
export const webAdapter: UJLAdapter<MountedElement, WebAdapterOptions> = (
	node: UJLAbstractNode,
	tokenSet: UJLTTokenSet,
	options: WebAdapterOptions
): MountedElement => {
	// Resolve target element (selector string or HTMLElement)
	let targetElement: HTMLElement;

	if (typeof options.target === 'string') {
		const element = document.querySelector(options.target);
		if (!element) {
			throw new Error(`Target element not found: ${options.target}`);
		}
		targetElement = element as HTMLElement;
	} else {
		targetElement = options.target;
	}

	// Clear target element before mounting
	targetElement.innerHTML = '';

	// Create and configure Custom Element
	const customElement = document.createElement('ujl-content') as UJLContentElement;
	customElement.node = node;
	customElement.tokenSet = tokenSet;

	// Mount Custom Element to target
	targetElement.appendChild(customElement);

	// Return mounted element with cleanup function
	return {
		element: customElement,
		unmount: () => {
			customElement.remove();
		}
	};
};
