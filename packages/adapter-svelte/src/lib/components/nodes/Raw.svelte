<script lang="ts">
	import type { UJLAbstractNode } from "@ujl-framework/types";

	interface Props {
		node: UJLAbstractNode & { type: "raw-html" };
		showMetadata?: boolean;
	}

	let { node, showMetadata = false }: Props = $props();
</script>

<div data-ujl-module-id={showMetadata && node.meta?.moduleId ? node.meta.moduleId : undefined}>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html node.props.content}
</div>
