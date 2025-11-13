<script lang="ts">
	import type { UJLAbstractButtonNode } from '@ujl-framework/types';
	import { Button } from '@ujl-framework/ui';

	interface Props {
		node: UJLAbstractButtonNode;
	}

	let { node }: Props = $props();
</script>

<Button href={node.props.href}>
	{node.props.label}
</Button>
