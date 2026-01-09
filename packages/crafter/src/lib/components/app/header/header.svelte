<script lang="ts">
	import {
		SidebarTrigger,
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
		ToggleGroupItem
	} from '@ujl-framework/ui';
	import type { CrafterMode } from '../types.js';
	import Maximize2Icon from '@lucide/svelte/icons/maximize-2';
	import ThreeDotsIcon from '@lucide/svelte/icons/more-vertical';
	import FolderOpenIcon from '@lucide/svelte/icons/folder-open';
	import ShareIcon from '@lucide/svelte/icons/share';
	import PencilRulerIcon from '@lucide/svelte/icons/pencil-ruler';
	import PaletteIcon from '@lucide/svelte/icons/palette';
	import MonitorIcon from '@lucide/svelte/icons/monitor';
	import TabletIcon from '@lucide/svelte/icons/tablet';
	import SmartphoneIcon from '@lucide/svelte/icons/smartphone';
	import PanelRightIcon from '@lucide/svelte/icons/panel-right';

	let {
		mode,
		onModeChange,
		viewportSizeString,
		onViewportSizeChange,
		showRightSidebar = false,
		onOpenRightSheet,
		onSave,
		onImportTheme,
		onImportContent,
		onExportTheme,
		onExportContent
	}: {
		mode: CrafterMode;
		onModeChange?: (mode: CrafterMode) => void;
		viewportSizeString?: string;
		onViewportSizeChange?: (size: string | undefined) => void;
		showRightSidebar?: boolean;
		onOpenRightSheet?: () => void;
		onSave?: () => void;
		onImportTheme?: (file: File) => void;
		onImportContent?: (file: File) => void;
		onExportTheme?: () => void;
		onExportContent?: () => void;
	} = $props();

	let themeFileInput: HTMLInputElement | null = $state(null);
	let contentFileInput: HTMLInputElement | null = $state(null);

	function handleModeChange(newMode: string | undefined) {
		if (newMode === 'editor' || newMode === 'designer') {
			onModeChange?.(newMode);
		}
	}

	function handleThemeFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file && onImportTheme) {
			onImportTheme(file);
			target.value = '';
		}
	}

	function handleContentFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file && onImportContent) {
			onImportContent(file);
			target.value = '';
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

<header class="flex shrink-0 items-center justify-between gap-2 px-4 py-2">
	<div class="flex items-center gap-2">
		<SidebarTrigger>
			<Maximize2Icon />
			<span class="sr-only">Toggle Fullscreen</span>
		</SidebarTrigger>

		<Select type="single" value={mode} onValueChange={handleModeChange}>
			<SelectTrigger class="w-[150px]">
				{#if mode === 'editor'}
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
	</div>

	<div>
		<ToggleGroup
			type="single"
			value={viewportSizeString}
			onValueChange={(value) => onViewportSizeChange?.(value)}
		>
			<ToggleGroupItem value="1024" aria-label="Desktop View (1024px)">
				<MonitorIcon />
				<span class="sr-only">Desktop (1024px)</span>
			</ToggleGroupItem>
			<ToggleGroupItem value="768" aria-label="Tablet View (768px)">
				<TabletIcon class="-rotate-90" />
				<span class="sr-only">Tablet (768px)</span>
			</ToggleGroupItem>
			<ToggleGroupItem value="375" aria-label="Mobile View (375px)">
				<SmartphoneIcon />
				<span class="sr-only">Mobile (375px)</span>
			</ToggleGroupItem>
		</ToggleGroup>
	</div>

	<div class="flex items-center gap-2">
		{#if !showRightSidebar && onOpenRightSheet}
			<Button
				variant="ghost"
				size="icon"
				class="size-7"
				onclick={() => onOpenRightSheet()}
				title="Open Properties Panel"
			>
				<PanelRightIcon />
				<span class="sr-only">Open Properties Panel</span>
			</Button>
		{/if}
		{#if onSave}
			<Button variant="accent" size="sm" onclick={() => onSave()}>Save</Button>
		{/if}
		<DropdownMenu>
			<DropdownMenuTrigger>
				{#snippet child({ props })}
					<Button variant="muted" size="icon" class="size-8" {...props} title="More Actions">
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
	</div>
</header>
