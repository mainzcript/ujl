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
			mode: options.mode
		}
	});

	// Return mounted component with cleanup function
	return {
		instance: instance as Component, // Type assertion for Svelte 5 mount result
		unmount: async () => {
			await unmount(instance);
		}
	};
};
