<script lang="ts">
	import type { UJLAbstractButtonNode } from '@ujl-framework/types';
	import { Button } from '@ujl-framework/ui';
	import { createModuleClickHandler } from '$lib/utils/events.js';

	interface Props {
		node: UJLAbstractButtonNode;
		showMetadata?: boolean;
		eventCallback?: (id: string) => void;
	}

	let { node, showMetadata = false, eventCallback }: Props = $props();

	const handleClick = createModuleClickHandler(node.id, eventCallback);
</script>

<Button
	href={node.props.href}
	data-ujl-module-id={showMetadata && node.id ? node.id : undefined}
	onclick={eventCallback ? handleClick : undefined}
	role={eventCallback ? 'button' : undefined}
	tabindex={eventCallback ? 0 : undefined}
	class={eventCallback ? 'cursor-pointer' : undefined}
>
	{node.props.label}
</Button>
