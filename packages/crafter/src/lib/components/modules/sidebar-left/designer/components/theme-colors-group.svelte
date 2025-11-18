<!--
	Theme colors group for primary, secondary and accent tokens.
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
	import type { UJLTColorSet } from '@ujl-framework/types';
	import { ColorPaletteInput } from '$lib/components/ui/color-palette-input/index.js';

	let {
		primaryColorSet,
		secondaryColorSet,
		accentColorSet,
		onPrimaryChange,
		onSecondaryChange,
		onAccentChange
	}: {
		primaryColorSet: UJLTColorSet | null;
		secondaryColorSet: UJLTColorSet | null;
		accentColorSet: UJLTColorSet | null;
		onPrimaryChange?: (set: UJLTColorSet) => void;
		onSecondaryChange?: (set: UJLTColorSet) => void;
		onAccentChange?: (set: UJLTColorSet) => void;
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
					Theme Colors
				</CollapsibleTrigger>
			{/snippet}
		</SidebarGroupLabel>
		<CollapsibleContent>
			<SidebarGroupContent class="space-y-8 p-4">
				<ColorPaletteInput
					label="Primary Color"
					id="primary-color"
					colorSet={primaryColorSet}
					onChange={onPrimaryChange}
				/>
				<ColorPaletteInput
					label="Secondary Color"
					id="secondary-color"
					colorSet={secondaryColorSet}
					onChange={onSecondaryChange}
				/>
				<ColorPaletteInput
					label="Accent Color"
					id="accent-color"
					colorSet={accentColorSet}
					onChange={onAccentChange}
				/>
			</SidebarGroupContent>
		</CollapsibleContent>
	</SidebarGroup>
</Collapsible>
