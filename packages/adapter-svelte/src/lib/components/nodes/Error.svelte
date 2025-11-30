<script lang="ts">
	import type { UJLAbstractNode } from '@ujl-framework/types';
	import { Alert, AlertDescription } from '@ujl-framework/ui';

	interface Props {
		node: UJLAbstractNode & { type: 'error' };
	}

	let { node }: Props = $props();
</script>

<Alert variant="destructive">
	<AlertDescription>
		<strong>Error:</strong>
		{node.props.message}
	</AlertDescription>
</Alert>
