import { mount } from 'svelte';
import type { Component } from 'svelte';
import type { UJLAdapter, UJLAbstractNode } from '@ujl-framework/core';
import type { SvelteAdapterOptions, MountedComponent } from './types.js';
import ASTNode from './components/ASTNode.svelte';

/**
 * Svelte adapter for UJL Framework
 *
 * Converts UJL AST nodes into mounted Svelte components.
 * Uses Svelte 5's mount() API for direct component mounting.
 */
export const svelteAdapter: UJLAdapter<MountedComponent, SvelteAdapterOptions> = (
	node: UJLAbstractNode,
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

	// Mount the ASTNode component
	const instance = mount(ASTNode, {
		target: targetElement,
		props: { node }
	});

	// Return mounted component with cleanup function
	return {
		instance: instance as Component, // Type assertion for Svelte 5 mount result
		unmount: () => {
			// Svelte 5 mount() returns a component with $destroy method
			if (
				instance &&
				typeof (instance as Component & { $destroy?: () => void }).$destroy === 'function'
			) {
				(instance as Component & { $destroy: () => void }).$destroy();
			}
			targetElement.innerHTML = '';
		}
	};
};
