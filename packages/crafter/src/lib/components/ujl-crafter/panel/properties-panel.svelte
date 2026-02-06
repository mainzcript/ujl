<!-- Properties panel for editing selected module fields -->
<script lang="ts">
	import ShareIcon from "@lucide/svelte/icons/share";
	import FileJsonIcon from "@lucide/svelte/icons/file-json";
	import { getContext } from "svelte";
	import { CRAFTER_CONTEXT, COMPOSER_CONTEXT, type CrafterContext } from "$lib/stores/index.js";
	import { Composer, type AnyModule } from "@ujl-framework/core";
	import { findNodeById } from "$lib/utils/ujlc-tree.js";
	import { FieldInput } from "$lib/components/ui/index.js";
	import { logger } from "$lib/utils/logger.js";

	const crafter = getContext<CrafterContext>(CRAFTER_CONTEXT);
	const composer = getContext<Composer>(COMPOSER_CONTEXT);

	const selectedNodeId = $derived.by(() => {
		return crafter.mode === "editor" ? crafter.selectedNodeId : null;
	});

	// Slot selection uses format: parentId:slotName
	const isSlotSelected = $derived(() => {
		return selectedNodeId?.includes(":") || false;
	});

	const selectedNode = $derived(() => {
		if (!selectedNodeId || isSlotSelected()) return null;
		return findNodeById(crafter.rootSlot, selectedNodeId);
	});

	const module = $derived(() => {
		const node = selectedNode();
		if (!node) return null;
		return composer.getRegistry().getModule(node.type);
	});

	const fieldEntries = $derived(() => {
		return module()?.fields ?? [];
	});

	// Helper to safely get field values for the template
	const getFieldValue = (fieldKey: string): unknown => {
		return selectedNode()?.fields[fieldKey];
	};

	const hasEditableFields = $derived(() => {
		return fieldEntries().length > 0;
	});

	function getModuleLabel(module: AnyModule | null | undefined): string {
		if (!module) return "";
		return module.label ?? "";
	}

	/**
	 * Handler for field updates from FieldInput components
	 * Calls the context API to update the node field immutably
	 */
	function handleFieldUpdate(fieldName: string, newValue: unknown) {
		if (!selectedNodeId || isSlotSelected()) return;

		const success = crafter.operations.updateNodeField(selectedNodeId, fieldName, newValue);

		if (!success) {
			logger.error("Failed to update field:", fieldName);
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
					<p class="text-sm font-medium">No module selected</p>
					<p class="text-xs text-muted-foreground">
						Select a module in the tree or preview to edit its properties
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
						Slots don't have editable properties. Select a module instead.
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
					<p class="text-sm font-medium text-destructive">Module not found</p>
					<p class="text-xs text-muted-foreground">
						The selected module could not be found in the document tree.
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
								value={getFieldValue(fieldEntry.key)}
								onChange={(value: unknown) => handleFieldUpdate(fieldEntry.key, value)}
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
							This module type has no editable properties.
						</p>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>
