<!--
	Theme colors group for primary, secondary and accent tokens.
	Receives UJLTColorSet props and forwards changes via on*Change callbacks to designer-panel.svelte.
-->
<script lang="ts">
	import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@ujl-framework/ui';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import type { UJLTColorSet, UJLTColorPalette } from '@ujl-framework/types';
	import { ColorPaletteInput } from '$lib/components/ui/index.js';

	let {
		palette,
		primaryColorSet,
		secondaryColorSet,
		accentColorSet,
		onPrimaryChange,
		onSecondaryChange,
		onAccentChange
	}: {
		palette: UJLTColorPalette;
		primaryColorSet: UJLTColorSet | null;
		secondaryColorSet: UJLTColorSet | null;
		accentColorSet: UJLTColorSet | null;
		onPrimaryChange?: (hex: string) => void;
		onSecondaryChange?: (hex: string) => void;
		onAccentChange?: (hex: string) => void;
	} = $props();
</script>

<Collapsible class="group/collapsible">
	<div class="relative flex w-full min-w-0 flex-col p-2">
		<div
			class="flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 ring-sidebar-ring outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0"
		>
			<CollapsibleTrigger class="flex w-full items-center gap-2">
				<ChevronRightIcon
					class="mr-1 size-5 transition-transform group-data-[state=open]/collapsible:rotate-90"
				/>
				Theme Colors
			</CollapsibleTrigger>
		</div>
		<CollapsibleContent>
			<div class="w-full space-y-8 p-4 text-sm">
				<ColorPaletteInput
					label="Primary Color"
					id="primary-color"
					colorSet={primaryColorSet}
					{palette}
					flavor="primary"
					onChange={onPrimaryChange}
				/>
				<ColorPaletteInput
					label="Secondary Color"
					id="secondary-color"
					colorSet={secondaryColorSet}
					{palette}
					flavor="secondary"
					onChange={onSecondaryChange}
				/>
				<ColorPaletteInput
					label="Accent Color"
					id="accent-color"
					colorSet={accentColorSet}
					{palette}
					flavor="accent"
					onChange={onAccentChange}
				/>
			</div>
		</CollapsibleContent>
	</div>
</Collapsible>
