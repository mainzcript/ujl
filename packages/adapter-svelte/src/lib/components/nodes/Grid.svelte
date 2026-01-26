<script lang="ts">
	import type { UJLAbstractGridNode } from '@ujl-framework/types';
	import { Grid } from '@ujl-framework/ui';
	import ASTNode from '../ASTNode.svelte';

	interface Props {
		node: UJLAbstractGridNode;
		showMetadata?: boolean;
	}

	let { node, showMetadata = false }: Props = $props();
</script>

<Grid data-ujl-module-id={showMetadata && node.meta?.moduleId ? node.meta.moduleId : undefined}>
	{#if node.props.children}
		{#each node.props.children as childNode, i (i)}
			<ASTNode node={childNode} {showMetadata} />
		{/each}
	{/if}
</Grid>
