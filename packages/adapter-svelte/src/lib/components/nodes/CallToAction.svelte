<script lang="ts">
	import type { UJLAbstractCallToActionModuleNode } from '@ujl-framework/types';
	import { Heading, Card, CardContent, Button } from '@ujl-framework/ui';
	import { RichText } from '../ui/index.js';
	import { createModuleClickHandler } from '$lib/utils/events.js';

	interface Props {
		node: UJLAbstractCallToActionModuleNode;
		showMetadata?: boolean;
		eventCallback?: (id: string) => void;
	}

	let { node, showMetadata = false, eventCallback }: Props = $props();

	const handleClick = $derived(createModuleClickHandler(node.id, eventCallback));
</script>

<Card
	class="rounded-xl px-8 py-16 text-center {eventCallback ? 'cursor-pointer' : undefined}"
	data-ujl-module-id={showMetadata ? node.id : undefined}
	onclick={eventCallback ? handleClick : undefined}
	role={eventCallback ? 'button' : undefined}
	tabindex={eventCallback ? 0 : undefined}
>
	<CardContent class="space-y-6">
		<Heading>
			{node.props.headline}
		</Heading>

		<RichText
			document={node.props.description}
			size="lg"
			intensity="muted"
			class="mx-auto text-center"
		/>

		<div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
			<Button href={node.props.actionButtons.primary.props.href} variant="primary">
				{node.props.actionButtons.primary.props.label}
			</Button>

			{#if node.props.actionButtons.secondary && node.props.actionButtons.secondary.props.label}
				<Button href={node.props.actionButtons.secondary.props.href} variant="muted">
					{node.props.actionButtons.secondary.props.label}
				</Button>
			{/if}
		</div>
	</CardContent>
</Card>
