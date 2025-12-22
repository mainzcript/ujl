<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import { Command as CommandPrimitive } from 'bits-ui';
	import { CommandItem } from '../command/index.js';
	import { getComboboxContext } from './context.js';
	import { cn } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		label,
		keywords,
		value,
		children: childrenProp,
		...restProps
	}: CommandPrimitive.ItemProps & {
		label?: string;
	} = $props();

	const comboboxContext = getComboboxContext();
	const isSelected = $derived(comboboxContext?.value === value);

	// Automatically add label as keyword if provided and keywords not explicitly set
	const computedKeywords = $derived(keywords ?? (label ? [label] : undefined));
</script>

<CommandItem
	bind:ref
	data-slot="combobox-item"
	class={cn('relative pr-8 pl-2', className)}
	keywords={computedKeywords}
	{value}
	{...restProps}
>
	{#if childrenProp}
		{@render childrenProp()}
	{:else}
		{label || value}
	{/if}
	<span class="pointer-events-none absolute right-2 flex size-3.5 items-center justify-center">
		{#if isSelected}
			<CheckIcon class="size-4" />
		{/if}
	</span>
</CommandItem>
