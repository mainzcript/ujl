<script lang="ts">
	import type { UJLAbstractTextNode } from '@ujl-framework/types';
	import { RichText } from '../ui/index.js';

	interface Props {
		node: UJLAbstractTextNode;
		showMetadata?: boolean;
	}

	let { node, showMetadata = false }: Props = $props();
</script>

<RichText
	document={node.props.content}
	data-ujl-module-id={showMetadata && node.meta?.moduleId ? node.meta.moduleId : undefined}
/>
