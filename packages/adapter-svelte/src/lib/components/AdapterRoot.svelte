<!--
 * AdapterRoot component
 *
 * Root component for the Svelte adapter that combines:
 * - Theme support via UJLTheme
 * - AST node rendering
 *
 * This is the main component used by svelteAdapter.
 * Styles must be imported separately by the consumer.
 -->
<script lang="ts">
	import type { UJLAbstractNode, UJLTTokenSet } from '@ujl-framework/types';
	import { UJLTheme } from '@ujl-framework/ui';
	import ASTNode from './ASTNode.svelte';

	interface Props {
		node: UJLAbstractNode;
		tokenSet?: UJLTTokenSet;
		mode?: 'light' | 'dark' | 'system';
	}

	let { node, tokenSet, mode }: Props = $props();
</script>

<UJLTheme tokens={tokenSet} {mode}>
	<ASTNode {node} />
</UJLTheme>
