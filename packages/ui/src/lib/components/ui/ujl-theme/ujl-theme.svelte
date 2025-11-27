<script lang="ts">
	import type { UJLTTokenSet } from '@ujl-framework/types';
	import type { HTMLAttributes } from 'svelte/elements';
	import { generateThemeCSSVariables } from '$lib/tools/index.js';
	import { generateUid } from '@ujl-framework/core';
	import { setUjlThemeContext } from './context.js';
	import { mode } from 'mode-watcher';
	import { cn } from '$lib/utils.js';
	import { Toaster } from '../sonner/index.js';

	let {
		tokens,
		mode: modeProp = 'system',
		class: className = '',
		children,
		...restProps
	}: {
		tokens?: UJLTTokenSet;
		mode?: 'light' | 'dark' | 'system';
		class?: string;
		children: import('svelte').Snippet;
		as?: keyof HTMLElementTagNameMap;
	} & HTMLAttributes<HTMLElement> = $props();

	const cssVars = $derived(tokens ? generateThemeCSSVariables(tokens) : {});

	// Generate unique theme ID for scoping CSS variables
	const themeId = generateUid();

	// Use mode-watcher for dark mode detection
	// If modeProp is provided, it overrides mode-watcher's system detection
	const isDark = $derived(
		modeProp === 'dark' ? true : modeProp === 'light' ? false : mode.current === 'dark'
	);

	// Set theme context with themeId and isDark getter
	// Using a getter for reactivity (Svelte 5 best practice - no stores needed)
	setUjlThemeContext({
		themeId,
		get isDark() {
			return isDark;
		}
	});

	// Generate CSS rule targeting the theme's data attribute
	const themeCSS = $derived(
		tokens
			? `[data-ujl-theme="${themeId}"] {\n\t${Object.entries(cssVars)
					.map(([key, value]) => `\t${key}: ${value};`)
					.join('\n')}\n}`
			: ''
	);

	// Action to update style element content reactively
	function updateStyle(element: HTMLStyleElement, css: string) {
		element.textContent = css;
		return {
			update(css: string) {
				element.textContent = css;
			}
		};
	}

	// Compute class string with dark mode
	const darkModeClass = $derived(isDark ? ' dark' : '');
</script>

<div data-ujl-theme={themeId} class={cn(className, darkModeClass)} {...restProps}>
	<style use:updateStyle={themeCSS} data-ujl-role="styles-theme"></style>
	{@render children?.()}

	<!-- Toaster for toast notifications -->
	<Toaster />
</div>
