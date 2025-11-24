<script lang="ts">
	import type { ComponentDefinition } from '@ujl-framework/types';
	import {
		Dialog,
		DialogContent,
		DialogHeader,
		DialogTitle,
		Input,
		Button,
		ScrollArea
	} from '@ujl-framework/ui';
	import { componentLibrary } from '@ujl-framework/examples/components';

	let {
		open = $bindable(false),
		onSelect
	}: {
		open?: boolean;
		onSelect: (componentType: string) => void;
	} = $props();

	// Search query
	let searchQuery = $state('');

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

	// Handle component selection
	function handleSelect(componentType: string) {
		onSelect(componentType);
		open = false;
		resetState();
	}

	// Reset state
	function resetState() {
		searchQuery = '';
	}

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
