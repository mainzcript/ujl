import { getContext, hasContext, setContext } from 'svelte';

const UJL_THEME_CONTEXT = Symbol('UJL_THEME_CONTEXT');

/**
 * Context type for UJL theme system.
 * Contains the unique theme ID used for scoping CSS variables.
 */
export type UjlThemeContext = {
	themeId: string;
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
