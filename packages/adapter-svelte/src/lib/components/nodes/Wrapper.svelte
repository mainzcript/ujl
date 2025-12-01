<script lang="ts">
	import type { UJLAbstractNode } from '@ujl-framework/types';
	import ASTNode from '../ASTNode.svelte';

	interface Props {
		node: UJLAbstractNode & { type: 'wrapper' };
		showMetadata?: boolean;
		eventCallback?: (id: string) => void;
	}

	let { node, showMetadata = false, eventCallback }: Props = $props();
</script>

<div class="ujl-wrapper">
	{#if node.props.children}
		{#each node.props.children as childNode, i (i)}
			<ASTNode node={childNode} {showMetadata} {eventCallback} />
		{/each}
	{/if}
</div>

<style>
	.ujl-wrapper {
		display: block;
	}
</style>
