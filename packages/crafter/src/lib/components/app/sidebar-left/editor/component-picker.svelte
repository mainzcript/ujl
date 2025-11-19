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
		searchQuery = ''; // Reset search
	}

	// Reset search when dialog closes
	$effect(() => {
		if (!open) {
			searchQuery = '';
		}
	});
</script>

<Dialog bind:open>
	<DialogContent class="max-h-[80vh] max-w-2xl">
		<DialogHeader>
			<DialogTitle>Insert Component</DialogTitle>
		</DialogHeader>

		<div class="flex flex-col gap-4">
			<!-- Search Input -->
			<Input bind:value={searchQuery} placeholder="Search components..." class="w-full" autofocus />

			<!-- Component List -->
			<ScrollArea class="h-[400px] pr-4">
				{#if Object.keys(filteredComponents()).length === 0}
					<div class="flex items-center justify-center py-8 text-muted-foreground">
						No components found.
					</div>
				{:else}
					<div class="space-y-4">
						{#each Object.entries(filteredComponents()) as [category, components] (category)}
							{@const typedComponents = components as ComponentDefinition[]}
							{#if typedComponents.length > 0}
								<div>
									<h3 class="mb-2 text-sm font-semibold text-muted-foreground uppercase">
										{categoryLabels[category] || category}
									</h3>
									<div class="space-y-1">
										{#each typedComponents as component (component.type)}
											<Button
												variant="ghost"
												class="h-auto w-full justify-start gap-3 px-4 py-3"
												onclick={() => handleSelect(component.type)}
											>
												<div class="flex min-w-0 flex-1 flex-col items-start gap-0.5">
													<span class="text-left font-medium">{component.label}</span>
													{#if component.description}
														<span class="text-left text-xs text-muted-foreground">
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
