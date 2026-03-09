<script lang="ts">
	import { Settings, ChevronUp, ChevronDown, EllipsisVertical } from "@lucide/svelte";
	import {
		Button,
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuTrigger,
	} from "@ujl-framework/ui";
	import { useApp } from "../ui/app/context.svelte.js";
	import { ModuleActions } from "../ui/module-actions/index.js";

	interface Props {
		moduleId: string;
		containerElement: HTMLElement;
		canMoveUp: boolean;
		canMoveDown: boolean;
		onSelect: () => void;
		onMoveUp: () => void;
		onMoveDown: () => void;
		onCopy: () => void;
		onCut: () => void;
		onPaste: () => void;
		onDelete: () => void;
		onInsert: () => void;
		canCopy?: boolean;
		canCut?: boolean;
		canPaste?: boolean;
		canInsert?: boolean;
	}

	let {
		moduleId,
		containerElement,
		canMoveUp,
		canMoveDown,
		onSelect,
		onMoveUp,
		onMoveDown,
		onCopy,
		onCut,
		onPaste,
		onDelete,
		onInsert,
		canCopy = true,
		canCut = true,
		canPaste = true,
		canInsert = true,
	}: Props = $props();

	const app = useApp();
	const showSettingsButton = $derived(!app.isDesktopPanel);
	const isSettingsDisabled = $derived(app.isPanelVisible);

	// Island element reference
	let islandElement: HTMLElement | undefined = $state(undefined);

	// Dropdown state for closing after action
	let dropdownOpen = $state(false);

	function positionIsland() {
		if (!islandElement) return;

		// Find module in the scrolled container
		const moduleEl = containerElement.querySelector(
			`[data-ujl-module-id="${moduleId}"]`,
		) as HTMLElement | null;

		if (!moduleEl) {
			// Fade out when module not found
			islandElement.style.opacity = "0";
			islandElement.style.pointerEvents = "none";
			return;
		}

		// Get rects
		const moduleRect = moduleEl.getBoundingClientRect();
		const containerRect = containerElement.getBoundingClientRect();
		const islandRect = islandElement.getBoundingClientRect();

		const margin = -5;
		const minEdgeMargin = 8;

		// Check if module is COMPLETELY out of viewport
		const isModuleCompletelyOut =
			moduleRect.bottom <= containerRect.top || moduleRect.top >= containerRect.bottom;

		// Hide island when module is completely out of view
		// With transition on opacity, this will fade out smoothly
		if (isModuleCompletelyOut) {
			islandElement.style.opacity = "0";
			islandElement.style.pointerEvents = "none";
			return;
		}

		// IDEAL position: directly above the module (in viewport coordinates)
		let idealTop = moduleRect.top - islandRect.height - margin;
		let idealLeft = moduleRect.left + (moduleRect.width - islandRect.width) / 2;

		// CLAMP to visible container area (the "sticky" behavior)
		// Min Y: if module is scrolled up, island sticks to top of container
		const minY = containerRect.top + minEdgeMargin;
		// Max Y: if module is scrolled down, island sticks to module top (over the module)
		const maxY = containerRect.bottom - islandRect.height - minEdgeMargin;

		let finalTop = Math.max(minY, Math.min(idealTop, maxY));

		// Clamp X horizontally to container bounds
		const minX = containerRect.left + minEdgeMargin;
		const maxX = containerRect.right - islandRect.width - minEdgeMargin;
		let finalLeft = Math.max(minX, Math.min(idealLeft, maxX));

		// Convert to Preview-relative coordinates (where the Island actually lives)
		// The Island is inside the Preview div, which moves with the scroll
		// But we calculated in viewport coordinates, so subtract container's offset
		const previewRect = islandElement.parentElement?.getBoundingClientRect();
		if (!previewRect) return;

		let targetTop = finalTop - previewRect.top;
		let targetLeft = finalLeft - previewRect.left;

		// Ensure island is visible
		islandElement.style.opacity = "1";
		islandElement.style.pointerEvents = "auto";

		// Set transition only for opacity (not transform) for butter-smooth scrolling
		// Transform updates immediately (no transition), opacity fades smoothly
		islandElement.style.transition = "opacity 0.2s ease-out";

		// Update position immediately (no transition lag)
		islandElement.style.transform = `translate(${targetLeft}px, ${targetTop}px)`;
	}

	// Set up scroll tracking
	$effect(() => {
		if (!islandElement || !containerElement || !moduleId) return;

		let ticking = false;
		function onScroll() {
			if (!ticking) {
				requestAnimationFrame(() => {
					positionIsland();
					ticking = false;
				});
				ticking = true;
			}
		}

		// Initial position
		positionIsland();

		// Add scroll listener to actual scroll container
		containerElement.addEventListener("scroll", onScroll, { passive: true });

		// Periodic fallback
		const interval = setInterval(positionIsland, 500);

		// Handle resize
		const resizeObserver = new ResizeObserver(positionIsland);
		resizeObserver.observe(containerElement);

		return () => {
			containerElement.removeEventListener("scroll", onScroll);
			clearInterval(interval);
			resizeObserver.disconnect();
		};
	});

	function handleSettings() {
		app.requirePanel();
		onSelect();
	}

	function handleMoveUp(e: Event) {
		e.stopPropagation();
		onMoveUp();
	}

	function handleMoveDown(e: Event) {
		e.stopPropagation();
		onMoveDown();
	}

	function handleCopy() {
		onCopy();
		dropdownOpen = false;
	}

	function handleCut() {
		onCut();
		dropdownOpen = false;
	}

	function handlePaste() {
		onPaste();
		dropdownOpen = false;
	}

	function handleDelete() {
		onDelete();
		dropdownOpen = false;
	}

	function handleInsert() {
		onInsert();
		dropdownOpen = false;
	}
