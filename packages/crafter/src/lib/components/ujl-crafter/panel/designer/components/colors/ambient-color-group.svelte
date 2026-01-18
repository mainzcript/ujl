<!--
	Ambient color group for the base ambient color token.
	Receives UJLTColorSet props and forwards changes via onChange callback to designer-panel.svelte.
-->
<script lang="ts">
	import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@ujl-framework/ui';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import type { UJLTColorSet, UJLTColorPalette, UJLTAmbientColorSet } from '@ujl-framework/types';
	import { ColorPaletteInput } from '../../../../../ui/index.js';

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
	<div class="relative flex w-full min-w-0 flex-col p-2">
		<div
			class="flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 ring-sidebar-ring outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0"
		>
			<CollapsibleTrigger class="flex w-full items-center gap-2">
				<ChevronRightIcon
					class="mr-1 size-5 transition-transform group-data-[state=open]/collapsible:rotate-90"
				/>
				Ambient Color
			</CollapsibleTrigger>
		</div>
		<CollapsibleContent>
			<div class="w-full space-y-8 p-4 text-sm">
				<ColorPaletteInput
					label="Ambient Color"
					id="ambient-color"
					colorSet={ambientColorSet}
					{palette}
					flavor="ambient"
					dualOriginal={true}
					onOriginalChange={onAmbientChange}
				/>
			</div>
		</CollapsibleContent>
	</div>
</Collapsible>
