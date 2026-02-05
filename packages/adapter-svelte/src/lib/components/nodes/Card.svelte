<script lang="ts">
	import type { UJLAbstractCardNode } from "@ujl-framework/types";
	import { Card, CardTitle, CardContent, CardHeader } from "@ujl-framework/ui";
	import ASTNode from "../ASTNode.svelte";
	import { RichText } from "../ui/rich-text/index.js";

	interface Props {
		node: UJLAbstractCardNode;
		showMetadata?: boolean;
	}

	let { node, showMetadata = false }: Props = $props();
</script>

<Card
	class="h-full"
	data-ujl-module-id={showMetadata && node.meta?.moduleId ? node.meta.moduleId : undefined}
>
	<CardHeader>
		<CardTitle>{node.props.title}</CardTitle>
		<!-- Card Description -->
		<RichText document={node.props.description} size="sm" intensity="muted" />
	</CardHeader>
	{#if node.props.children && node.props.children.length > 0}
		<CardContent>
			{#each node.props.children as childNode, i (i)}
				<ASTNode node={childNode} {showMetadata} />
			{/each}
		</CardContent>
	{/if}
</Card>
