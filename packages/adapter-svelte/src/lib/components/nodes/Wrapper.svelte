<script lang="ts">
	import type { UJLAbstractNode } from '@ujl-framework/types';
	import ASTNode from '../ASTNode.svelte';

	interface Props {
		node: UJLAbstractNode & { type: 'wrapper' };
		showMetadata?: boolean;
	}

	let { node, showMetadata = false }: Props = $props();
</script>

<div class="ujl-wrapper space-y-6">
	{#if node.props.children}
		{#each node.props.children as childNode, i (i)}
			<ASTNode node={childNode} {showMetadata} />
		{/each}
	{/if}
</div>

<style>
	.ujl-wrapper {
		display: block;
	}
</style>
