<script lang="ts">
	import { onMount } from 'svelte';
	import type { UJLTDocument } from '@ujl-framework/core';
	import { Composer } from '@ujl-framework/core';
	import { svelteAdapter } from '$lib/index.js';
	import type { MountedComponent } from '$lib/index.js';
	import showcaseDocument from '@ujl-framework/examples/documents/showcase' with { type: 'json' };
	import defaultTheme from '@ujl-framework/examples/themes/default' with { type: 'json' };

	// Use the showcase document from examples package
	const ujlDocument = showcaseDocument;

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

<h1>UJL Svelte Adapter Demo</h1>

<p>
	This demo showcases the UJL Framework's Svelte adapter in action. A complex UJL document with
	multiple module types (Text, Cards, Grid, Button, Call-to-Action) is composed into an AST and then
	rendered using Svelte components with full reactivity and type safety.
</p>

<div class="info-box">
	<strong>What you're seeing:</strong> The content below is rendered from a UJL document using the Svelte
	adapter. Each section represents a different UJL module type, demonstrating the adapter's ability to
	handle complex, nested layouts with various content types.
</div>

{#if error}
	<div class="error">
		<strong>Error:</strong>
		{error}
	</div>
{:else}
	<div class="demo-container">
		<h2>Rendered UJL Content:</h2>
		<div id="ujl-content" class="ujl-content"></div>
	</div>
{/if}

<style>
	.demo-container {
		border: 2px solid #ccc;
		padding: 20px;
		margin: 20px 0;
		border-radius: 8px;
		background-color: #f9f9f9;
	}

	.ujl-content {
		border: 1px solid #ddd;
		padding: 15px;
		background-color: white;
		border-radius: 4px;
		margin-top: 10px;
	}

	.info-box {
		background-color: #e3f2fd;
		border: 1px solid #2196f3;
		border-radius: 8px;
		padding: 16px;
		margin: 20px 0;
		color: #1565c0;
	}

	.error {
		color: red;
		padding: 15px;
		border: 2px solid red;
		background-color: #ffe6e6;
		border-radius: 4px;
		margin: 20px 0;
	}
</style>
