<!-- Preview that composes the UJLC document and renders it with UJLT tokens via AdapterRoot. -->
<script lang="ts">
	import type { UJLCDocument, UJLTDocument } from '@ujl-framework/types';
	import { Composer } from '@ujl-framework/core';
	import { AdapterRoot } from '@ujl-framework/adapter-svelte';
	import '@ujl-framework/adapter-svelte/styles';

	let {
		ujlcDocument,
		ujltDocument,
		mode = 'system'
	}: {
		ujlcDocument: UJLCDocument;
		ujltDocument: UJLTDocument;
		mode?: 'light' | 'dark' | 'system';
	} = $props();

	// Compose document to AST (reactive)
	const ast = $derived.by(() => {
		const composer = new Composer();
		return composer.compose(ujlcDocument);
	});

	// Extract token set (reactive)
	const tokenSet = $derived(ujltDocument.ujlt.tokens);
</script>

<div class="h-full w-full">
	<AdapterRoot node={ast} {tokenSet} {mode} />
</div>
