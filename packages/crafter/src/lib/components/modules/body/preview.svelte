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
			console.log('UJL document successfully rendered with Svelte adapter!');
		} catch (err) {
			error = err instanceof Error ? err.message : 'Unknown error occurred';
			console.error('Error rendering UJL document:', err);
		}
	}

	// Track previous document references to avoid unnecessary re-renders
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

	// Re-render when documents change (only if they actually changed)
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
