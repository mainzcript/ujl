<!--
	Notification colors group for success, warning, destructive and info tokens.
	Receives UJLTColorSet props and forwards changes via on*Change callbacks to designer.svelte.
-->
<script lang="ts">
	import {
		SidebarGroup,
		SidebarGroupLabel,
		SidebarGroupContent,
		Collapsible,
		CollapsibleTrigger,
		CollapsibleContent
	} from '@ujl-framework/ui';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import type { UJLTColorSet, UJLTColorPalette } from '@ujl-framework/types';
	import { ColorPaletteInput } from '$lib/components/ui/color-palette-input/index.js';

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

<Collapsible open class="group/collapsible">
	<SidebarGroup>
		<SidebarGroupLabel>
			{#snippet child({ props })}
				<CollapsibleTrigger {...props}>
					<ChevronRightIcon
						class="mr-1 transition-transform group-data-[state=open]/collapsible:rotate-90"
					/>
					Notification Colors
				</CollapsibleTrigger>
			{/snippet}
		</SidebarGroupLabel>
		<CollapsibleContent>
			<SidebarGroupContent class="space-y-8 p-4">
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
			</SidebarGroupContent>
		</CollapsibleContent>
	</SidebarGroup>
</Collapsible>
