<script lang="ts">
	import { overlayPositioning } from "$lib/actions/overlay-position.js";

	interface Props {
		containerElement: HTMLElement;
		selectedModuleId?: string | null;
	}

	let { containerElement, selectedModuleId }: Props = $props();

	let hoveredModuleId: string | null = $state(null);
	let isVisible = $state(false);

	function handleMouseOver(event: MouseEvent) {
		const target = event.target as HTMLElement;
		const hoveredModule = target.closest("[data-ujl-module-id]") as HTMLElement | null;

		if (hoveredModule) {
			const moduleId = hoveredModule.getAttribute("data-ujl-module-id");
			if (moduleId && moduleId !== selectedModuleId && moduleId !== hoveredModuleId) {
				hoveredModuleId = moduleId;
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

	const actionParams = $derived({
		containerElement,
		getModuleId: () => hoveredModuleId,
		padding: 15,
		onVisibilityChange: (visible: boolean) => {
			isVisible = visible;
		},
	});

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
	class="pointer-events-none absolute top-0 left-0 z-30 rounded-md border-2 border-dashed border-[oklch(var(--editor-accent-light,var(--accent-light)))]"
	class:opacity-0={!isVisible}
	class:opacity-70={isVisible}
	style="will-change: transform, width, height, opacity;"
	data-crafter="hover-overlay"
	use:overlayPositioning={actionParams}
></div>
