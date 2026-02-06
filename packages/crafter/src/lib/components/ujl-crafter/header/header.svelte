<script lang="ts">
	import {
		Button,
		DropdownMenu,
		DropdownMenuTrigger,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuSeparator,
		Select,
		SelectTrigger,
		SelectContent,
		SelectGroup,
		SelectLabel,
		SelectItem,
		ToggleGroup,
		ToggleGroupItem,
	} from "@ujl-framework/ui";
	import { useApp } from "$lib/components/ui/app/index.js";
	import { getContext } from "svelte";
	import { CRAFTER_CONTEXT, type CrafterContext, type CrafterMode } from "$lib/stores/index.js";
	import ThreeDotsIcon from "@lucide/svelte/icons/more-vertical";
	import FolderOpenIcon from "@lucide/svelte/icons/folder-open";
	import ShareIcon from "@lucide/svelte/icons/share";
	import PencilRulerIcon from "@lucide/svelte/icons/pencil-ruler";
	import PaletteIcon from "@lucide/svelte/icons/palette";
	import MonitorIcon from "@lucide/svelte/icons/monitor";
	import TabletIcon from "@lucide/svelte/icons/tablet";
	import SmartphoneIcon from "@lucide/svelte/icons/smartphone";
	import Settings2Icon from "@lucide/svelte/icons/settings-2";
	import MaximizeIcon from "@lucide/svelte/icons/maximize";
	import MinimizeIcon from "@lucide/svelte/icons/minimize";

	let {
		mode,
		onModeChange,
		viewportType,
		onViewportTypeChange,
		onSave,
		onImportTheme,
		onImportContent,
		onExportTheme,
		onExportContent,
	}: {
		mode: CrafterMode;
		onModeChange?: (mode: CrafterMode) => void;
		viewportType?: string | undefined;
		onViewportTypeChange?: (type: string | undefined) => void;
		onSave?: () => void;
		onImportTheme?: (file: File) => void;
		onImportContent?: (file: File) => void;
		onExportTheme?: () => void;
		onExportContent?: () => void;
	} = $props();

	const app = useApp();
	const store = getContext<CrafterContext>(CRAFTER_CONTEXT);

	let themeFileInput: HTMLInputElement | null = $state(null);
	let contentFileInput: HTMLInputElement | null = $state(null);

	function handleModeChange(newMode: string | undefined) {
		if (newMode === "editor" || newMode === "designer") {
			onModeChange?.(newMode);
		}
	}

	function handleThemeFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file && onImportTheme) {
			onImportTheme(file);
			target.value = "";
		}
	}

	function handleContentFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file && onImportContent) {
			onImportContent(file);
			target.value = "";
		}
	}
</script>

<input
	type="file"
	accept=".ujlt.json,application/json"
	bind:this={themeFileInput}
	onchange={handleThemeFileSelect}
	class="hidden"
/>
<input
	type="file"
	accept=".ujlc.json,application/json"
	bind:this={contentFileInput}
	onchange={handleContentFileSelect}
	class="hidden"
/>

<div class="flex items-center justify-between py-2">
	<div class="flex items-center gap-2">
		<Select type="single" value={mode} onValueChange={handleModeChange}>
			<SelectTrigger class="w-[150px]" data-crafter="mode-selector">
				{#if mode === "editor"}
					<PencilRulerIcon />
					<span>Editor</span>
				{:else}
					<PaletteIcon />
					<span>Designer</span>
				{/if}
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectLabel>Mode</SelectLabel>
					<SelectItem value="editor">
						<PencilRulerIcon />
						<span>Editor</span>
					</SelectItem>
					<SelectItem value="designer">
						<PaletteIcon />
						<span>Designer</span>
					</SelectItem>
				</SelectGroup>
			</SelectContent>
		</Select>

		<ToggleGroup
			type="single"
			value={viewportType}
			onValueChange={(value) => onViewportTypeChange?.(value)}
			data-crafter="viewport-toggles"
		>
			<ToggleGroupItem value="desktop" title="Desktop View (1024px)">
				<MonitorIcon />
			</ToggleGroupItem>
			<ToggleGroupItem value="tablet" title="Tablet View (768px)">
				<TabletIcon class="-rotate-90" />
			</ToggleGroupItem>
			<ToggleGroupItem value="mobile" title="Mobile View (375px)">
				<SmartphoneIcon />
			</ToggleGroupItem>
		</ToggleGroup>
	</div>

	<div class="flex items-center gap-2">
		{#if onSave}
			<Button variant="accent" size="sm" onclick={() => onSave()}>Save</Button>
		{/if}
		<DropdownMenu>
			<DropdownMenuTrigger>
				{#snippet child({ props })}
					<Button variant="ghost" size="icon" class="size-8" {...props} title="More Actions">
						<ThreeDotsIcon />
					</Button>
				{/snippet}
			</DropdownMenuTrigger>
			<DropdownMenuContent class="w-56">
				{#if onImportTheme || onImportContent}
					{#if onImportTheme}
						<DropdownMenuItem
							title="Import a .ujlt.json file"
							onclick={() => themeFileInput?.click()}
						>
							<FolderOpenIcon class="mr-2 size-4" />
							<span>Import Theme</span>
						</DropdownMenuItem>
					{/if}
					{#if onImportContent}
						<DropdownMenuItem
							title="Import a .ujlc.json file"
							onclick={() => contentFileInput?.click()}
						>
							<FolderOpenIcon class="mr-2 size-4" />
							<span>Import Content</span>
						</DropdownMenuItem>
					{/if}
					{#if (onImportTheme || onImportContent) && (onExportTheme || onExportContent)}
						<DropdownMenuSeparator />
					{/if}
				{/if}
				{#if onExportTheme}
					<DropdownMenuItem title="Get the .ujlt.json file" onclick={() => onExportTheme()}>
						<ShareIcon class="mr-2 size-4" />
						<span>Export Theme</span>
					</DropdownMenuItem>
				{/if}
				{#if onExportContent}
					<DropdownMenuItem title="Get the .ujlc.json file" onclick={() => onExportContent()}>
						<ShareIcon class="mr-2 size-4" />
						<span>Export Content</span>
					</DropdownMenuItem>
				{/if}
			</DropdownMenuContent>
		</DropdownMenu>
		{#if store.shouldShowFullscreenButton}
			<Button
				variant="ghost"
				size="icon"
				onclick={() => store.toggleFullscreen()}
				title={store.isFullscreen ? "Exit fullscreen (ESC)" : "Enter fullscreen"}
			>
				{#if store.isFullscreen}
					<MinimizeIcon />
				{:else}
					<MaximizeIcon />
				{/if}
			</Button>
		{/if}
		<Button
			onclick={() => app.togglePanel()}
			variant={app.isPanelVisible ? "muted" : "ghost"}
			size="icon"
		>
			<Settings2Icon />
		</Button>
	</div>
</div>
