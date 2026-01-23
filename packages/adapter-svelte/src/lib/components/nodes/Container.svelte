<script lang="ts">
	import type { UJLAbstractNode } from '@ujl-framework/types';
	import { Container } from '@ujl-framework/ui';
	import ASTNode from '../ASTNode.svelte';

	interface Props {
		node: UJLAbstractNode & { type: 'container' };
		showMetadata?: boolean;
	}

	let { node, showMetadata = false }: Props = $props();
</script>

<Container
	data-ujl-module-id={showMetadata && node.meta?.moduleId ? node.meta.moduleId : undefined}
	class="space-y-6"
>
	{#if node.props.children}
		{#each node.props.children as childNode, i (i)}
			<ASTNode node={childNode} {showMetadata} />
		{/each}
	{/if}
</Container>
