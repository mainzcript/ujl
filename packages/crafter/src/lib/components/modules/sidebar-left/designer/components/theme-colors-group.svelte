<!--
	Theme Colors group component.
	
	This is a presentational component that displays UI controls for editing theme colors
	(primary, secondary, accent). It receives UJLTColorSet bindings and delegates
	all color editing to the ColorPaletteInput component.
	
	All palette generation and token updates are handled by ColorPaletteInput and the parent designer.svelte component.
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
		primaryColorSet = $bindable(),
		secondaryColorSet = $bindable(),
		accentColorSet = $bindable()
	}: {
		primaryColorSet?: UJLTColorSet | null;
		secondaryColorSet?: UJLTColorSet | null;
		accentColorSet?: UJLTColorSet | null;
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
					bind:colorSet={primaryColorSet}
				/>
				<ColorPaletteInput
					label="Secondary Color"
					id="secondary-color"
					bind:colorSet={secondaryColorSet}
				/>
				<ColorPaletteInput label="Accent Color" id="accent-color" bind:colorSet={accentColorSet} />
			</SidebarGroupContent>
		</CollapsibleContent>
	</SidebarGroup>
</Collapsible>
