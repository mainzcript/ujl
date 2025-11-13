<script lang="ts">
	import type { UJLAbstractNode } from '@ujl-framework/types';

	interface Props {
		node: UJLAbstractNode & { type: 'raw-html' };
	}

	let { node }: Props = $props();
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -->
{@html node.props.content}
