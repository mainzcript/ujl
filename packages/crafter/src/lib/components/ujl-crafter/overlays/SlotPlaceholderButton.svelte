<script lang="ts">
	import PlacementTargetButton from "./PlacementTargetButton.svelte";

	interface Props {
		x: number;
		y: number;
		width: number;
		height: number;
		onInsert?: (() => void) | null;
		mode?: "insert" | "drop";
		isActive?: boolean;
		zIndex?: number;
	}

	let {
		x,
		y,
		width,
		height,
		onInsert = null,
		mode = "insert",
		isActive = false,
		zIndex = 40,
	}: Props = $props();
	let isHovered = $state(false);
</script>

<div
	class="absolute"
	class:pointer-events-auto={mode === "insert"}
	class:pointer-events-none={mode === "drop"}
	style="left: {x}px; top: {y}px; width: {width}px; height: {height}px; z-index: {zIndex};"
	data-crafter="slot-placeholder-target"
	data-mode={mode}
	data-active={isActive}
	data-highlighted={isActive || isHovered ? "true" : "false"}
	role="button"
	tabindex={mode === "insert" ? 0 : -1}
	aria-label={mode === "drop" ? "Drop module here" : "Insert module"}
	onmouseenter={() => {
		isHovered = true;
	}}
	onmouseleave={() => {
		isHovered = false;
	}}
	onkeydown={(event) => {
		if (mode === "insert" && (event.key === "Enter" || event.key === " ")) {
			event.preventDefault();
			onInsert?.();
		}
	}}
	onclick={() => {
		if (mode === "insert") {
			onInsert?.();
		}
	}}
>
	<div
		class={`flex h-full w-full items-center justify-center rounded-[var(--editor-radius,var(--radius))] transition-[background-color,box-shadow,outline-color] duration-100 ${
			isActive || isHovered
				? "bg-[oklch(var(--editor-accent-light,var(--accent-light))/0.08)] outline outline-2 outline-[oklch(var(--editor-accent-light,var(--accent-light))/0.32)]"
				: "bg-transparent outline outline-1 outline-transparent"
		}`}
	>
		<PlacementTargetButton
			x={width / 2}
			y={height / 2}
			{mode}
			{isActive}
			{isHovered}
			interactive={false}
			zIndex={zIndex + 1}
		/>
	</div>
</div>
