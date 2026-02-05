<script lang="ts">
	import type { ProseMirrorDocument } from "@ujl-framework/types";
	import type { HTMLAttributes } from "svelte/elements";
	import { Text, type TextSize, type TextWeight, type TextIntensity } from "@ujl-framework/ui";
	import { prosemirrorToHtml } from "./prosemirror.js";

	let {
		ref = $bindable(null),
		document,
		size,
		weight,
		intensity,
		class: className = "",
		...restProps
	}: HTMLAttributes<HTMLElement> & {
		ref?: HTMLElement | null;
		document?: ProseMirrorDocument | null;
		size?: TextSize;
		weight?: TextWeight;
		intensity?: TextIntensity;
	} = $props();

	const html = $derived.by(() => {
		if (!document || document.type !== "doc") {
			return "";
		}
		return prosemirrorToHtml(document);
	});
</script>

<Text bind:ref as="div" {size} {weight} {intensity} class={className} {...restProps}>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html html}
</Text>
