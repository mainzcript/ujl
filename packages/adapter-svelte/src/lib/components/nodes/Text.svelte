<script lang="ts">
	import type { UJLAbstractTextNode } from '@ujl-framework/types';
	import { Text } from '@ujl-framework/ui';
	import { createModuleClickHandler } from '$lib/utils/events.js';

	interface Props {
		node: UJLAbstractTextNode;
		showMetadata?: boolean;
		eventCallback?: (id: string) => void;
	}

	let { node, showMetadata = false, eventCallback }: Props = $props();

	const handleClick = createModuleClickHandler(node.id, eventCallback);
</script>

<Text
	data-ujl-module-id={showMetadata && node.id ? node.id : undefined}
	onclick={eventCallback ? handleClick : undefined}
	role={eventCallback ? 'button' : undefined}
	tabindex={eventCallback ? 0 : undefined}
	class={eventCallback ? 'cursor-pointer' : undefined}
>
	{node.props.content}
</Text>
