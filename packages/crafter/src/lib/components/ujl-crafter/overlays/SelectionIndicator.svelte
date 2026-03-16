<script lang="ts">
	import OverlayBase from "./OverlayBase.svelte";

	interface Props {
		moduleId: string;
		containerElement: HTMLElement;
	}

	let { moduleId, containerElement }: Props = $props();
</script>

<OverlayBase
	{moduleId}
	{containerElement}
	padding={15}
	sticky={false}
	zIndex={40}
	pointerEvents="none"
>
	<div
		class="pointer-events-none h-full w-full rounded-md border-2 border-[oklch(var(--editor-accent-light,var(--accent-light)))]"
		data-crafter="selection-indicator"
		data-module-id={moduleId}
	></div>
</OverlayBase>
