<!--
 * ASTNode component
 *
 * Central router component that delegates to specific node components
 * based on the AST node type.
 -->
<script lang="ts">
	import type { UJLAbstractNode, UJLAbstractErrorNode } from '@ujl-framework/types';
	import { generateUid } from '@ujl-framework/core';
	import { NODE_TYPES } from '../constants.js';
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
		CallToAction,
		Image
	} from './nodes/index.js';

	interface Props {
		node: UJLAbstractNode;
		showMetadata?: boolean;
		eventCallback?: (moduleId: string) => void;
	}

	let { node, showMetadata = false, eventCallback }: Props = $props();
</script>

{#if node.type === NODE_TYPES.CONTAINER}
	<Container {node} {showMetadata} {eventCallback} />
{:else if node.type === NODE_TYPES.WRAPPER}
	<Wrapper {node} {showMetadata} {eventCallback} />
{:else if node.type === NODE_TYPES.RAW_HTML}
	<Raw {node} />
{:else if node.type === NODE_TYPES.ERROR}
	<Error {node} />
{:else if node.type === NODE_TYPES.TEXT}
	<Text {node} {showMetadata} {eventCallback} />
{:else if node.type === NODE_TYPES.BUTTON}
	<Button {node} {showMetadata} {eventCallback} />
{:else if node.type === NODE_TYPES.CARD}
	<Card {node} {showMetadata} {eventCallback} />
{:else if node.type === NODE_TYPES.GRID}
	<Grid {node} {showMetadata} {eventCallback} />
{:else if node.type === NODE_TYPES.GRID_ITEM}
	<GridItem {node} {showMetadata} {eventCallback} />
{:else if node.type === NODE_TYPES.CALL_TO_ACTION}
	<CallToAction {node} {showMetadata} {eventCallback} />
{:else if node.type === NODE_TYPES.IMAGE}
	<Image {node} {showMetadata} {eventCallback} />
{:else}
	{@const errorNode: UJLAbstractErrorNode = {
		type: NODE_TYPES.ERROR,
		props: { message: `Unknown node type: ${(node as { type: string }).type}` },
		id: (node as { id?: string }).id ?? generateUid(10)
	}}
	<Error node={errorNode} />
{/if}
