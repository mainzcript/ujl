<script lang="ts">
	import { fade } from "svelte/transition";
	import { Button } from "@ujl-framework/ui";
	import PlusIcon from "@lucide/svelte/icons/plus";

	interface Props {
		x: number;
		y: number;
		onInsert?: (() => void) | null;
		mode?: "insert" | "drop";
		isActive?: boolean;
		zIndex?: number;
	}

	let { x, y, onInsert = null, mode = "insert", isActive = false, zIndex = 45 }: Props = $props();
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
>
	<div
		class="flex -translate-x-1/2 -translate-y-1/2 items-center rounded-2xl border-2 border-dotted border-[oklch(var(--editor-accent-light,var(--accent-light)))] bg-sidebar shadow-lg transition-[transform,box-shadow,opacity] duration-75"
		class:scale-110={isActive}
		class:shadow-xl={isActive}
	>
		<Button
			variant="ghost"
			size="icon"
			class="h-6 w-6"
			disabled={mode === "drop"}
			onclick={onInsert ?? undefined}
			title={mode === "drop" ? "Drop module here" : "Insert module"}
		>
			<PlusIcon class="h-3.5 w-3.5" />
		</Button>
	</div>
</div>
