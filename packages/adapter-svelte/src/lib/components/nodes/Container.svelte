<script lang="ts">
	import type { UJLAbstractNode } from '@ujl-framework/types';
	import { Container } from '@ujl-framework/ui';
	import ASTNode from '../ASTNode.svelte';

	interface Props {
		node: UJLAbstractNode & { type: 'container' };
	}

	let { node }: Props = $props();
</script>

<Container class="space-y-6">
	{#if node.props.children}
		{#each node.props.children as childNode, i (i)}
			<ASTNode node={childNode} />
		{/each}
	{/if}
</Container>
