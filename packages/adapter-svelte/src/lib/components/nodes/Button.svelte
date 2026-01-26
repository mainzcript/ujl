<script lang="ts">
	import type { UJLAbstractButtonNode } from '@ujl-framework/types';
	import { Button } from '@ujl-framework/ui';

	interface Props {
		node: UJLAbstractButtonNode;
		showMetadata?: boolean;
	}

	let { node, showMetadata = false }: Props = $props();
</script>

<Button
	href={node.props.href}
	data-ujl-module-id={showMetadata && node.meta?.moduleId ? node.meta.moduleId : undefined}
>
	{node.props.label}
</Button>
