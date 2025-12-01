import { mount, unmount } from 'svelte';
import type { Component } from 'svelte';
import type { UJLAdapter, UJLAbstractNode, UJLTTokenSet } from '@ujl-framework/types';
import type { SvelteAdapterOptions, MountedComponent } from './types.js';
import AdapterRoot from './components/AdapterRoot.svelte';

/**
 * Svelte adapter for UJL Framework
 *
 * Converts UJL AST nodes into mounted Svelte components.
 * Uses Svelte 5's mount() API for direct component mounting.
 *
 * @param node - The UJL AST node to render
 * @param tokenSet - Design token set to apply to the rendered AST
 * @param options - Adapter configuration options
 * @returns Mounted component instance with cleanup function
 * @throws {Error} If target element is not found
 *
 * @example
 * ```typescript
 * const mounted = svelteAdapter(ast, tokenSet, {
 *   target: '#container',
 *   mode: 'system',
 *   showMetadata: true,
 *   eventCallback: (moduleId) => console.log('Clicked:', moduleId)
 * });
 * await mounted.unmount();
 * ```
 */
export const svelteAdapter: UJLAdapter<MountedComponent, SvelteAdapterOptions> = (
	node: UJLAbstractNode,
	tokenSet: UJLTTokenSet,
	options: SvelteAdapterOptions
): MountedComponent => {
	// Resolve target element
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

	// Clear target element
	targetElement.innerHTML = '';

	// Mount the AdapterRoot component (which handles theme and AST rendering)
	const instance = mount(AdapterRoot, {
		target: targetElement,
		props: {
			node,
			tokenSet,
			mode: options.mode,
			showMetadata: options.showMetadata ?? false,
			eventCallback: options.eventCallback
		}
	});

	// Return mounted component with cleanup function
	return {
		// Svelte 5 mount() returns Component | undefined, but we've validated target exists
		instance: instance as Component,
		unmount: async () => {
			await unmount(instance);
		}
	};
};
