<script lang="ts">
	import type { UJLAbstractCardNode } from '@ujl-framework/types';
	import { Card, CardTitle, CardDescription, CardContent, CardHeader } from '@ujl-framework/ui';
	import ASTNode from '../ASTNode.svelte';
	import { createModuleClickHandler } from '$lib/utils/events.js';

	interface Props {
		node: UJLAbstractCardNode;
		showMetadata?: boolean;
		eventCallback?: (id: string) => void;
	}

	let { node, showMetadata = false, eventCallback }: Props = $props();

	const handleClick = createModuleClickHandler(node.id, eventCallback);
</script>

<Card
	class="h-full {eventCallback ? 'cursor-pointer' : undefined}"
	data-ujl-module-id={showMetadata && node.id ? node.id : undefined}
	onclick={eventCallback ? handleClick : undefined}
	role={eventCallback ? 'button' : undefined}
	tabindex={eventCallback ? 0 : undefined}
>
	<CardHeader>
		<CardTitle>{node.props.title}</CardTitle>
		<CardDescription>{node.props.description}</CardDescription>
	</CardHeader>
	{#if node.props.children && node.props.children.length > 0}
		<CardContent>
			{#each node.props.children as childNode, i (i)}
				<ASTNode node={childNode} {showMetadata} {eventCallback} />
			{/each}
		</CardContent>
	{/if}
</Card>
