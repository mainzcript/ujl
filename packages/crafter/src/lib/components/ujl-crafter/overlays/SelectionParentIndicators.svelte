<script lang="ts">
	import OverlayBase from "./OverlayBase.svelte";
	import { getSelectionParentOpacity } from "./selection-parent-indicators.js";

	interface Props {
		moduleId: string;
		containerElement: HTMLElement;
		parentModuleIds: string[];
	}

	let { moduleId, containerElement, parentModuleIds }: Props = $props();
</script>

{#each parentModuleIds as parentModuleId, parentDepth (parentModuleId)}
	<OverlayBase
		moduleId={parentModuleId}
		{containerElement}
		padding={15}
		sticky={false}
		zIndex={35}
		pointerEvents="none"
	>
		<div
			class="pointer-events-none h-full w-full rounded-md border-2 border-dashed border-[oklch(var(--editor-accent-light,var(--accent-light)))]"
			style={`opacity: ${getSelectionParentOpacity(parentDepth)};`}
			data-crafter="selection-parent-indicator"
			data-selected-module-id={moduleId}
			data-parent-module-id={parentModuleId}
			data-parent-depth={parentDepth}
		></div>
	</OverlayBase>
{/each}
