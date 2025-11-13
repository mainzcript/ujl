<svelte:options customElement={{ tag: 'ujl-content' }} />

<script lang="ts">
	import type { UJLAbstractNode, UJLTTokenSet } from '@ujl-framework/types';
	import { AdapterRoot } from '@ujl-framework/adapter-svelte';
	import bundledStyles from '../styles/index.css?inline';

	let {
		node,
		tokenSet,
		mode
	}: {
		node: UJLAbstractNode;
		tokenSet?: UJLTTokenSet;
		mode?: 'light' | 'dark' | 'system';
	} = $props();

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
	<AdapterRoot {node} {tokenSet} {mode} />
</div>
