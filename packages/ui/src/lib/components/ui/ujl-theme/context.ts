import { getContext, hasContext, setContext } from 'svelte';

const UJL_THEME_CONTEXT = Symbol('UJL_THEME_CONTEXT');

/**
 * Context type for UJL theme system.
 * Contains the unique theme ID used for scoping CSS variables, a computed isDark boolean,
 * and a flag indicating whether this theme instance owns the Toaster.
 * Uses a getter function for reactivity (Svelte 5 best practice).
 */
export type UjlThemeContext = {
	themeId: string;
	get isDark(): boolean;
	/** True if this theme instance renders the Toaster (prevents duplicate Toasters in nested themes) */
	ownsToaster: boolean;
};

/**
 * Sets the UJL theme context for the current component tree.
 * @param config - Theme context configuration
 * @returns The provided config
 */
export function setUjlThemeContext(config: UjlThemeContext): UjlThemeContext {
	setContext(UJL_THEME_CONTEXT, config);
	return config;
}

/**
 * Retrieves the UJL theme context from the current component tree.
 * @returns Theme context if available, undefined otherwise
 */
export function getUjlThemeContext(): UjlThemeContext | undefined {
	if (!hasContext(UJL_THEME_CONTEXT)) {
		return undefined;
	}
	return getContext<UjlThemeContext>(UJL_THEME_CONTEXT);
}

/**
 * Checks if a parent theme already owns a Toaster.
 * Used to prevent duplicate Toasters in nested UJLTheme components.
 * @returns true if a parent theme has a Toaster, false otherwise
 */
export function parentOwnsToaster(): boolean {
	const parentContext = getUjlThemeContext();
	return parentContext?.ownsToaster ?? false;
}
