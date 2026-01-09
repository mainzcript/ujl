<!-- Reusable content for the right sidebar - used in both Sidebar and Sheet -->
<script lang="ts">
	import { SidebarGroup, SidebarGroupLabel, SidebarGroupContent } from '@ujl-framework/ui';
	import ShareIcon from '@lucide/svelte/icons/share';
	import FileJsonIcon from '@lucide/svelte/icons/file-json';
	import { page } from '$app/state';
	import { getContext } from 'svelte';
	import { CRAFTER_CONTEXT, COMPOSER_CONTEXT, type CrafterContext } from '../context.js';
	import { Composer, type AnyModule } from '@ujl-framework/core';
	import { findNodeById } from '$lib/utils/ujlc-tree.ts';
	import { FieldInput } from '../../ui/index.js';
	import { logger } from '$lib/utils/logger.js';

	const crafter = getContext<CrafterContext>(CRAFTER_CONTEXT);
	const composer = getContext<Composer>(COMPOSER_CONTEXT);

	const selectedNodeId = $derived(page.url.searchParams.get('selected'));

	// Slot selection uses format: parentId:slotName
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
</script>

<div class="h-full overflow-y-auto">
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
</div>
