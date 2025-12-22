<!--
	Ambient color group for the base ambient color token.
	Receives UJLTColorSet props and forwards changes via onChange callback to designer.svelte.
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
	import type { UJLTColorSet, UJLTColorPalette, UJLTAmbientColorSet } from '@ujl-framework/types';
	import { ColorPaletteInput } from '$lib/components/ui/index.js';

	let {
		palette,
		ambientColorSet,
		onAmbientChange
	}: {
		palette: UJLTColorPalette;
		ambientColorSet: UJLTColorSet | null;
		onAmbientChange?: (original: UJLTAmbientColorSet['_original']) => void;
	} = $props();
</script>

<Collapsible class="group/collapsible">
	<SidebarGroup>
		<SidebarGroupLabel>
			{#snippet child({ props })}
				<CollapsibleTrigger {...props}>
					<ChevronRightIcon
						class="mr-1 transition-transform group-data-[state=open]/collapsible:rotate-90"
					/>
					Ambient Color
				</CollapsibleTrigger>
			{/snippet}
		</SidebarGroupLabel>
		<CollapsibleContent>
			<SidebarGroupContent class="space-y-8 p-4">
				<ColorPaletteInput
					label="Ambient Color"
					id="ambient-color"
					colorSet={ambientColorSet}
					{palette}
					flavor="ambient"
					dualOriginal={true}
					onOriginalChange={onAmbientChange}
				/>
			</SidebarGroupContent>
		</CollapsibleContent>
	</SidebarGroup>
</Collapsible>
