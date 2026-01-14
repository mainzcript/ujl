<!--
	Link typography group for editing link typography tokens.
	Receives UJLTTypographyLink props and forwards changes via onChange callback to designer-panel.svelte.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@ujl-framework/ui';
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
	<div class="relative flex w-full min-w-0 flex-col p-2">
		<div
			class="flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 ring-sidebar-ring outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0"
		>
			<CollapsibleTrigger>
				<ChevronRightIcon
					class="mr-1 transition-transform group-data-[state=open]/collapsible:rotate-90"
				/>
				Link
			</CollapsibleTrigger>
		</div>
		<CollapsibleContent>
			<div class="w-full space-y-8 p-4 text-sm">
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
			</div>
		</CollapsibleContent>
	</div>
</Collapsible>
