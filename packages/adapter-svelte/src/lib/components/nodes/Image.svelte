<script lang="ts">
	import type { UJLAbstractImageNode } from '@ujl-framework/types';
	import ImageIcon from '@lucide/svelte/icons/image';

	interface Props {
		node: UJLAbstractImageNode;
		showMetadata?: boolean;
	}

	let { node, showMetadata = false }: Props = $props();

	const hasImage = $derived(node.props.image !== null);
	const imageUrl = $derived(node.props.image?.dataUrl ?? '');
	const altText = $derived(node.props.alt || '');
</script>

<svelte:element
	this={'div'}
	data-ujl-module-id={showMetadata && node.meta?.moduleId ? node.meta.moduleId : undefined}
	class="border-border bg-muted block w-full rounded-md border-2"
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
