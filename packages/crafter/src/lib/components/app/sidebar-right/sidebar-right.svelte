<script lang="ts">
	import {
		Sidebar,
		SidebarHeader,
		SidebarContent,
		SidebarGroup,
		SidebarGroupLabel,
		SidebarGroupContent,
		Button,
		DropdownMenu,
		DropdownMenuTrigger,
		DropdownMenuContent,
		DropdownMenuItem,
		useSidebar
	} from '@ujl-framework/ui';
	import type { ComponentProps } from 'svelte';
	import ShareIcon from '@lucide/svelte/icons/share';
	import FileJsonIcon from '@lucide/svelte/icons/file-json';
	import FolderOpenIcon from '@lucide/svelte/icons/folder-open';
	import { page } from '$app/state';
	import { getContext } from 'svelte';
	import { CRAFTER_CONTEXT, COMPOSER_CONTEXT, type CrafterContext } from '../context.js';
	import { Composer, type AnyModule } from '@ujl-framework/core';
	import { findNodeById } from '$lib/utils/ujlc-tree.ts';
	import { FieldInput } from '../../ui/index.js';
	import { testId } from '$lib/utils/test-attrs.ts';
	import { logger } from '$lib/utils/logger.js';

	let {
		ref = $bindable(null),
		onExportTheme,
		onExportContent,
		onImportTheme,
		onImportContent,
		...restProps
	}: ComponentProps<typeof Sidebar> & {
		onExportTheme?: () => void;
		onExportContent?: () => void;
		onImportTheme?: (file: File) => void;
		onImportContent?: (file: File) => void;
	} = $props();

	const crafter = getContext<CrafterContext>(CRAFTER_CONTEXT);
	const composer = getContext<Composer>(COMPOSER_CONTEXT);
	const sidebar = useSidebar();

	let themeFileInput: HTMLInputElement | null = $state(null);
	let contentFileInput: HTMLInputElement | null = $state(null);

	const selectedNodeId = $derived(page.url.searchParams.get('selected'));

	// Check if selection is a slot (format: parentId:slotName)
	const isSlotSelected = $derived(() => {
		return selectedNodeId?.includes(':') || false;
	});

	const selectedNode = $derived(() => {
		if (!selectedNodeId || isSlotSelected()) return null;

		const rootSlot = crafter.getRootSlot();
		return findNodeById(rootSlot, selectedNodeId);
	});

	const module = $derived(() => {
		if (!selectedNode()) return null;
		return composer.getRegistry().getModule(selectedNode()!.type);
	});

	const fieldEntries = $derived(() => {
		return module()?.fields || [];
	});

	const hasEditableFields = $derived(() => {
		return fieldEntries().length > 0;
	});

	function getModuleLabel(module: AnyModule | null | undefined): string {
		if (!module) return '';
		return module.label ?? '';
	}

	/**
	 * Handler for field updates from FieldInput components
	 * Calls the context API to update the node field immutably
	 */
	function handleFieldUpdate(fieldName: string, newValue: unknown) {
		if (!selectedNodeId || isSlotSelected()) return;

		const success = crafter.operations.updateNodeField(selectedNodeId, fieldName, newValue);

		if (!success) {
			logger.error('Failed to update field:', fieldName);
		}
	}

	function handleThemeFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file && onImportTheme) {
			onImportTheme(file);
			target.value = ''; // Reset input
		}
	}

	function handleContentFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file && onImportContent) {
			onImportContent(file);
			target.value = ''; // Reset input
		}
	}
</script>

<Sidebar
	bind:ref
	collapsible="none"
	class="sticky top-0 hidden h-svh border-l lg:flex"
	{...restProps}
	{...testId('sidebar-right')}
