<script lang="ts">
	import { onMount } from 'svelte';
	import type { UJLCDocument, UJLTDocument } from '@ujl-framework/types';
	import { Composer } from '@ujl-framework/core';
	import { svelteAdapter } from '@ujl-framework/adapter-svelte';
	import type { MountedComponent } from '@ujl-framework/adapter-svelte';
	import '@ujl-framework/adapter-svelte/styles';
	import showcaseDocument from '@ujl-framework/examples/documents/showcase' with { type: 'json' };
	import defaultTheme from '@ujl-framework/examples/themes/default' with { type: 'json' };

	// Use the showcase document from examples package
	const ujlDocument = showcaseDocument as unknown as UJLCDocument;

	// Extract token set from theme document
	const themeDocument = defaultTheme as unknown as UJLTDocument;
	const tokenSet = themeDocument.ujlt.tokens;

	let mountedComponent: MountedComponent | null = null;
	let error: string | null = null;

	onMount(() => {
		try {
			// Create composer and compose the document
			const composer = new Composer();
			const ast = composer.compose(ujlDocument);

			// Use the Svelte adapter to render the AST with tokenSet
			mountedComponent = svelteAdapter(ast, tokenSet, {
				target: '#ujl-content'
			});

			console.log('UJL document successfully rendered with Svelte adapter!');
		} catch (err) {
			error = err instanceof Error ? err.message : 'Unknown error occurred';
			console.error('Error rendering UJL document:', err);
		}

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
		<div id="ujl-content" class="mx-auto w-full max-w-3xl"></div>
	{/if}
</div>
