<!-- Root component that combines theme support (UJLTheme) and AST node rendering. -->
<script lang="ts">
	import type { UJLAbstractNode, UJLTTokenSet } from '@ujl-framework/types';
	import { UJLTheme } from '@ujl-framework/ui';
	import ASTNode from './ASTNode.svelte';

	interface Props {
		node: UJLAbstractNode;
		tokenSet?: UJLTTokenSet;
		mode?: 'light' | 'dark' | 'system';
		showMetadata?: boolean;
	}

	let { node, tokenSet, mode, showMetadata = false }: Props = $props();
</script>

<UJLTheme tokens={tokenSet} {mode} class="bg-ambient h-content isolate p-10">
	<ASTNode {node} {showMetadata} />
</UJLTheme>
