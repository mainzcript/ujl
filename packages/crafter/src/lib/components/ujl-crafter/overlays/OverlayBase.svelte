<script lang="ts">
	import type { Snippet } from "svelte";
	import { getScrollContext } from "$lib/stores/index.js";

	interface Props {
		moduleId: string;
		slot?: string;
		containerElement: HTMLElement;
		padding?: number;
		sticky?: boolean;
		zIndex?: number;
		pointerEvents?: "auto" | "none";
		children: Snippet;
	}

	let {
		moduleId,
		slot,
		containerElement,
		padding = 0,
		sticky = false,
		zIndex = 30,
		pointerEvents = "auto",
		children,
	}: Props = $props();

	const scrollContext = getScrollContext();

	let overlayElement: HTMLElement | undefined = $state(undefined);

	function positionOverlay() {
		if (!overlayElement || !moduleId) return;

		let targetEl: HTMLElement | null;

		if (slot) {
			// Resolve the slot element on the module itself or on a nested child.
			targetEl = containerElement.querySelector(
				`[data-ujl-module-id="${moduleId}"][data-ujl-slot="${slot}"]`,
			) as HTMLElement | null;

			if (!targetEl) {
				targetEl = containerElement.querySelector(
					`[data-ujl-module-id="${moduleId}"] [data-ujl-slot="${slot}"]`,
				) as HTMLElement | null;
			}
		} else {
			targetEl = containerElement.querySelector(
				`[data-ujl-module-id="${moduleId}"]`,
			) as HTMLElement | null;
		}

		if (!targetEl) {
			overlayElement.style.opacity = "0";
			overlayElement.style.pointerEvents = "none";
			return;
		}

		const targetRect = targetEl.getBoundingClientRect();
		const containerRect = containerElement.getBoundingClientRect();
		const overlayRect = overlayElement.getBoundingClientRect();

		const isTargetCompletelyOut =
			targetRect.bottom <= containerRect.top ||
			targetRect.top >= containerRect.bottom ||
			targetRect.right <= containerRect.left ||
			targetRect.left >= containerRect.right;

		if (isTargetCompletelyOut) {
			overlayElement.style.opacity = "0";
			overlayElement.style.pointerEvents = "none";
			return;
		}

		const parentRect = overlayElement.parentElement?.getBoundingClientRect();
		if (!parentRect) return;

		const halfPadding = padding / 2;
		let targetTop = targetRect.top - parentRect.top - halfPadding;
		let targetLeft = targetRect.left - parentRect.left - halfPadding;

		if (sticky) {
			const minEdgeMargin = 2;
			const idealTop = targetRect.top - overlayRect.height - -halfPadding;
			const idealLeft = targetRect.left + (targetRect.width - overlayRect.width) / 2;

			const minY = containerRect.top + minEdgeMargin;
			const maxY = containerRect.bottom - overlayRect.height - minEdgeMargin;
			const minX = containerRect.left + minEdgeMargin;
			const maxX = containerRect.right - overlayRect.width - minEdgeMargin;

			targetTop = Math.max(minY, Math.min(idealTop, maxY)) - parentRect.top;
			targetLeft = Math.max(minX, Math.min(idealLeft, maxX)) - parentRect.left;
		}

		overlayElement.style.opacity = "1";
		overlayElement.style.pointerEvents = pointerEvents;

		// Set transition only for opacity (not transform) for smooth scrolling
		overlayElement.style.transition = "opacity 0.2s ease-out";

		overlayElement.style.transform = `translate(${targetLeft}px, ${targetTop}px)`;

		if (!sticky) {
			const targetWidth = targetRect.width + padding;
			const targetHeight = targetRect.height + padding;
			overlayElement.style.width = `${targetWidth}px`;
			overlayElement.style.height = `${targetHeight}px`;
		} else {
			overlayElement.style.width = "auto";
			overlayElement.style.height = "auto";
		}
	}

	$effect(() => {
		if (!overlayElement || !containerElement || !moduleId) return;
		positionOverlay();
		const unregister = scrollContext.register(() => {
			positionOverlay();
		});

		const interval = setInterval(positionOverlay, 500);

		const resizeObserver = new ResizeObserver(positionOverlay);
		resizeObserver.observe(containerElement);

		return () => {
			unregister();
			clearInterval(interval);
			resizeObserver.disconnect();
		};
	});

	$effect(() => {
		if (moduleId && overlayElement) {
			requestAnimationFrame(positionOverlay);
		}
	});
</script>

<div
	bind:this={overlayElement}
	class="absolute top-0 left-0"
	style="opacity: 0; pointer-events: none; will-change: opacity, transform; z-index: {zIndex};"
	data-crafter="overlay-base"
	data-module-id={moduleId}
>
	{@render children()}
</div>
