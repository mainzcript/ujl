<!--
	Notification Colors group component.
	
	This is a presentational component that displays UI controls for editing notification colors
	(success, warning, destructive, info). It receives UJLTColorSet bindings and delegates
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
		successColorSet = $bindable(),
		warningColorSet = $bindable(),
		destructiveColorSet = $bindable(),
		infoColorSet = $bindable()
	}: {
		successColorSet?: UJLTColorSet | null;
		warningColorSet?: UJLTColorSet | null;
		destructiveColorSet?: UJLTColorSet | null;
		infoColorSet?: UJLTColorSet | null;
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
					bind:colorSet={successColorSet}
				/>
				<ColorPaletteInput
					label="Warning Color"
					id="warning-color"
					bind:colorSet={warningColorSet}
				/>
				<ColorPaletteInput
					label="Destructive Color"
					id="destructive-color"
					bind:colorSet={destructiveColorSet}
				/>
				<ColorPaletteInput label="Info Color" id="info-color" bind:colorSet={infoColorSet} />
			</SidebarGroupContent>
		</CollapsibleContent>
	</SidebarGroup>
</Collapsible>