</script>

<div
	bind:this={islandElement}
	class="absolute top-0 left-0 z-50 flex items-center gap-1 rounded-lg border-2 border-[oklch(var(--editor-accent-light,var(--accent-light)))] bg-sidebar px-2 py-1.5 shadow-lg"
	style="opacity: 0; pointer-events: none; will-change: opacity;"
	data-crafter="module-island"
>
	{#if showSettingsButton}
		<Button
			variant="ghost"
			size="icon"
			class="h-6 w-6 {isSettingsDisabled ? 'opacity-50' : ''}"
			disabled={isSettingsDisabled}
			onclick={handleSettings}
			title={isSettingsDisabled ? "Panel already open" : "Show panel"}
		>
			<Settings class="h-3.5 w-3.5" />
		</Button>
	{/if}

	<Button
		variant="ghost"
		size="icon"
		class="h-6 w-6"
		disabled={!canMoveUp}
		onclick={handleMoveUp}
		title="Move up"
	>
		<ChevronUp class="h-3.5 w-3.5" />
	</Button>

	<Button
		variant="ghost"
		size="icon"
		class="h-6 w-6"
		disabled={!canMoveDown}
		onclick={handleMoveDown}
		title="Move down"
	>
		<ChevronDown class="h-3.5 w-3.5" />
	</Button>

	<DropdownMenu bind:open={dropdownOpen}>
		<DropdownMenuTrigger>
			{#snippet child({ props })}
				<Button {...props} variant="ghost" size="icon" class="h-6 w-6" title="More actions">
					<EllipsisVertical class="h-3.5 w-3.5" />
				</Button>
			{/snippet}
		</DropdownMenuTrigger>
		<DropdownMenuContent align="end">
			<ModuleActions
				onCopy={handleCopy}
				onCut={handleCut}
				onPaste={handlePaste}
				onDelete={handleDelete}
				onInsert={handleInsert}
				{canCopy}
				{canCut}
				{canPaste}
				{canInsert}
				canDelete={true}
			/>
		</DropdownMenuContent>
	</DropdownMenu>
</div>
