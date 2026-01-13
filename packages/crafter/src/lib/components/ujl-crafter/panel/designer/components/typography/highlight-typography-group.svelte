<!--
	Highlight typography group for editing highlight typography tokens.
	Receives UJLTTypographyHighlight props and forwards changes via onChange callback to designer.svelte.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import {
		SidebarGroup,
		SidebarGroupLabel,
		SidebarGroupContent,
		Collapsible,
		CollapsibleTrigger,
		CollapsibleContent
	} from '@ujl-framework/ui';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import type { UJLTTypographyHighlight, UJLTColorPalette } from '@ujl-framework/types';
	import { FlavorSelect, StyleToggles } from '$lib/components/ui/index.js';

	let {
		typography,
		palette,
		onChange
	}: {
		typography: UJLTTypographyHighlight;
		palette: UJLTColorPalette;
		onChange?: (updates: Partial<UJLTTypographyHighlight>) => void;
	} = $props();

	let flavor = $state(untrack(() => typography.flavor));
	let bold = $state(untrack(() => typography.bold));
	let italic = $state(untrack(() => typography.italic));
	let underline = $state(untrack(() => typography.underline));

	// Track previous value to detect external changes vs user-initiated changes
	let previous = $state(untrack(() => typography));

	// Sync state to handle theme switching without losing user edits
	$effect(() => {
		if (typography !== previous) {
			flavor = typography.flavor;
			bold = typography.bold;
			italic = typography.italic;
			underline = typography.underline;
			previous = typography;
		}
	});

	function handleUpdate(field: keyof UJLTTypographyHighlight, value: unknown) {
		if (onChange) {
			onChange({ [field]: value } as Partial<UJLTTypographyHighlight>);
		}
	}
</script>

<Collapsible class="group/collapsible">
	<SidebarGroup>
		<SidebarGroupLabel>
			{#snippet child({ props })}
				<CollapsibleTrigger {...props}>
					<ChevronRightIcon
						class="mr-1 transition-transform group-data-[state=open]/collapsible:rotate-90"
					/>
					Highlight
				</CollapsibleTrigger>
			{/snippet}
		</SidebarGroupLabel>
		<CollapsibleContent>
			<SidebarGroupContent class="space-y-8 p-4">
				<FlavorSelect
					id="highlight-flavor"
					bind:value={flavor}
					{palette}
					onchange={(value) => {
						flavor = value;
						handleUpdate('flavor', value);
					}}
				/>
				<StyleToggles
					id="highlight"
					bind:italic
					bind:underline
					bind:bold
					showItalic={true}
					showUnderline={true}
					showBold={true}
					showTextTransform={false}
					onItalicChange={(v) => {
						italic = v;
						handleUpdate('italic', v);
					}}
					onUnderlineChange={(v) => {
						underline = v;
						handleUpdate('underline', v);
					}}
					onBoldChange={(v) => {
						bold = v;
						handleUpdate('bold', v);
					}}
				/>
			</SidebarGroupContent>
		</CollapsibleContent>
	</SidebarGroup>
</Collapsible>
