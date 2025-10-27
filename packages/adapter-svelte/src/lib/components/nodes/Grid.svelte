<script lang="ts">
	import type { UJLAbstractGridNode } from '@ujl-framework/core';
	import { Grid } from '@ujl-framework/ui';
	import ASTNode from '../ASTNode.svelte';

	interface Props {
		node: UJLAbstractGridNode;
	}

	let { node }: Props = $props();
</script>

<Grid>
	{#if node.props.children}
		{#each node.props.children as childNode, i (i)}
			<ASTNode node={childNode} />
		{/each}
	{/if}
</Grid>
