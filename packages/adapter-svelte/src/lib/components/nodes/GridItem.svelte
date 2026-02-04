<script lang="ts">
	import type { UJLAbstractGridItemNode } from "@ujl-framework/types";
	import { GridItem } from "@ujl-framework/ui";
	import ASTNode from "../ASTNode.svelte";

	interface Props {
		node: UJLAbstractGridItemNode;
		showMetadata?: boolean;
	}

	let { node, showMetadata = false }: Props = $props();
</script>

<GridItem class="@xl/ujl-grid:col-span-6 @4xl/ujl-grid:col-span-4">
	{#if node.props.children}
		{#each node.props.children as childNode, i (i)}
			<ASTNode node={childNode} {showMetadata} />
		{/each}
	{/if}
</GridItem>
