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
		top: number;
		left: number;
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
		top,
		left,
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

	// Dropdown state for closing after action
	let dropdownOpen = $state(false);

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

	// Wrapper functions that close dropdown after action
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
	class="absolute z-[50] flex items-center gap-1 rounded-lg border border-sidebar-border bg-sidebar px-2 py-1.5 shadow-lg"
	style="top: {top}px; left: {left}px;"
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
