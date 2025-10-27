<script lang="ts">
	import type { UJLAbstractNode } from '@ujl-framework/core';
	import ASTNode from '../ASTNode.svelte';

	interface Props {
		node: UJLAbstractNode & { type: 'wrapper' };
	}

	let { node }: Props = $props();
</script>

<div class="ujl-wrapper">
	{#if node.props.children}
		{#each node.props.children as childNode, i (i)}
			<ASTNode node={childNode} />
		{/each}
	{/if}
</div>

<style>
	.ujl-wrapper {
		display: block;
	}
</style>
