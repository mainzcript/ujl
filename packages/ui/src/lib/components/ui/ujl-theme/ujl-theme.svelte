<script lang="ts">
	import type { UJLTTokenSet } from '@ujl-framework/types';
	import type { HTMLAttributes } from 'svelte/elements';
	import { generateThemeCSSVariables } from '$lib/utils/index.js';
	import { generateUid } from '@ujl-framework/core';
	import { setUjlThemeContext, parentOwnsToaster } from './context.js';
	import { mode } from 'mode-watcher';
	import { cn } from '$lib/utils.js';
	import { Toaster } from '../sonner/index.js';

	let {
		tokens,
		mode: modeProp = 'system',
		class: className = '',
		children,
		portalContainer,
		...restProps
	}: {
		tokens?: UJLTTokenSet;
		mode?: 'light' | 'dark' | 'system';
		class?: string;
		children: import('svelte').Snippet;
		as?: keyof HTMLElementTagNameMap;
		/** Container element for portals (Shadow DOM support). When set, overlay components render here instead of document.body */
		portalContainer?: HTMLElement;
	} & HTMLAttributes<HTMLElement> = $props();

	const cssVars = $derived(tokens ? generateThemeCSSVariables(tokens) : {});

	const themeId = generateUid();

	// If modeProp is provided, it overrides mode-watcher's system detection
	const isDark = $derived(
		modeProp === 'dark' ? true : modeProp === 'light' ? false : mode.current === 'dark'
	);

	// Determine if this theme instance should own the Toaster
	// Only the outermost theme renders a Toaster to prevent duplicates in nested themes
	// This check MUST happen BEFORE setUjlThemeContext to read the parent's context
	const ownsToaster = !parentOwnsToaster();

	setUjlThemeContext({
		themeId,
		get isDark() {
			return isDark;
		},
		ownsToaster,
		get portalContainer() {
			return portalContainer;
		}
	});

	const themeCSS = $derived(
		tokens
			? `[data-ujl-theme="${themeId}"] {\n\t${Object.entries(cssVars)
					.map(([key, value]) => `\t${key}: ${value};`)
					.join('\n')}\n}`
			: ''
	);

	function updateStyle(element: HTMLStyleElement, css: string) {
		element.textContent = css;
		return {
			update(css: string) {
				element.textContent = css;
			}
		};
	}

	const darkModeClass = $derived(isDark ? ' dark' : '');
</script>

<div data-ujl-theme={themeId} class={cn(className, darkModeClass)} {...restProps}>
	<style use:updateStyle={themeCSS} data-ujl-role="styles-theme"></style>
	{@render children?.()}

	<!-- Toaster for toast notifications - only rendered by outermost theme to prevent duplicates -->
	{#if ownsToaster}
		<Toaster />
	{/if}
</div>
