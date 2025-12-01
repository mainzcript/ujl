<svelte:options customElement={{ tag: 'ujl-content' }} />

<script lang="ts">
	import type { UJLAbstractNode, UJLTTokenSet } from '@ujl-framework/types';
	import { AdapterRoot } from '@ujl-framework/adapter-svelte';
	import bundledStyles from '../styles/index.css?inline';

	let {
		node,
		tokenSet,
		mode,
		showMetadata = false,
		eventCallback
	}: {
		node: UJLAbstractNode;
		tokenSet?: UJLTTokenSet;
		mode?: 'light' | 'dark' | 'system';
		showMetadata?: boolean;
		eventCallback?: (moduleId: string) => void;
	} = $props();

	/**
	 * Svelte action to inject CSS into Shadow DOM style element.
	 * Returns an update function for reactive style changes.
	 */
	function updateStyle(element: HTMLStyleElement, css: string) {
		element.textContent = css;
		return {
			update(css: string) {
				element.textContent = css;
			}
		};
	}
</script>

<div>
	<style use:updateStyle={bundledStyles} data-ujl-role="styles-bundle"></style>
	<!-- Pass props through to AdapterRoot component -->
	<AdapterRoot {node} {tokenSet} {mode} {showMetadata} {eventCallback} />
</div>
