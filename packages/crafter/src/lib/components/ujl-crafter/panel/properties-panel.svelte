<!-- Properties panel for editing selected module fields -->
<script lang="ts">
	import { Button } from '@ujl-framework/ui';
	import ShareIcon from '@lucide/svelte/icons/share';
	import FileJsonIcon from '@lucide/svelte/icons/file-json';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import { getContext } from 'svelte';
	import { CRAFTER_CONTEXT, COMPOSER_CONTEXT, type CrafterContext } from '../context.js';
	import { Composer, type AnyModule } from '@ujl-framework/core';
	import { findNodeById } from '$lib/utils/ujlc-tree.ts';
	import { FieldInput, MediaLibraryBrowser } from '../../ui/index.js';
	import { logger } from '$lib/utils/logger.js';
	import { MediaLibraryUploader } from '../../ui/media-library-uploader/index.js';

	const crafter = getContext<CrafterContext>(CRAFTER_CONTEXT);
	const composer = getContext<Composer>(COMPOSER_CONTEXT);

	const selectedNodeId = $derived.by(() => {
		return crafter.getMode() === 'editor' ? crafter.getSelectedNodeId() : null;
	});

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

	const mediaCount = $derived(() => {
		const media = crafter.getMedia();
		return Object.keys(media).length;
	});

	let mediaReloadTrigger = $state(0);

	function handleUploadComplete(mediaId: string) {
		logger.info('Upload complete:', mediaId);
		// Increment trigger to force browser reload
		mediaReloadTrigger++;
	}

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
	{#if crafter.isMediaLibraryViewActive()}
		<!-- Media Library View -->
		<div class="flex h-full flex-col">
			<!-- Fixed Header with Back Button and Upload -->
			<div class="sticky top-0 z-10 space-y-3 bg-sidebar p-3">
				<div class="flex w-full items-center gap-2">
					<Button
						type="button"
						variant="ghost"
						size="icon"
						class="size-8 shrink-0"
						onclick={() => crafter.setMediaLibraryViewActive(false)}
					>
						<ArrowLeftIcon class="h-4 w-4" />
					</Button>
					<div class="flex w-full items-center justify-between">
						<span class="text-sm font-medium">Media Library</span>
						<span class="text-xs text-muted-foreground">
							{mediaCount()}
							{mediaCount() === 1 ? 'item' : 'items'}
						</span>
					</div>
				</div>
				<MediaLibraryUploader onUploadComplete={handleUploadComplete} />
			</div>

			<!-- Scrollable Media Grid -->
			<div class="flex-1 overflow-y-auto">
				{#key mediaReloadTrigger}
					<MediaLibraryBrowser
						selectedMediaId={crafter.getMediaLibraryContext()?.currentValue != null
							? String(crafter.getMediaLibraryContext()?.currentValue)
							: null}
						onSelect={(mediaId: string) => {
							const context = crafter.getMediaLibraryContext();
							if (context && context.nodeId && context.fieldName) {
								crafter.operations.updateNodeField(context.nodeId, context.fieldName, mediaId);
							}
							crafter.setMediaLibraryViewActive(false);
						}}
					/>
				{/key}
			</div>
		</div>
	{:else if !selectedNodeId}
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
			<div class="relative flex w-full min-w-0 flex-col p-2">
				<div
					class="flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 ring-sidebar-ring outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0"
				>
					<span class="text-sm">{getModuleLabel(module())}</span>
				</div>
			</div>

			{#if hasEditableFields()}
				<div class="relative flex w-full min-w-0 flex-col p-2">
					<div class="w-full space-y-6 p-2 pt-0 text-sm">
						{#each fieldEntries() as fieldEntry (fieldEntry.key)}
							<FieldInput
								fieldName={fieldEntry.key}
								{fieldEntry}
								value={selectedNode()!.fields[fieldEntry.key]}
								onChange={(value: unknown) => handleFieldUpdate(fieldEntry.key, value)}
								nodeId={selectedNodeId}
							/>
						{/each}
					</div>
				</div>
			{:else}
				<div class="relative flex w-full min-w-0 flex-col p-2">
					<div
						class="flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 ring-sidebar-ring outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0"
					>
						Properties
					</div>
					<div class="w-full p-4 text-sm">
						<p class="text-xs text-muted-foreground italic">
							This component type has no editable properties.
						</p>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>
