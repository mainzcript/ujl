<script lang="ts">
	import type { UJLAbstractNode } from "@ujl-framework/types";

	interface Props {
		node: UJLAbstractNode & { type: "raw-html" };
		showMetadata?: boolean;
	}

	let { node, showMetadata = false }: Props = $props();
</script>

{#if showMetadata}
	<div data-ujl-module-id={node.meta?.moduleId ?? undefined} class="h-full">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html node.props.content}
	</div>
{:else}
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html node.props.content}
{/if}
