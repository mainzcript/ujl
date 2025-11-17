<!--
	Preview component for rendering UJL documents with live theme updates.

	This component orchestrates the rendering pipeline:
	1. Composes the UJL content document into an AST using Composer
	2. Extracts theme tokens from the UJLT document
	3. Renders the AST with the theme tokens using the Svelte adapter

	The component reacts to changes in both documents and re-renders automatically.
	We rely on reference changes (new object instances) from the parent to detect updates,
	not deep equality checks.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import type { UJLCDocument, UJLTDocument } from '@ujl-framework/types';
	import { Composer } from '@ujl-framework/core';
	import { svelteAdapter } from '@ujl-framework/adapter-svelte';
	import type { MountedComponent } from '@ujl-framework/adapter-svelte';
	import '@ujl-framework/adapter-svelte/styles';

	let { ujlcDocument, ujltDocument }: { ujlcDocument: UJLCDocument; ujltDocument: UJLTDocument } =
		$props();

	let mountedComponent = $state<MountedComponent | null>(null);
	let error = $state<string | null>(null);

	/**
	 * Renders the UJL document by composing it into an AST and mounting it with the Svelte adapter.
	 * Cleans up any previously mounted component before rendering.
	 *
	 * The rendering pipeline:
	 * 1. Create a Composer instance and compose the content document into an AST
	 * 2. Extract the token set from the theme document (ujlt.tokens)
	 * 3. Use svelteAdapter to render the AST with the theme tokens into the target element
	 */
	function renderDocument() {
		// Cleanup previous mount
		if (mountedComponent) {
			mountedComponent.unmount();
			mountedComponent = null;
		}

		try {
			// Create composer and compose the document
			const composer = new Composer();
			const ast = composer.compose(ujlcDocument);

			// Extract token set from theme document
			const tokenSet = ujltDocument.ujlt.tokens;

			// Use the Svelte adapter to render the AST with tokenSet
			mountedComponent = svelteAdapter(ast, tokenSet, {
				target: '#ujl-content'
			});

			error = null;
			// Debug log - can be removed or gated behind a debug flag in production
			console.log('UJL document successfully rendered with Svelte adapter!');
		} catch (err) {
			error = err instanceof Error ? err.message : 'Unknown error occurred';
			console.error('Error rendering UJL document:', err);
		}
	}

	/**
	 * Track previous document references to avoid unnecessary re-renders.
	 * We rely on reference equality checks since the parent creates new object instances
	 * when documents are updated (immutable updates).
	 */
	let previousUjlcDocument = $state<UJLCDocument | null>(null);
	let previousUjltDocument = $state<UJLTDocument | null>(null);

	onMount(() => {
		renderDocument();
		previousUjlcDocument = ujlcDocument;
		previousUjltDocument = ujltDocument;

		// Cleanup on component destroy
		return () => {
			if (mountedComponent) {
				mountedComponent.unmount();
			}
		};
	});

	/**
	 * Re-render when documents change (only if they actually changed).
	 * This effect watches for reference changes in the document objects.
	 * Since the parent uses immutable updates, new object instances indicate changes.
	 */
	$effect(() => {
		if (
			ujlcDocument &&
			ujltDocument &&
			(ujlcDocument !== previousUjlcDocument || ujltDocument !== previousUjltDocument)
		) {
			previousUjlcDocument = ujlcDocument;
			previousUjltDocument = ujltDocument;
			renderDocument();
		}
	});
</script>

<div class="flex flex-1 flex-col gap-4 p-4">
	{#if error}
		<div
			class="mx-auto w-full max-w-3xl rounded-xl border-2 border-destructive bg-destructive/10 p-4"
		>
			<strong class="text-destructive">Error:</strong>
			<span class="text-destructive">{error}</span>
		</div>
	{:else}
		<div id="ujl-content" class="mx-auto w-full max-w-3xl"></div>
	{/if}
</div>
