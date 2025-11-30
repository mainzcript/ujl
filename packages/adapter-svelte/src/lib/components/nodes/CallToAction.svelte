<script lang="ts">
	import type { UJLAbstractCallToActionModuleNode } from '@ujl-framework/types';
	import { Heading, Text, Card, CardContent, Button } from '@ujl-framework/ui';

	interface Props {
		node: UJLAbstractCallToActionModuleNode;
	}

	let { node }: Props = $props();
</script>

<Card class="rounded-xl px-8 py-16 text-center">
	<CardContent class="space-y-6">
		<Heading>
			{node.props.headline}
		</Heading>

		<Text size="lg" class="mx-auto text-center" intensity="muted">
			{node.props.description}
		</Text>

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
