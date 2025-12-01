<script lang="ts">
	import type { UJLAbstractNode } from '@ujl-framework/types';
	import { Container } from '@ujl-framework/ui';
	import ASTNode from '../ASTNode.svelte';
	import { createModuleClickHandler } from '$lib/utils/events.js';

	interface Props {
		node: UJLAbstractNode & { type: 'container' };
		showMetadata?: boolean;
		eventCallback?: (moduleId: string) => void;
	}

	let { node, showMetadata = false, eventCallback }: Props = $props();

	const handleClick = createModuleClickHandler(node.id, eventCallback);
</script>

<Container
	data-ujl-module-id={showMetadata && node.id ? node.id : undefined}
	onclick={eventCallback ? handleClick : undefined}
	role={eventCallback ? 'button' : undefined}
	tabindex={eventCallback ? 0 : undefined}
	class="space-y-6 {eventCallback ? 'cursor-pointer' : ''}"
>
	{#if node.props.children}
		{#each node.props.children as childNode, i (i)}
			<ASTNode node={childNode} {showMetadata} {eventCallback} />
		{/each}
	{/if}
</Container>
