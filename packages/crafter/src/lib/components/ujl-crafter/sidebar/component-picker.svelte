<script lang="ts">
	import {
		CommandDialog,
		CommandInput,
		CommandList,
		CommandEmpty,
		CommandGroup,
		CommandItem,
		CommandSeparator
	} from '@ujl-framework/ui';
	import { getContext } from 'svelte';
	import { Composer, type AnyModule, type ComponentCategory } from '@ujl-framework/core';
	import { COMPOSER_CONTEXT } from '../context.js';

	let {
		open = $bindable(false),
		onSelect
	}: {
		open?: boolean;
		onSelect: (componentType: string) => void;
	} = $props();

	const composer = getContext<Composer>(COMPOSER_CONTEXT);
	const modules = $derived(composer.getRegistry().getAllModules());

	/**
	 * Get module label
	 */
	function getModuleLabel(module: AnyModule): string {
		return module.label ?? '';
	}

	/**
	 * Get module category
	 */
	function getModuleCategory(module: AnyModule): ComponentCategory {
		return (module.category ?? 'content') as ComponentCategory;
	}

	/**
	 * Format category name for display (capitalize first letter)
	 */
	function formatCategory(category: ComponentCategory): string {
		return category.charAt(0).toUpperCase() + category.slice(1);
	}

	/**
	 * Get keywords for search (label, description, tags)
	 */
	function getModuleKeywords(module: AnyModule): string[] {
		const keywords: string[] = [];
		if (module.label) keywords.push(module.label);
		if (module.description) keywords.push(module.description);
		if (module.tags) keywords.push(...module.tags);
		return keywords;
	}

	/**
	 * Group modules by category
	 */
	const groupedModules = $derived(() => {
		return modules.reduce(
			(acc: Record<string, AnyModule[]>, module: AnyModule) => {
				const category = getModuleCategory(module);
				if (!acc[category]) {
					acc[category] = [];
				}
				acc[category].push(module);
				return acc;
			},
			{} as Record<string, AnyModule[]>
		);
	});

	/**
	 * Get sorted category keys for consistent ordering
	 */
	const sortedCategoryKeys = $derived(Object.keys(groupedModules()).sort());

	/**
	 * Handle component selection and close dialog
	 */
	function handleSelect(componentType: string) {
		onSelect(componentType);
		open = false;
	}
</script>

<CommandDialog bind:open title="Add Module" description="Search and select a module to add">
	<CommandInput placeholder="Search modules..." />
	<CommandList>
		<CommandEmpty>No modules found.</CommandEmpty>
		{#each sortedCategoryKeys as category, index (category)}
			{@const categoryModules = groupedModules()[category as ComponentCategory]}
			{@const typedCategory = category as ComponentCategory}
			{#if categoryModules && categoryModules.length > 0}
				<CommandGroup heading={formatCategory(typedCategory)}>
					{#each categoryModules as module (module.name)}
						<CommandItem
							value={module.name}
							keywords={getModuleKeywords(module)}
							onclick={() => handleSelect(module.name)}
						>
							<!-- SVG strings come from trusted module definitions -->
							<!-- eslint-disable-next-line svelte/no-at-html-tags -->
							{@html module.getSvgIcon()}
							<span>{getModuleLabel(module)}</span>
						</CommandItem>
					{/each}
				</CommandGroup>
				{#if index < sortedCategoryKeys.length - 1}
					<CommandSeparator />
				{/if}
			{/if}
		{/each}
	</CommandList>
</CommandDialog>
