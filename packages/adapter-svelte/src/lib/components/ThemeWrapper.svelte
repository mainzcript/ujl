<script lang="ts">
	import type { UJLAbstractNode, UJLTTokenSet } from '@ujl-framework/core';
	import { UJLTheme } from '@ujl-framework/ui';
	import ASTNode from './ASTNode.svelte';

	interface Props {
		node: UJLAbstractNode;
		theme?: UJLTTokenSet;
	}

	let { node, theme }: Props = $props();
</script>

<UJLTheme tokens={theme}>
	<ASTNode {node} />
</UJLTheme>