>
	<SidebarHeader class="border-b border-sidebar-border">
		<div class="flex items-center justify-end gap-2">
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

			<DropdownMenu>
				<DropdownMenuTrigger title="Import">
					{#snippet child({ props })}
						<Button variant="muted" size="icon" class="size-8" {...props}>
							<FolderOpenIcon />
						</Button>
					{/snippet}
				</DropdownMenuTrigger>
				<DropdownMenuContent
					class="w-56"
					side={sidebar.isMobile ? 'bottom' : 'right'}
					align="end"
					sideOffset={4}
				>
					<DropdownMenuItem
						onclick={() => themeFileInput?.click()}
						title="Import a .ujlt.json file"
					>
						<FileJsonIcon class="mr-2 size-4" />
						<span>Import Theme</span>
					</DropdownMenuItem>
					<DropdownMenuItem
						onclick={() => contentFileInput?.click()}
						title="Import a .ujlc.json file"
					>
						<FileJsonIcon class="mr-2 size-4" />
						<span>Import Content</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<DropdownMenu>
				<DropdownMenuTrigger title="Export">
					{#snippet child({ props })}
						<Button variant="muted" size="icon" class="size-8" {...props}>
							<ShareIcon />
						</Button>
					{/snippet}
				</DropdownMenuTrigger>
				<DropdownMenuContent
					class="w-56"
					side={sidebar.isMobile ? 'bottom' : 'right'}
					align="end"
					sideOffset={4}
				>
					<DropdownMenuItem onclick={() => onExportTheme?.()} title="Get the .ujlt.json file">
						<FileJsonIcon class="mr-2 size-4" />
						<span>Export Theme</span>
					</DropdownMenuItem>
					<DropdownMenuItem onclick={() => onExportContent?.()} title="Get the .ujlc.json file">
						<FileJsonIcon class="mr-2 size-4" />
						<span>Export Content</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<!-- TODO: Implement save functionality - placeholder UI until backend API is ready -->
			<Button variant="primary" size="sm" onclick={() => alert('Save functionality coming soon!')}>
				Save
			</Button>
		</div>
	</SidebarHeader>

	<SidebarContent class="overflow-y-auto">
		{#if !selectedNodeId}
			<div class="flex h-full items-center justify-center p-8 text-center">
				<div class="space-y-3">
					<div class="mx-auto flex size-16 items-center justify-center rounded-full bg-muted">
						<ShareIcon class="size-8 text-muted-foreground" />
					</div>
					<div class="space-y-1">
						<p class="text-sm font-medium">No component selected</p>
						<p class="text-xs text-muted-foreground">
							Select a component in the tree or preview to edit its properties
						</p>
					</div>
				</div>
			</div>
		{:else if isSlotSelected()}
			<div class="flex h-full items-center justify-center p-8 text-center">
				<div class="space-y-3">
					<div class="mx-auto flex size-16 items-center justify-center rounded-full bg-muted">
						<FileJsonIcon class="size-8 text-muted-foreground" />
					</div>
					<div class="space-y-1">
						<p class="text-sm font-medium">Slot selected</p>
						<p class="text-xs text-muted-foreground">
							Slots don't have editable properties. Select a component instead.
						</p>
					</div>
				</div>
			</div>
		{:else if !selectedNode()}
			<!-- Error state: Node not found (should not happen normally) -->
			<div class="flex h-full items-center justify-center p-8 text-center">
				<div class="space-y-3">
					<div
						class="mx-auto flex size-16 items-center justify-center rounded-full bg-destructive/10"
					>
						<ShareIcon class="size-8 text-destructive" />
					</div>
					<div class="space-y-1">
						<p class="text-sm font-medium text-destructive">Component not found</p>
						<p class="text-xs text-muted-foreground">
							The selected component could not be found in the document tree.
						</p>
					</div>
				</div>
			</div>
		{:else}
			<div class="h-full">
				<SidebarGroup>
					<SidebarGroupLabel>
						<span class="text-sm">{getModuleLabel(module())}</span>
					</SidebarGroupLabel>
				</SidebarGroup>

				{#if hasEditableFields()}
					<SidebarGroup>
						<SidebarGroupContent class="space-y-6 p-2 pt-0">
							{#each fieldEntries() as fieldEntry (fieldEntry.key)}
								<FieldInput
									fieldName={fieldEntry.key}
									{fieldEntry}
									value={selectedNode()!.fields[fieldEntry.key]}
									onChange={(value: unknown) => handleFieldUpdate(fieldEntry.key, value)}
								/>
							{/each}
						</SidebarGroupContent>
					</SidebarGroup>
				{:else}
					<SidebarGroup>
						<SidebarGroupLabel>Properties</SidebarGroupLabel>
						<SidebarGroupContent class="p-4">
							<p class="text-xs text-muted-foreground italic">
								This component type has no editable properties.
							</p>
						</SidebarGroupContent>
					</SidebarGroup>
				{/if}
			</div>
		{/if}
	</SidebarContent>
</Sidebar>
