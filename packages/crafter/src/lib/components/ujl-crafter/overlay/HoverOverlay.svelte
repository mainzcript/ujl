<script lang="ts">
	interface Props {
		containerElement: HTMLElement;
		selectedModuleId?: string | null;
	}

	let { containerElement, selectedModuleId }: Props = $props();

	let overlayElement: HTMLElement | undefined = $state(undefined);
	let hoveredModuleId: string | null = $state(null);
	let isVisible = $state(false);

	function updatePosition() {
		if (!overlayElement || !hoveredModuleId) {
			isVisible = false;
			return;
		}

		const moduleEl = containerElement.querySelector(
			`[data-ujl-module-id="${hoveredModuleId}"]`,
		) as HTMLElement | null;

		if (!moduleEl) {
			isVisible = false;
			return;
		}

		const moduleRect = moduleEl.getBoundingClientRect();
		const containerRect = containerElement.getBoundingClientRect();

		// Check visibility
		const isModuleVisible =
			moduleRect.top < containerRect.bottom &&
			moduleRect.bottom > containerRect.top &&
			moduleRect.left < containerRect.right &&
			moduleRect.right > containerRect.left;

		if (!isModuleVisible) {
			isVisible = false;
			return;
		}

		// Calculate position with padding
		const padding = 15;
		const targetTop = moduleRect.top - containerRect.top + containerElement.scrollTop - padding / 2;
		const targetLeft =
			moduleRect.left - containerRect.left + containerElement.scrollLeft - padding / 2;
		const targetWidth = moduleRect.width + padding;
		const targetHeight = moduleRect.height + padding;

		// Direct DOM update - no delays
		overlayElement.style.transform = `translate(${targetLeft}px, ${targetTop}px)`;
		overlayElement.style.width = `${targetWidth}px`;
		overlayElement.style.height = `${targetHeight}px`;
		isVisible = true;
	}

	function handleMouseOver(event: MouseEvent) {
		const target = event.target as HTMLElement;
		const hoveredModule = target.closest("[data-ujl-module-id]") as HTMLElement | null;

		if (hoveredModule) {
			const moduleId = hoveredModule.getAttribute("data-ujl-module-id");
			if (moduleId && moduleId !== selectedModuleId && moduleId !== hoveredModuleId) {
				hoveredModuleId = moduleId;
				// Immediate update - don't wait for next tick
				requestAnimationFrame(updatePosition);
			}
		}
	}

	function handleMouseOut(event: MouseEvent) {
		const target = event.target as HTMLElement;
		const relatedTarget = event.relatedTarget as HTMLElement | null;

		const hoveredModule = target.closest("[data-ujl-module-id]") as HTMLElement | null;
		if (!hoveredModule) return;

		const enteringModule = relatedTarget?.closest("[data-ujl-module-id]") as HTMLElement | null;
		const currentModuleId = hoveredModule.getAttribute("data-ujl-module-id");

		if (enteringModule?.getAttribute("data-ujl-module-id") !== currentModuleId) {
			hoveredModuleId = null;
			isVisible = false;
		}
	}

	// Track scroll while hovering
	$effect(() => {
		if (!containerElement || !hoveredModuleId) return;

		let ticking = false;
		function onScroll() {
			if (!ticking) {
				requestAnimationFrame(() => {
					updatePosition();
					ticking = false;
				});
				ticking = true;
			}
		}

		containerElement.addEventListener("scroll", onScroll, { passive: true });
		const resizeObserver = new ResizeObserver(updatePosition);
		resizeObserver.observe(containerElement);

		return () => {
			containerElement.removeEventListener("scroll", onScroll);
			resizeObserver.disconnect();
		};
	});

	// Set up mouse event listeners on container
	$effect(() => {
		if (!containerElement) return;

		containerElement.addEventListener("mouseover", handleMouseOver);
		containerElement.addEventListener("mouseout", handleMouseOut);

		return () => {
			containerElement.removeEventListener("mouseover", handleMouseOver);
			containerElement.removeEventListener("mouseout", handleMouseOut);
		};
	});
</script>

<div
	bind:this={overlayElement}
	class="pointer-events-none absolute top-0 left-0 z-30 rounded-md border-2 border-dashed border-[oklch(var(--editor-accent-light,var(--accent-light)))]"
	class:opacity-0={!isVisible}
	class:opacity-70={isVisible}
	style="will-change: transform, width, height, opacity;"
	data-crafter="hover-overlay"
></div>
