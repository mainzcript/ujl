<script lang="ts">
	import '../app.css';
	import type { UJLTDocument } from '@ujl-framework/types';
	import { UJLTheme } from '@ujl-framework/ui';
	import defaultTheme from '@ujl-framework/examples/themes/default' with { type: 'json' };

	let { children } = $props();

	// Extract token set from theme document
	const themeDocument = defaultTheme as unknown as UJLTDocument;
	const tokenSet = themeDocument.ujlt.tokens;
</script>

<UJLTheme tokens={tokenSet} class="h-screen">
	{@render children()}
</UJLTheme>
