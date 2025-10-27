import type { Component } from 'svelte';

/**
 * Descriptor for a Svelte component with its props
 * Used by the Svelte adapter to represent rendered components
 */
export type SvelteNodeDescriptor<Props extends Record<string, unknown> = Record<string, unknown>> =
	{
		component: Component<Props>;
		props: Props;
	};

/**
 * Options for the Svelte adapter
 */
export type SvelteAdapterOptions = {
	/** Target element or selector where the component should be mounted */
	target: string | HTMLElement;
};

/**
 * Result of mounting a Svelte component
 * Contains the mounted component instance and cleanup function
 */
export type MountedComponent = {
	/** The mounted Svelte component instance */
	instance: Component;
	/** Function to unmount and cleanup the component */
	unmount: () => void;
};
