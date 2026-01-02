<script lang="ts">
	import type { UJLAbstractImageNode } from '@ujl-framework/types';
	import { createModuleClickHandler } from '$lib/utils/events.js';
	import ImageIcon from '@lucide/svelte/icons/image';

	interface Props {
		node: UJLAbstractImageNode;
		showMetadata?: boolean;
		eventCallback?: (id: string) => void;
	}

	let { node, showMetadata = false, eventCallback }: Props = $props();

	const handleClick = $derived(createModuleClickHandler(node.id, eventCallback));

	const hasImage = $derived(node.props.image !== null);
	const imageUrl = $derived(node.props.image?.dataUrl ?? '');
	const altText = $derived(node.props.alt || '');
</script>

<svelte:element
	this={'div'}
	data-ujl-module-id={showMetadata ? node.id : undefined}
	onclick={eventCallback ? handleClick : undefined}
	role={eventCallback ? 'button' : undefined}
	tabindex={eventCallback ? 0 : undefined}
	class="border-border bg-muted block w-full rounded-md border-2 {eventCallback
		? 'cursor-pointer'
		: undefined}"
	aria-label={eventCallback ? (hasImage ? altText : 'Select image') : undefined}
>
	{#if hasImage}
		<img src={imageUrl} alt={altText} class="block h-auto w-full rounded-md" />
	{:else}
		<div
			class="border-border text-muted-foreground flex aspect-4/3 items-center justify-center rounded-md border-2 border-dashed"
		>
			<ImageIcon class="size-12 opacity-40" />
		</div>
	{/if}
</svelte:element>
