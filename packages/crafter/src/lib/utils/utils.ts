import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges class names using clsx and tailwind-merge.
 * Handles conditional classes and resolves Tailwind conflicts.
 *
 * @param inputs - Class values to merge (strings, objects, arrays)
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Utility type that removes the `child` prop from a component type.
 * Useful for components that accept a child snippet.
 */
export type WithoutChild<T> = T extends { child?: unknown } ? Omit<T, 'child'> : T;

/**
 * Utility type that removes the `children` prop from a component type.
 * Useful for components that accept children snippets.
 */
export type WithoutChildren<T> = T extends { children?: unknown } ? Omit<T, 'children'> : T;

/**
 * Utility type that removes both `child` and `children` props from a component type.
 * Useful for components that accept either child or children snippets.
 */
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;

/**
 * Utility type that adds a `ref` property to a component type.
 * Useful for components that need to expose a ref to their root element.
 *
 * @template T - The base component type
 * @template U - The HTML element type (defaults to HTMLElement)
 */
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };
