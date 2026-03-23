<script lang="ts">
	import { onDestroy } from "svelte";
	import { Settings, ChevronUp, ChevronDown, EllipsisVertical, Move } from "@lucide/svelte";
	import {
		Button,
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuTrigger,
	} from "@ujl-framework/ui";
	import type { InsertRequest } from "$lib/stores/features/clipboard.js";
	import { useApp } from "$lib/components/ui/app/context.svelte.js";
	import { getCanvasDragContext } from "$lib/stores/index.js";
	import { ModuleActions } from "$lib/components/ui/module-actions/index.js";
	import OverlayBase from "./OverlayBase.svelte";

	interface Props {
		moduleId: string;
		containerElement: HTMLElement;
		dragDisplayName: string;
		dragIconSvg?: string | null;
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
		onDragDrop: (request: InsertRequest) => void;
		canCopy?: boolean;
		canCut?: boolean;
		canPaste?: boolean;
		canInsert?: boolean;
	}

	let {
		moduleId,
		containerElement,
		dragDisplayName,
		dragIconSvg = null,
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
		onDragDrop,
		canCopy = true,
		canCut = true,
		canPaste = true,
		canInsert = true,
	}: Props = $props();

	const app = useApp();
	const canvasDrag = getCanvasDragContext();
	const showSettingsButton = $derived(!app.isDesktopPanel);
	const isSettingsDisabled = $derived(app.isPanelVisible);
	const isDragging = $derived(canvasDrag.isDragging && canvasDrag.draggedModuleId === moduleId);

	// Dropdown state for closing after action
	let dropdownOpen = $state(false);
	let dragHandleElement: HTMLElement | null = $state(null);
	let activePointerId = $state<number | null>(null);

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

	function stopClick(event: Event) {
		event.preventDefault();
		event.stopPropagation();
	}

	function handleDragPointerDown(event: PointerEvent) {
		event.preventDefault();
		event.stopPropagation();

		activePointerId = event.pointerId;
		dragHandleElement?.setPointerCapture(event.pointerId);
		canvasDrag.startDrag(
			moduleId,
			event.pointerId,
			{
				clientX: event.clientX,
				clientY: event.clientY,
			},
			{
				dragDisplayName,
				dragIconSvg,
			},
		);
	}

	function handleDragPointerMove(event: PointerEvent) {
		if (activePointerId !== event.pointerId) return;

		event.preventDefault();
		event.stopPropagation();
		canvasDrag.updatePointer({
			clientX: event.clientX,
			clientY: event.clientY,
		});
	}

	function releaseDragPointer(pointerId: number) {
		if (dragHandleElement?.hasPointerCapture(pointerId)) {
			dragHandleElement.releasePointerCapture(pointerId);
		}
	}

	function cancelActiveDrag() {
		const pointerId = activePointerId;
		activePointerId = null;

		if (pointerId !== null) {
			releaseDragPointer(pointerId);
		}

		canvasDrag.cancelDrag();
	}

	function handleDragPointerUp(event: PointerEvent) {
		if (activePointerId !== event.pointerId) return;

		event.preventDefault();
		event.stopPropagation();

		const result = canvasDrag.endDrag();
		const pointerId = activePointerId;
		activePointerId = null;
		releaseDragPointer(pointerId);

		if (result.draggedModuleId === moduleId && result.activeDropRequest) {
			onDragDrop(result.activeDropRequest);
		}
	}

	function handleDragPointerCancel(event: PointerEvent) {
		if (activePointerId !== event.pointerId) return;

		event.preventDefault();
		event.stopPropagation();

		cancelActiveDrag();
	}

	function handleLostPointerCapture() {
		if (activePointerId === null) return;

		cancelActiveDrag();
	}

	$effect(() => {
		if (typeof window === "undefined" || !isDragging) {
			return;
		}

		const handleWindowKeyDown = (event: KeyboardEvent) => {
			if (event.key !== "Escape" || !isDragging) {
				return;
			}

			event.preventDefault();
			event.stopImmediatePropagation();
			cancelActiveDrag();
		};

		window.addEventListener("keydown", handleWindowKeyDown, true);

		return () => {
			window.removeEventListener("keydown", handleWindowKeyDown, true);
		};
	});

	$effect(() => {
		const moduleElement = containerElement.querySelector(
			`[data-ujl-module-id="${moduleId}"]`,
		) as HTMLElement | null;

		if (!moduleElement) {
			return;
		}

		if (isDragging) {
			moduleElement.setAttribute("data-crafter-dragging-source", "true");
		} else {
			moduleElement.removeAttribute("data-crafter-dragging-source");
		}

		return () => {
			moduleElement.removeAttribute("data-crafter-dragging-source");
		};
	});

	onDestroy(() => {
		if (
			activePointerId !== null ||
			(canvasDrag.isDragging && canvasDrag.draggedModuleId === moduleId)
		) {
			cancelActiveDrag();
		}
	});
</script>

<OverlayBase {moduleId} {containerElement} sticky={true} zIndex={50}>
	<div
		class="flex items-center gap-1 rounded-2xl border-2 border-[oklch(var(--editor-accent-light,var(--accent-light)))] bg-sidebar px-2 py-1 shadow-lg transition-all duration-150 {isDragging
			? 'scale-[1.02] bg-sidebar/95 shadow-2xl ring-2 ring-[oklch(var(--editor-accent-light,var(--accent-light)))]/40'
			: ''}"
		data-crafter="module-action-bar"
		data-dragging={isDragging ? "true" : "false"}
	>
		<Button
			bind:ref={dragHandleElement}
			variant="ghost"
			size="icon"
			class="h-6 w-6 touch-none {isDragging ? 'cursor-grabbing' : 'cursor-grab'}"
			data-crafter="module-drag-handle"
			title="Drag module"
			onpointerdown={handleDragPointerDown}
			onpointermove={handleDragPointerMove}
			onpointerup={handleDragPointerUp}
			onpointercancel={handleDragPointerCancel}
			onlostpointercapture={handleLostPointerCapture}
			onclick={stopClick}
		>
			<Move class="h-3.5 w-3.5" />
		</Button>

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
</OverlayBase>

<style>
	:global([data-crafter-dragging-source="true"]) {
		opacity: 0.72;
		transition: opacity 150ms ease-out;
	}
</style>
