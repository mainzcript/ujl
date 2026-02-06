<script lang="ts">
	import type { UJLAbstractCallToActionModuleNode } from "@ujl-framework/types";
	import { Heading, Card, CardContent, Button } from "@ujl-framework/ui";
	import { RichText } from "../ui/index.js";

	interface Props {
		node: UJLAbstractCallToActionModuleNode;
		showMetadata?: boolean;
	}

	let { node, showMetadata = false }: Props = $props();
</script>

<Card
	class="rounded-xl px-8 py-16 text-center"
	data-ujl-module-id={showMetadata && node.meta?.moduleId ? node.meta.moduleId : undefined}
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
