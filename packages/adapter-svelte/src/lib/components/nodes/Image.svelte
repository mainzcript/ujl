<script lang="ts">
	import type { UJLAbstractImageNode } from "@ujl-framework/types";
	import ImageIcon from "@lucide/svelte/icons/image";

	interface Props {
		node: UJLAbstractImageNode;
		showMetadata?: boolean;
	}

	let { node, showMetadata = false }: Props = $props();

	const hasImage = $derived(node.props.asset !== null);
	const asset = $derived(node.props.asset);

	// Alt text priority: module field (even if empty string) > asset metadata > empty
	// null/undefined in module field means "use asset metadata", empty string means "no alt (decorative)"
	const altText = $derived(
		node.props.alt !== null && node.props.alt !== undefined
			? node.props.alt
			: (asset?.meta?.alt ?? ""),
	);

	// Main image props
	const imgSrc = $derived(asset?.img.src ?? "");
	const imgWidth = $derived(asset?.img.width);
	const imgHeight = $derived(asset?.img.height);
	const imgSrcset = $derived(asset?.img.srcset);

	// Picture sources for responsive images
	const sources = $derived(asset?.sources);

	// Derived values for img srcset processing
	const imgSrcsetInfo = $derived(
		typeof imgSrcset === "string"
			? { srcset: imgSrcset }
			: imgSrcset
				? {
						srcset: imgSrcset.candidates
							.map((s) => {
								if (imgSrcset.kind === "w") {
									return `${s.url} ${(s as { url: string; w: number }).w}w`;
								} else {
									return `${s.url} ${(s as { url: string; x: number }).x}x`;
								}
							})
							.join(", "),
						sizes: imgSrcset.kind === "w" ? imgSrcset.sizes : undefined,
					}
				: null,
	);
</script>

<svelte:element
	this={"div"}
	data-ujl-module-id={showMetadata && node.meta?.moduleId ? node.meta.moduleId : undefined}
	class="border-border bg-muted block w-full rounded-md border-2"
>
	{#if hasImage}
		{#if sources && sources.length > 0}
			<!-- Responsive picture with source elements -->
			<picture>
				{#each sources as source (source.srcset)}
					{@const srcset = source.srcset}
					{@const isStringSrcset = typeof srcset === "string"}
					{@const isWDescriptor = !isStringSrcset && srcset.kind === "w"}
					<source
						srcset={isStringSrcset
							? srcset
							: srcset.candidates
									.map((s) => {
										if (srcset.kind === "w") {
											return `${s.url} ${(s as { url: string; w: number }).w}w`;
										} else {
											return `${s.url} ${(s as { url: string; x: number }).x}x`;
										}
									})
									.join(", ")}
						sizes={isWDescriptor ? srcset.sizes : undefined}
						type={source.type}
						media={source.media}
					/>
				{/each}
				<img
					src={imgSrc}
					alt={altText}
					width={imgWidth}
					height={imgHeight}
					class="block h-auto w-full rounded-md"
				/>
			</picture>
		{:else if imgSrcsetInfo}
			<!-- Image with srcset (no picture wrapper needed) -->
			<img
				src={imgSrc}
				alt={altText}
				width={imgWidth}
				height={imgHeight}
				srcset={imgSrcsetInfo.srcset}
				sizes={imgSrcsetInfo.sizes}
				class="block h-auto w-full rounded-md"
			/>
		{:else}
			<!-- Simple image without srcset -->
			<img
				src={imgSrc}
				alt={altText}
				width={imgWidth}
				height={imgHeight}
				class="block h-auto w-full rounded-md"
			/>
		{/if}
	{:else}
		<div
			class="border-border text-muted-foreground flex aspect-4/3 items-center justify-center rounded-md border-2 border-dashed"
		>
			<ImageIcon class="size-12 opacity-40" />
		</div>
	{/if}
</svelte:element>
