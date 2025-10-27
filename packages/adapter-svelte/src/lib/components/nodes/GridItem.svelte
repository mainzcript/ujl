<script lang="ts">
	import type { UJLAbstractGridItemNode } from '@ujl-framework/core';
	import { GridItem } from '@ujl-framework/ui';
	import ASTNode from '../ASTNode.svelte';

	interface Props {
		node: UJLAbstractGridItemNode;
	}

	let { node }: Props = $props();
</script>

<GridItem class="md:col-span-6 xl:col-span-4">
	{#if node.props.children}
		{#each node.props.children as childNode, i (i)}
			<ASTNode node={childNode} />
		{/each}
	{/if}
</GridItem>
