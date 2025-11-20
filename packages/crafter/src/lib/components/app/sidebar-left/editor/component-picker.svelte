<script lang="ts">
	import type { ComponentDefinition, UJLCModuleObject } from '@ujl-framework/types';
	import {
		Dialog,
		DialogContent,
		DialogHeader,
		DialogTitle,
		Input,
		Button,
		ScrollArea,
		Label
	} from '@ujl-framework/ui';
	import { componentLibrary } from '@ujl-framework/examples/components';

	let {
		open = $bindable(false),
		targetNode = null,
		onSelect
	}: {
		open?: boolean;
		targetNode?: UJLCModuleObject | null;
		onSelect: (componentType: string, slotName?: string) => void;
	} = $props();

	// Search query
	let searchQuery = $state('');

	// Selected slot
	let selectedSlot = $state<string | null>(null);

	// Available slots from target node
	const availableSlots = $derived(() => {
		if (!targetNode?.slots) return [];
		return Object.keys(targetNode.slots);
	});

	// Check if target has multiple slots
	const hasMultipleSlots = $derived(availableSlots().length > 1);

	// Filtered and grouped components
	const filteredComponents = $derived(() => {
		const query = searchQuery.toLowerCase().trim();

		if (!query) {
			// No search - return all components grouped
			return componentLibrary.reduce(
				(acc: Record<string, ComponentDefinition[]>, comp: ComponentDefinition) => {
					if (!acc[comp.category]) {
						acc[comp.category] = [];
					}
					acc[comp.category].push(comp);
					return acc;
				},
				{} as Record<string, ComponentDefinition[]>
			);
		}

		// Search filter
		const filtered = componentLibrary.filter(
			(comp: ComponentDefinition) =>
				comp.label.toLowerCase().includes(query) ||
				comp.description?.toLowerCase().includes(query) ||
				comp.tags?.some((tag: string) => tag.toLowerCase().includes(query))
		);

		// Group filtered results
		return filtered.reduce(
			(acc: Record<string, ComponentDefinition[]>, comp: ComponentDefinition) => {
				if (!acc[comp.category]) {
					acc[comp.category] = [];
				}
				acc[comp.category].push(comp);
				return acc;
			},
			{} as Record<string, ComponentDefinition[]>
		);
	});

	// Category display names
	const categoryLabels: Record<string, string> = {
		layout: 'Layout',
		content: 'Content',
		media: 'Media',
		interactive: 'Interactive',
		data: 'Data',
		navigation: 'Navigation'
	};

	// Format slot name for display
	function formatSlotName(slotName: string): string {
		return slotName
			.split(/[-_]/)
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	}

	// Get slot item count
	function getSlotItemCount(slotName: string): number {
		if (!targetNode?.slots?.[slotName]) return 0;
		return targetNode.slots[slotName].length;
	}

	// Handle component selection
	function handleSelect(componentType: string) {
		// If target has multiple slots, pass the selected slot
		const slotToUse = hasMultipleSlots ? selectedSlot : undefined;
		onSelect(componentType, slotToUse || undefined);
		open = false;
		resetState();
	}

	// Reset state
	function resetState() {
		searchQuery = '';
		selectedSlot = null;
	}

	// Initialize selected slot when dialog opens
	$effect(() => {
		if (open && hasMultipleSlots && !selectedSlot) {
			// Set default to first slot
			selectedSlot = availableSlots()[0];
		} else if (open && !hasMultipleSlots) {
			// Clear selection if only one slot
			selectedSlot = null;
		}
	});

	// Reset state when dialog closes
	$effect(() => {
		if (!open) {
			resetState();
		}
	});
</script>

<Dialog bind:open>
	<DialogContent
		class="h-full max-h-[90vh] w-[95vw] max-w-2xl overflow-hidden sm:max-h-[80vh] sm:w-full sm:rounded-lg"
	>
		<DialogHeader>
			<DialogTitle>Insert Component</DialogTitle>
		</DialogHeader>

		<div class="flex h-full flex-col gap-3 overflow-hidden sm:gap-4">
			<!-- Search Input -->
			<Input bind:value={searchQuery} placeholder="Search components..." class="w-full" autofocus />

			<!-- Slot Selection (only if multiple slots) -->
			{#if hasMultipleSlots}
				<div class="space-y-2 rounded-md border bg-muted/50 p-3 sm:space-y-3 sm:p-4">
					<Label class="text-sm font-medium">Insert into slot:</Label>
					<div class="flex flex-wrap gap-2">
						{#each availableSlots() as slotName (slotName)}
							<Button
								variant={selectedSlot === slotName ? 'default' : 'outline'}
								size="sm"
								class="min-w-[100px] flex-1 text-xs sm:min-w-[120px] sm:text-sm"
								onclick={() => (selectedSlot = slotName)}
							>
								<span class="font-medium">{formatSlotName(slotName)}</span>
								<span class="ml-1 text-xs opacity-70 sm:ml-2">
									({getSlotItemCount(slotName)})
								</span>
							</Button>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Component List -->
			<ScrollArea class="h-[50vh] h-full overflow-hidden pr-2 sm:h-[400px] sm:pr-4">
				{#if Object.keys(filteredComponents()).length === 0}
					<div
						class="flex items-center justify-center py-8 text-sm text-muted-foreground sm:text-base"
					>
						No components found.
					</div>
				{:else}
					<div class="space-y-3 sm:space-y-4">
						{#each Object.entries(filteredComponents()) as [category, components] (category)}
							{@const typedComponents = components as ComponentDefinition[]}
							{#if typedComponents.length > 0}
								<div>
									<h3
										class="mb-1.5 text-xs font-semibold text-muted-foreground uppercase sm:mb-2 sm:text-sm"
									>
										{categoryLabels[category] || category}
									</h3>
									<div class="space-y-1">
										{#each typedComponents as component (component.type)}
											<Button
												variant="ghost"
												class="h-auto w-full justify-start gap-2 px-3 py-2 sm:gap-3 sm:px-4 sm:py-3"
												onclick={() => handleSelect(component.type)}
											>
												<div class="flex min-w-0 flex-1 flex-col items-start gap-0.5">
													<span class="text-left text-sm font-medium sm:text-base"
														>{component.label}</span
													>
													{#if component.description}
														<span
															class="line-clamp-2 text-left text-xs text-muted-foreground sm:line-clamp-1"
														>
															{component.description}
														</span>
													{/if}
												</div>
											</Button>
										{/each}
									</div>
								</div>
							{/if}
						{/each}
					</div>
				{/if}
			</ScrollArea>
		</div>
	</DialogContent>
</Dialog>
