<script lang="ts">
	import { Move } from "@lucide/svelte";
	import { getCanvasDragContext, getScrollContext } from "$lib/stores/index.js";

	interface Props {
		containerElement: HTMLElement | null;
	}

	const POINTER_OFFSET_X = 18;
	const POINTER_OFFSET_Y = 18;
	const MAX_GHOST_WIDTH = 220;
	const MAX_GHOST_HEIGHT = 56;
	const EDGE_PADDING = 8;

	let { containerElement }: Props = $props();

	const canvasDrag = getCanvasDragContext();
	const scrollContext = getScrollContext();

	const ghostPosition = $derived.by(() => {
		const { x: scrollX, y: scrollY } = scrollContext.position;
		void scrollX;
		void scrollY;

		if (!containerElement || !canvasDrag.pointer || !canvasDrag.dragDisplayName) {
			return null;
		}

		const containerRect = containerElement.getBoundingClientRect();
		const unconstrainedX = canvasDrag.pointer.clientX - containerRect.left + POINTER_OFFSET_X;
		const unconstrainedY = canvasDrag.pointer.clientY - containerRect.top + POINTER_OFFSET_Y;

		const maxX = Math.max(EDGE_PADDING, containerRect.width - MAX_GHOST_WIDTH - EDGE_PADDING);
		const maxY = Math.max(EDGE_PADDING, containerRect.height - MAX_GHOST_HEIGHT - EDGE_PADDING);

		return {
			x: Math.min(Math.max(EDGE_PADDING, unconstrainedX), maxX),
			y: Math.min(Math.max(EDGE_PADDING, unconstrainedY), maxY),
		};
	});
</script>

{#if canvasDrag.isDragging && ghostPosition}
	<div
		class="pointer-events-none absolute top-0 left-0 z-[70]"
		style={`transform: translate(${ghostPosition.x}px, ${ghostPosition.y}px);`}
		data-crafter="canvas-drag-ghost"
		data-dragging-module-id={canvasDrag.draggedModuleId ?? undefined}
	>
		<div
			class="flex max-w-[220px] items-center gap-2 rounded-full border border-[oklch(var(--editor-accent-light,var(--accent-light)))] bg-sidebar/95 p-1 shadow-2xl ring-1 ring-black/5 backdrop-blur-sm"
		>
			<div
				class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[oklch(var(--editor-accent-light,var(--accent-light)))]/15 text-[oklch(var(--editor-accent-dark,var(--accent-dark)))] [&_svg]:h-3.5 [&_svg]:w-3.5"
			>
				{#if canvasDrag.dragIconSvg}
					<!-- SVG strings come from trusted module definitions -->
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html canvasDrag.dragIconSvg}
				{:else}
					<Move class="h-3.5 w-3.5" />
				{/if}
			</div>

			<div class="min-w-0 truncate pe-2 text-xs font-medium text-foreground">
				{canvasDrag.dragDisplayName}
			</div>
		</div>
	</div>
{/if}
