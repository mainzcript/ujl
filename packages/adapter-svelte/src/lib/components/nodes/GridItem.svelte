<script lang="ts">
	import type { UJLAbstractGridItemNode } from '@ujl-framework/types';
	import { GridItem } from '@ujl-framework/ui';
	import ASTNode from '../ASTNode.svelte';
	import { createModuleClickHandler } from '$lib/utils/events.js';

	interface Props {
		node: UJLAbstractGridItemNode;
		showMetadata?: boolean;
		eventCallback?: (id: string) => void;
	}

	let { node, showMetadata = false, eventCallback }: Props = $props();

	const handleClick = $derived(createModuleClickHandler(node.id, eventCallback));
</script>

<GridItem
	class="md:col-span-6 xl:col-span-4 {eventCallback ? 'cursor-pointer' : undefined}"
	data-ujl-module-id={showMetadata ? node.id : undefined}
	onclick={eventCallback ? handleClick : undefined}
	role={eventCallback ? 'button' : undefined}
	tabindex={eventCallback ? 0 : undefined}
>
	{#if node.props.children}
		{#each node.props.children as childNode, i (i)}
			<ASTNode node={childNode} {showMetadata} {eventCallback} />
		{/each}
	{/if}
</GridItem>
