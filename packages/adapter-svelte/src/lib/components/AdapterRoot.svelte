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
	import type { UJLAbstractNode, UJLTTokenSet } from '@ujl-framework/core';
	import { UJLTheme } from '@ujl-framework/ui';
	import ASTNode from './ASTNode.svelte';

	interface Props {
		node: UJLAbstractNode;
		tokenSet?: UJLTTokenSet;
	}

	let { node, tokenSet }: Props = $props();
</script>

<UJLTheme tokens={tokenSet}>
	<ASTNode {node} />
</UJLTheme>
