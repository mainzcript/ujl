<script lang="ts">
	import type { UJLAbstractNode } from '@ujl-framework/core';
	import {
		Container,
		Wrapper,
		Raw,
		Error,
		Text,
		Button,
		Card,
		Grid,
		GridItem,
		CallToAction
	} from './nodes/index.js';

	interface Props {
		node: UJLAbstractNode;
	}

	let { node }: Props = $props();
</script>

{#if node.type === 'container'}
	<Container {node} />
{:else if node.type === 'wrapper'}
	<Wrapper {node} />
{:else if node.type === 'raw-html'}
	<Raw {node} />
{:else if node.type === 'error'}
	<Error {node} />
{:else if node.type === 'text'}
	<Text {node} />
{:else if node.type === 'button'}
	<Button {node} />
{:else if node.type === 'card'}
	<Card {node} />
{:else if node.type === 'grid'}
	<Grid {node} />
{:else if node.type === 'grid-item'}
	<GridItem {node} />
{:else if node.type === 'call-to-action'}
	<CallToAction {node} />
{:else}
	<Error
		node={{
			type: 'error',
			props: { message: `Unknown node type: ${(node as { type: string }).type}` }
		}}
	/>
{/if}
