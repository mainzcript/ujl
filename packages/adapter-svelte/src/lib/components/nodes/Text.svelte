<script lang="ts">
	import type { UJLAbstractTextNode } from '@ujl-framework/types';
	import { Text } from '@ujl-framework/ui';

	interface Props {
		node: UJLAbstractTextNode;
	}

	let { node }: Props = $props();
</script>

<Text>
	{node.props.content}
</Text>
