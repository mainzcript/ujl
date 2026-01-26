<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { UJLTDocument } from '@ujl-framework/types';
	import defaultTheme from '@ujl-framework/examples/themes/default' with { type: 'json' };
	import { UJLTheme } from '../src/lib/components/ui/ujl-theme/index.ts';

	let { children }: { children?: Snippet } = $props();

	const themeDocument = defaultTheme as unknown as UJLTDocument;
	const themeTokens = themeDocument.ujlt.tokens;
</script>

<UJLTheme tokens={themeTokens}>
	{@render children?.()}
</UJLTheme>
