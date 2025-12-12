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
	import { page } from '$app/stores';
	import { getContext } from 'svelte';
	import { CRAFTER_CONTEXT, type CrafterContext } from '../context.js';
	import { getComponentDefinition } from '@ujl-framework/examples/components';
	import { findNodeById } from '$lib/tools/ujlc-tree.ts';
	import { FieldInput } from './components/index.js';
	import { testId } from '$lib/utils/test-attrs.ts';

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

	// Get Crafter Context
	const crafter = getContext<CrafterContext>(CRAFTER_CONTEXT);
	const sidebar = useSidebar();

	// Hidden file inputs for import
	let themeFileInput: HTMLInputElement | null = $state(null);
	let contentFileInput: HTMLInputElement | null = $state(null);

	// Reactive: Selected Node ID from URL
	const selectedNodeId = $derived($page.url.searchParams.get('selected'));

	// Check if selection is a slot (format: parentId:slotName)
	const isSlotSelected = $derived(() => {
		return selectedNodeId?.includes(':') || false;
	});

	// Reactive: Find selected node in tree
	const selectedNode = $derived(() => {
		if (!selectedNodeId || isSlotSelected()) return null;

		const rootSlot = crafter.getRootSlot();
		return findNodeById(rootSlot, selectedNodeId);
	});

	// Reactive: Get component definition for selected node
	const componentDef = $derived(() => {
		if (!selectedNode()) return null;
		return getComponentDefinition(selectedNode()!.type);
	});

	// Reactive: Get field definitions
	const fieldDefinitions = $derived(() => {
		return componentDef()?.fields || {};
	});

	// Reactive: Check if there are any editable fields
	const hasEditableFields = $derived(() => {
		return Object.keys(fieldDefinitions()).length > 0;
	});

	/**
	 * Handler for field updates from FieldInput components
	 * Calls the context API to update the node field immutably
	 */
	function handleFieldUpdate(fieldName: string, newValue: unknown) {
		if (!selectedNodeId || isSlotSelected()) return;

		const success = crafter.operations.updateNodeField(selectedNodeId, fieldName, newValue);

		if (!success) {
			console.error('[SidebarRight] Failed to update field:', fieldName);
		}
	}

	/**
	 * Handler for theme file selection
	 */
	function handleThemeFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file && onImportTheme) {
			onImportTheme(file);
			target.value = ''; // Reset input
		}
	}

	/**
	 * Handler for content file selection
	 */
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
	<!-- Header with Export/Import buttons -->
	<SidebarHeader class="border-b border-sidebar-border">
		<div class="flex items-center justify-end gap-2">
			<!-- Hidden file inputs -->
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

			<!-- Import Dropdown -->
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

			<!-- Export Dropdown -->
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

			<!-- Save Button (future implementation) -->
			<Button variant="primary" size="sm" onclick={() => alert('Save functionality coming soon!')}>
				Save
			</Button>
		</div>
	</SidebarHeader>

	<!-- Content Area -->
	<SidebarContent class="overflow-y-auto">
		{#if !selectedNodeId}
			<!-- No selection state -->
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
			<!-- Slot selection state -->
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
			<!-- Node not found (should not happen normally) -->
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
			<!-- Properties Form -->
			<div class="h-full">
				<!-- Component Info Header -->
				<SidebarGroup>
					<SidebarGroupLabel>
						<span class="text-sm">{componentDef()?.label || selectedNode()!.type}</span>
					</SidebarGroupLabel>
				</SidebarGroup>

				<!-- Editable Properties -->
				{#if hasEditableFields()}
					<SidebarGroup>
						<!-- <SidebarGroupLabel>Properties</SidebarGroupLabel> -->
						<SidebarGroupContent class="space-y-6 p-2 pt-0">
							{#each Object.entries(fieldDefinitions()) as [fieldName, fieldDef] (fieldName)}
								<FieldInput
									{fieldName}
									definition={fieldDef}
									value={selectedNode()!.fields[fieldName]}
									onChange={(value) => handleFieldUpdate(fieldName, value)}
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
