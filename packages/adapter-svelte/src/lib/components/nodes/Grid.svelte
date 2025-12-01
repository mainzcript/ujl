<script lang="ts">
	import type { UJLAbstractGridNode } from '@ujl-framework/types';
	import { Grid } from '@ujl-framework/ui';
	import ASTNode from '../ASTNode.svelte';
	import { createModuleClickHandler } from '$lib/utils/events.js';

	interface Props {
		node: UJLAbstractGridNode;
		showMetadata?: boolean;
		eventCallback?: (id: string) => void;
	}

	let { node, showMetadata = false, eventCallback }: Props = $props();

	const handleClick = createModuleClickHandler(node.id, eventCallback);
</script>

<Grid
	data-ujl-module-id={showMetadata && node.id ? node.id : undefined}
	onclick={eventCallback ? handleClick : undefined}
	role={eventCallback ? 'button' : undefined}
	tabindex={eventCallback ? 0 : undefined}
	class={eventCallback ? 'cursor-pointer' : undefined}
>
	{#if node.props.children}
		{#each node.props.children as childNode, i (i)}
			<ASTNode node={childNode} {showMetadata} {eventCallback} />
		{/each}
	{/if}
</Grid>
