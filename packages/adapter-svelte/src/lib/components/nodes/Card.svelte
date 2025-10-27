<script lang="ts">
	import type { UJLAbstractCardNode } from '@ujl-framework/core';
	import { Card, CardTitle, CardDescription, CardContent, CardHeader } from '@ujl-framework/ui';
	import ASTNode from '../ASTNode.svelte';

	interface Props {
		node: UJLAbstractCardNode;
	}

	let { node }: Props = $props();
</script>

<Card>
	<CardHeader>
		<CardTitle>{node.props.title}</CardTitle>
		<CardDescription>{node.props.description}</CardDescription>
	</CardHeader>
	{#if node.props.children && node.props.children.length > 0}
		<CardContent>
			{#each node.props.children as childNode, i (i)}
				<ASTNode node={childNode} />
			{/each}
		</CardContent>
	{/if}
</Card>
