<script lang="ts">
	import OverlayBase from "./OverlayBase.svelte";
	import { getCanvasInteractionContext } from "$lib/stores/index.js";

	interface Props {
		containerElement: HTMLElement;
		selectedModuleId?: string | null;
	}

	let { containerElement, selectedModuleId }: Props = $props();
	const canvasInteraction = getCanvasInteractionContext();
	const hoveredModuleId = $derived(
		canvasInteraction.hoveredModuleId && canvasInteraction.hoveredModuleId !== selectedModuleId
			? canvasInteraction.hoveredModuleId
			: null,
	);
</script>

{#if hoveredModuleId}
	<OverlayBase
		moduleId={hoveredModuleId}
		{containerElement}
		padding={15}
		sticky={false}
		zIndex={30}
		pointerEvents="none"
	>
		<div
			class="pointer-events-none h-full w-full rounded-md border-2 border-dashed border-[oklch(var(--editor-accent-light,var(--accent-light)))] opacity-70"
			data-crafter="hover-indicator"
		></div>
	</OverlayBase>
{/if}
