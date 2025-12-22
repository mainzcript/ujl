<!--
	Style toggles component for italic, underline, and text transform.
	Flexible configuration to show/hide individual toggles based on use case.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import { Toggle, ToggleGroup, ToggleGroupItem, Label } from '@ujl-framework/ui';
	import ItalicIcon from '@lucide/svelte/icons/italic';
	import UnderlineIcon from '@lucide/svelte/icons/underline';
	import BoldIcon from '@lucide/svelte/icons/bold';
	import CaseSensitiveIcon from '@lucide/svelte/icons/case-sensitive';
	import CaseUpperIcon from '@lucide/svelte/icons/case-upper';
	import CaseLowerIcon from '@lucide/svelte/icons/case-lower';

	const textTransformOptions = [
		{ value: 'capitalize', label: 'Capitalize', icon: CaseSensitiveIcon },
		{ value: 'uppercase', label: 'Uppercase', icon: CaseUpperIcon },
		{ value: 'lowercase', label: 'Lowercase', icon: CaseLowerIcon }
	];

	let {
		id,
		italic = $bindable<boolean | undefined>(),
		underline = $bindable<boolean | undefined>(),
		bold = $bindable<boolean | undefined>(),
		textTransform = $bindable<'none' | 'capitalize' | 'uppercase' | 'lowercase' | undefined>(),
		showItalic = true,
		showUnderline = true,
		showBold = false,
		showTextTransform = false,
		onItalicChange,
		onUnderlineChange,
		onBoldChange,
		onTextTransformChange
	}: {
		id: string;
		italic?: boolean;
		underline?: boolean;
		bold?: boolean;
		textTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase';
		showItalic?: boolean;
		showUnderline?: boolean;
		showBold?: boolean;
		showTextTransform?: boolean;
		onItalicChange?: (v: boolean) => void;
		onUnderlineChange?: (v: boolean) => void;
		onBoldChange?: (v: boolean) => void;
		onTextTransformChange?: (v: string) => void;
	} = $props();

	// State for ToggleGroup: convert "none" to undefined for display
	// Using $state + $effect instead of $derived because we need bidirectional binding with ToggleGroup
	// eslint-disable-next-line svelte/prefer-writable-derived
	let textTransformToggleValue = $state<string | undefined>(
		untrack(() => (textTransform === 'none' ? undefined : textTransform))
	);

	// Sync textTransformToggleValue when textTransform prop changes externally
	$effect(() => {
		textTransformToggleValue = textTransform === 'none' ? undefined : textTransform;
	});
</script>

<div class="space-y-2">
	<Label class="text-xs">Style</Label>
	<div class="flex items-center justify-between">
		{#if showItalic || showUnderline || showBold}
			<div>
				{#if showBold}
					<Toggle
						id="{id}-bold"
						bind:pressed={bold}
						aria-label="Toggle bold"
						title="Bold"
						onPressedChange={(pressed) => {
							bold = pressed;
							onBoldChange?.(pressed);
						}}
					>
						<BoldIcon aria-hidden="true" />
					</Toggle>
				{/if}
				{#if showItalic}
					<Toggle
						id="{id}-italic"
						bind:pressed={italic}
						aria-label="Toggle italic"
						title="Italic"
						onPressedChange={(pressed) => {
							italic = pressed;
							onItalicChange?.(pressed);
						}}
					>
						<ItalicIcon aria-hidden="true" />
					</Toggle>
				{/if}
				{#if showUnderline}
					<Toggle
						id="{id}-underline"
						bind:pressed={underline}
						aria-label="Toggle underline"
						title="Underline"
						onPressedChange={(pressed) => {
							underline = pressed;
							onUnderlineChange?.(pressed);
						}}
					>
						<UnderlineIcon aria-hidden="true" />
					</Toggle>
				{/if}
			</div>
		{/if}
		{#if showTextTransform}
			<ToggleGroup
				type="single"
				bind:value={textTransformToggleValue}
				onValueChange={(v) => {
					const transformValue = (v || 'none') as 'none' | 'capitalize' | 'uppercase' | 'lowercase';
					textTransform = transformValue;
					onTextTransformChange?.(transformValue);
				}}
			>
				{#each textTransformOptions as option (option.value)}
					<ToggleGroupItem value={option.value} aria-label={option.label} title={option.label}>
						{@const Icon = option.icon}
						<Icon aria-hidden="true" />
					</ToggleGroupItem>
				{/each}
			</ToggleGroup>
		{/if}
	</div>
</div>
