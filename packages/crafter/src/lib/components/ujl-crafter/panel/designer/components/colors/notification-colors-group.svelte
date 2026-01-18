<!--
	Notification colors group for success, warning, destructive and info tokens.
	Receives UJLTColorSet props and forwards changes via on*Change callbacks to designer-panel.svelte.
-->
<script lang="ts">
	import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@ujl-framework/ui';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import type { UJLTColorSet, UJLTColorPalette } from '@ujl-framework/types';
	import { ColorPaletteInput } from '../../../../../ui/index.js';

	let {
		palette,
		successColorSet,
		warningColorSet,
		destructiveColorSet,
		infoColorSet,
		onSuccessChange,
		onWarningChange,
		onDestructiveChange,
		onInfoChange
	}: {
		palette: UJLTColorPalette;
		successColorSet: UJLTColorSet | null;
		warningColorSet: UJLTColorSet | null;
		destructiveColorSet: UJLTColorSet | null;
		infoColorSet: UJLTColorSet | null;
		onSuccessChange?: (hex: string) => void;
		onWarningChange?: (hex: string) => void;
		onDestructiveChange?: (hex: string) => void;
		onInfoChange?: (hex: string) => void;
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
				Notification Colors
			</CollapsibleTrigger>
		</div>
		<CollapsibleContent>
			<div class="w-full space-y-8 p-4 text-sm">
				<ColorPaletteInput
					label="Success Color"
					id="success-color"
					colorSet={successColorSet}
					{palette}
					flavor="success"
					onChange={onSuccessChange}
				/>
				<ColorPaletteInput
					label="Warning Color"
					id="warning-color"
					colorSet={warningColorSet}
					{palette}
					flavor="warning"
					onChange={onWarningChange}
				/>
				<ColorPaletteInput
					label="Destructive Color"
					id="destructive-color"
					colorSet={destructiveColorSet}
					{palette}
					flavor="destructive"
					onChange={onDestructiveChange}
				/>
				<ColorPaletteInput
					label="Info Color"
					id="info-color"
					colorSet={infoColorSet}
					{palette}
					flavor="info"
					onChange={onInfoChange}
				/>
			</div>
		</CollapsibleContent>
	</div>
</Collapsible>
