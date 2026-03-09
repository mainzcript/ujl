<script lang="ts">
	import { overlayPositioning } from "$lib/actions/overlay-position.js";

	interface Props {
		variant: "selection" | "hover";
		moduleId: string | null;
		containerElement: HTMLElement;
	}

	let { variant, moduleId, containerElement }: Props = $props();

	let isVisible = $state(false);

	// Variant-specific classes
	const overlayClasses = $derived(
		variant === "selection"
			? "border-2 border-[oklch(var(--editor-accent-light,var(--accent-light)))]"
			: "border-2 border-dashed border-[oklch(var(--editor-accent-light,var(--accent-light)))]",
	);

	const visibilityClasses = $derived(
		variant === "selection"
			? isVisible
				? "opacity-100"
				: "opacity-0"
			: isVisible
				? "opacity-70"
				: "opacity-0",
	);

	const zIndexClass = $derived(variant === "selection" ? "z-40" : "z-30");

	const actionParams = $derived({
		containerElement,
		getModuleId: () => moduleId,
		padding: 15,
		onVisibilityChange: (visible: boolean) => {
			isVisible = visible;
		},
	});
</script>

{#if moduleId}
	<div
		class="pointer-events-none absolute top-0 left-0 rounded-md {zIndexClass} {overlayClasses} {visibilityClasses}"
		style="will-change: transform, width, height, opacity;"
		data-crafter="module-overlay"
		data-variant={variant}
		data-module-id={moduleId}
		use:overlayPositioning={actionParams}
	></div>
{/if}
