<script lang="ts">
	import type { Snippet } from "svelte";

	interface Props {
		moduleId: string;
		containerElement: HTMLElement;
		padding?: number;
		sticky?: boolean;
		zIndex?: number;
		pointerEvents?: "auto" | "none";
		children: Snippet;
	}

	let {
		moduleId,
		containerElement,
		padding = 0,
		sticky = false,
		zIndex = 30,
		pointerEvents = "auto",
		children,
	}: Props = $props();

	let overlayElement: HTMLElement | undefined = $state(undefined);

	function positionOverlay() {
		if (!overlayElement || !moduleId) return;

		const moduleEl = containerElement.querySelector(
			`[data-ujl-module-id="${moduleId}"]`,
		) as HTMLElement | null;

		if (!moduleEl) {
			// Fade out when module not found
			overlayElement.style.opacity = "0";
			overlayElement.style.pointerEvents = "none";
			return;
		}

		const moduleRect = moduleEl.getBoundingClientRect();
		const containerRect = containerElement.getBoundingClientRect();
		const overlayRect = overlayElement.getBoundingClientRect();

		// Check if module is COMPLETELY out of viewport (both X and Y)
		const isModuleCompletelyOut =
			moduleRect.bottom <= containerRect.top ||
			moduleRect.top >= containerRect.bottom ||
			moduleRect.right <= containerRect.left ||
			moduleRect.left >= containerRect.right;

		// Hide overlay when module is completely out of view
		if (isModuleCompletelyOut) {
			overlayElement.style.opacity = "0";
			overlayElement.style.pointerEvents = "none";
			return;
		}

		// Get parent rect for coordinate conversion
		const parentRect = overlayElement.parentElement?.getBoundingClientRect();
		if (!parentRect) return;

		// Calculate position relative to parent
		const halfPadding = padding / 2;
		let targetTop = moduleRect.top - parentRect.top - halfPadding;
		let targetLeft = moduleRect.left - parentRect.left - halfPadding;

		// For sticky behavior (like Island), clamp to container bounds
		if (sticky) {
			const minEdgeMargin = 2;

			// Calculate ideal position (centered above module)
			const idealTop = moduleRect.top - overlayRect.height - -halfPadding;
			const idealLeft = moduleRect.left + (moduleRect.width - overlayRect.width) / 2;

			// Clamp to visible container area
			const minY = containerRect.top + minEdgeMargin;
			const maxY = containerRect.bottom - overlayRect.height - minEdgeMargin;
			const minX = containerRect.left + minEdgeMargin;
			const maxX = containerRect.right - overlayRect.width - minEdgeMargin;

			// Convert clamped viewport coordinates to parent-relative
			targetTop = Math.max(minY, Math.min(idealTop, maxY)) - parentRect.top;
			targetLeft = Math.max(minX, Math.min(idealLeft, maxX)) - parentRect.left;
		}

		overlayElement.style.opacity = "1";
		overlayElement.style.pointerEvents = pointerEvents;

		// Set transition only for opacity (not transform) for smooth scrolling
		overlayElement.style.transition = "opacity 0.2s ease-out";

		overlayElement.style.transform = `translate(${targetLeft}px, ${targetTop}px)`;

		// Only set width/height for non-sticky overlays (indicators)
		if (!sticky) {
			const targetWidth = moduleRect.width + padding;
			const targetHeight = moduleRect.height + padding;
			overlayElement.style.width = `${targetWidth}px`;
			overlayElement.style.height = `${targetHeight}px`;
		} else {
			// For sticky overlays, let content determine size
			overlayElement.style.width = "auto";
			overlayElement.style.height = "auto";
		}
	}

	// Set up scroll tracking
	$effect(() => {
		if (!overlayElement || !containerElement || !moduleId) return;

		let ticking = false;
		function onScroll() {
			if (!ticking) {
				requestAnimationFrame(() => {
					positionOverlay();
					ticking = false;
				});
				ticking = true;
			}
		}

		positionOverlay();

		containerElement.addEventListener("scroll", onScroll, { passive: true });

		// Periodic fallback for reliability
		const interval = setInterval(positionOverlay, 500);

		const resizeObserver = new ResizeObserver(positionOverlay);
		resizeObserver.observe(containerElement);

		return () => {
			containerElement.removeEventListener("scroll", onScroll);
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
