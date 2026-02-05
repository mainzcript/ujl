<!--
	UJL Crafter - Custom Element Wrapper
	
	This component wraps the main Crafter UI as a Custom Element with Shadow DOM.
	
	IMPORTANT: Svelte only injects styles for THIS component into the Shadow DOM.
	Child component styles still go to document.head and won't work.
	For child component styles, use co-located .css files imported via bundle.css.
	See: src/lib/styles/README.md
	
	The element is created programmatically by the UJLCrafter class
	and should not be used directly.
	
	Note: The "options_missing_custom_element" warning from svelte-check is expected.
	This component uses per-component Custom Element definition which is correctly
	handled by the Vite build. The warning is suppressed via --compiler-warnings flag
	in the check script.
-->
<svelte:options
	customElement={{
		tag: "ujl-crafter-internal",
		shadow: "open",
		props: {
			store: { type: "Object" },
			composer: { type: "Object" },
			editorTheme: { type: "Object" },
		},
	}}
/>

<script lang="ts">
	import type { UJLTDocument } from "@ujl-framework/types";
	import type { CrafterStore } from "$lib/stores/index.js";
	import type { Composer } from "@ujl-framework/core";
	import bundledStyles from "$lib/styles/_bundled.css?inline";
	import UJLCrafterInner from "./ujl-crafter.svelte";

	// Props from the wrapper class (set via DOM properties)
	let {
		store,
		composer,
		editorTheme,
	}: {
		store: CrafterStore;
		composer: Composer;
		editorTheme: UJLTDocument;
	} = $props();

	// Access the host element to get the shadowRoot for child components
	// $host() is only available in Custom Element context
	const hostElement = $host();

	/**
	 * Svelte action to inject CSS into Shadow DOM style element.
	 * This injects Tailwind and other bundled styles that aren't
	 * part of Svelte component styles.
	 */
	function updateStyle(element: HTMLStyleElement, css: string) {
		element.textContent = css;
		return {
			update(css: string) {
				element.textContent = css;
			},
		};
	}
</script>

<div class="contents">
	<style use:updateStyle={bundledStyles} data-ujl-role="styles-bundle"></style>
	<UJLCrafterInner {store} {composer} {editorTheme} shadowRoot={hostElement?.shadowRoot} />
</div>
