<script lang="ts">
	import OverlayBase from "./OverlayBase.svelte";
	import { getHoverTargetContext } from "$lib/stores/index.js";

	interface Props {
		containerElement: HTMLElement;
		selectedModuleId?: string | null;
	}

	let { containerElement, selectedModuleId }: Props = $props();
	const hoverTargets = getHoverTargetContext();

	let hoveredModuleId: string | null = $state(null);
	let isVisible = $state(false);

	function isQuickActionElement(element: HTMLElement | null) {
		return !!element?.closest('[data-crafter="module-quick-actions"]');
	}

	function handleMouseOver(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (isQuickActionElement(target)) return;

		const hoveredModule = target.closest("[data-ujl-module-id]") as HTMLElement | null;

		if (hoveredModule) {
			const moduleId = hoveredModule.getAttribute("data-ujl-module-id");
			if (moduleId && moduleId !== selectedModuleId && moduleId !== hoveredModuleId) {
				hoveredModuleId = moduleId;
				isVisible = true;
			}
		}
	}

	function handleMouseOut(event: MouseEvent) {
		const target = event.target as HTMLElement;
		const relatedTarget = event.relatedTarget as HTMLElement | null;

		if (isQuickActionElement(target)) {
			const enteringModule = relatedTarget?.closest("[data-ujl-module-id]") as HTMLElement | null;
			if (!isQuickActionElement(relatedTarget) && !enteringModule) {
				hoveredModuleId = null;
				isVisible = false;
			}
			return;
		}

		const hoveredModule = target.closest("[data-ujl-module-id]") as HTMLElement | null;
		if (!hoveredModule) return;

		const enteringModule = relatedTarget?.closest("[data-ujl-module-id]") as HTMLElement | null;
		const currentModuleId = hoveredModule.getAttribute("data-ujl-module-id");

		if (isQuickActionElement(relatedTarget)) {
			return;
		}

		if (enteringModule?.getAttribute("data-ujl-module-id") !== currentModuleId) {
			hoveredModuleId = null;
			isVisible = false;
		}
	}

	function handleMouseLeave() {
		hoveredModuleId = null;
		isVisible = false;
	}

	$effect(() => {
		hoverTargets.setHoveredModuleId(isVisible ? hoveredModuleId : null);
	});

	$effect(() => {
		if (!containerElement) return;

		containerElement.addEventListener("mouseover", handleMouseOver);
		containerElement.addEventListener("mouseout", handleMouseOut);
		containerElement.addEventListener("mouseleave", handleMouseLeave);

		return () => {
			containerElement.removeEventListener("mouseover", handleMouseOver);
			containerElement.removeEventListener("mouseout", handleMouseOut);
			containerElement.removeEventListener("mouseleave", handleMouseLeave);
		};
	});
</script>

{#if hoveredModuleId && isVisible}
	<OverlayBase
		moduleId={hoveredModuleId}
		{containerElement}
		padding={15}
		sticky={false}
		zIndex={30}
		pointerEvents="none"
	>
		<div
			class="pointer-events-none h-full w-full rounded-md border-2 border-dashed border-[oklch(var(--editor-accent-light,var(--accent-light)))] opacity-70"
			data-crafter="hover-indicator"
		></div>
	</OverlayBase>
{/if}
