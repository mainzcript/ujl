<script lang="ts">
	import type { UJLAbstractNode } from '@ujl-framework/core';
	import { Alert, AlertDescription } from '@ujl-framework/ui';

	interface Props {
		node: UJLAbstractNode & { type: 'error' };
	}

	let { node }: Props = $props();
</script>

<Alert variant="flavored" flavor="destructive">
	<AlertDescription>
		<strong>Error:</strong>
		{node.props.message}
	</AlertDescription>
</Alert>
