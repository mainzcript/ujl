<script lang="ts">
	import { fade } from "svelte/transition";
	import { Button } from "@ujl-framework/ui";
	import CrosshairIcon from "@lucide/svelte/icons/crosshair";
	import PlusIcon from "@lucide/svelte/icons/plus";

	interface Props {
		x: number;
		y: number;
		onInsert?: (() => void) | null;
		mode?: "insert" | "drop";
		isActive?: boolean;
		isHovered?: boolean;
		interactive?: boolean;
		zIndex?: number;
	}

	let {
		x,
		y,
		onInsert = null,
		mode = "insert",
		isActive = false,
		isHovered = false,
		interactive = true,
		zIndex = 45,
	}: Props = $props();
	let isButtonHovered = $state(false);

	const isHighlighted = $derived(isActive || isHovered || isButtonHovered);
	const useCrosshairIcon = $derived(mode === "drop");
</script>

<div
	in:fade={{ duration: 120 }}
	out:fade={{ duration: 90 }}
	class="absolute top-0 left-0"
	class:pointer-events-auto={mode === "insert"}
	class:pointer-events-none={mode === "drop"}
	style="transform: translate3d({x}px, {y}px, 0); z-index: {zIndex}; will-change: transform, opacity; transition: transform 90ms linear;"
	data-crafter="placement-target-button"
	data-mode={mode}
	data-active={isActive}
	data-highlighted={isHighlighted ? "true" : "false"}
	data-icon={useCrosshairIcon ? "crosshair" : "plus"}
>
	<div
		class={`flex -translate-x-1/2 -translate-y-1/2 items-center rounded-2xl border-[oklch(var(--editor-accent-light,var(--accent-light)))] transition-[transform,box-shadow,opacity,background-color,border-width] duration-100 ${
			isHighlighted
				? "scale-110 border-[3px] border-solid bg-sidebar/95 shadow-xl ring-2 ring-[oklch(var(--editor-accent-light,var(--accent-light)))]/35"
				: "border-2 border-dotted bg-sidebar shadow-lg"
		}`}
	>
		{#if interactive}
			<Button
				variant="ghost"
				size="icon"
				class="h-6 w-6"
				disabled={mode === "drop"}
				onclick={onInsert ?? undefined}
				onmouseenter={() => {
					isButtonHovered = true;
				}}
				onmouseleave={() => {
					isButtonHovered = false;
				}}
				title={mode === "drop" ? "Drop module here" : "Insert module"}
			>
				{#if useCrosshairIcon}
					<CrosshairIcon class="h-3.5 w-3.5" />
				{:else}
					<PlusIcon class="h-3.5 w-3.5" />
				{/if}
			</Button>
		{:else}
			<div class="flex h-6 w-6 items-center justify-center" aria-hidden="true">
				{#if useCrosshairIcon}
					<CrosshairIcon class="h-3.5 w-3.5" />
				{:else}
					<PlusIcon class="h-3.5 w-3.5" />
				{/if}
			</div>
		{/if}
	</div>
</div>
