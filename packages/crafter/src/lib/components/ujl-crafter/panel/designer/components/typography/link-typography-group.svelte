<!--
	Link typography group for editing link typography tokens.
	Receives UJLTTypographyLink props and forwards changes via onChange callback to designer.svelte.
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
	import type { UJLTTypographyLink } from '@ujl-framework/types';
	import { StyleToggles } from '$lib/components/ui/index.js';

	let {
		typography,
		onChange
	}: {
		typography: UJLTTypographyLink;
		onChange?: (updates: Partial<UJLTTypographyLink>) => void;
	} = $props();

	let bold = $state(untrack(() => typography.bold));
	let underline = $state(untrack(() => typography.underline));

	// Track previous value to detect external changes vs user-initiated changes
	let previous = $state(untrack(() => typography));

	// Sync state to handle theme switching without losing user edits
	$effect(() => {
		if (typography !== previous) {
			bold = typography.bold;
			underline = typography.underline;
			previous = typography;
		}
	});

	function handleUpdate(field: keyof UJLTTypographyLink, value: unknown) {
		if (onChange) {
			onChange({ [field]: value } as Partial<UJLTTypographyLink>);
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
					Link
				</CollapsibleTrigger>
			{/snippet}
		</SidebarGroupLabel>
		<CollapsibleContent>
			<SidebarGroupContent class="space-y-8 p-4">
				<StyleToggles
					id="link"
					bind:underline
					bind:bold
					showItalic={false}
					showUnderline={true}
					showBold={true}
					showTextTransform={false}
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
