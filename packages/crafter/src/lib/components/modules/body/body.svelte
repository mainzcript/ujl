<script lang="ts">
	import { onMount } from 'svelte';
	import { Composer } from '@ujl-framework/core';
	import { svelteAdapter } from '@ujl-framework/adapter-svelte';
	import type { MountedComponent } from '@ujl-framework/adapter-svelte';
	import '@ujl-framework/adapter-svelte/styles';
	import defaultTheme from '@ujl-framework/examples/themes/default' with { type: 'json' };
	const themeDocument = defaultTheme as unknown as UJLTDocument;
	const tokenSet = themeDocument.ujlt.tokens;
	import { getDocumentContext } from '$lib/components/modules/context/document-context.svelte.ts';
	import { type UJLTDocument } from '@ujl-framework/types';
	// import { getThemeContext } from '$lib/contexts/theme-context.svelte';

	// Get contexts from parent
	const documentContext = getDocumentContext();
	// const themeContext = getThemeContext();

	let mountedComponent: MountedComponent | null = null;
	let error: string | null = $state(null);
	let containerElement: HTMLDivElement | undefined = $state();

	// Track previous document to detect changes
	let previousDocument = $state(documentContext.document);

	// Re-render when document changes
	$effect(() => {
		// Access the document to make this effect reactive
		const currentDocument = documentContext.document;

		// Skip initial render (handled by onMount)
		if (previousDocument === currentDocument && mountedComponent !== null) {
			return;
		}

		previousDocument = currentDocument;

		// Only re-render if we have a container and it's not the initial mount
		if (containerElement && mountedComponent !== null) {
			renderDocument();
		}
	});

	function renderDocument() {
		try {
			// Unmount previous component if it exists
			if (mountedComponent) {
				mountedComponent.unmount();
			}

			// Create composer and compose the document
			const composer = new Composer();
			const ast = composer.compose(documentContext.document);

			// Use the Svelte adapter to render the AST with tokenSet
			mountedComponent = svelteAdapter(ast, tokenSet, {
				target: containerElement as HTMLDivElement
			});

			error = null;
			console.log('UJL document successfully rendered with Svelte adapter!');
		} catch (err) {
			error = err instanceof Error ? err.message : 'Unknown error occurred';
			console.error('Error rendering UJL document:', err);
		}
	}

	onMount(() => {
		renderDocument();

		// Cleanup on component destroy
		return () => {
			if (mountedComponent) {
				mountedComponent.unmount();
			}
		};
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
		<div bind:this={containerElement} class="mx-auto w-full max-w-3xl"></div>
	{/if}
</div>
