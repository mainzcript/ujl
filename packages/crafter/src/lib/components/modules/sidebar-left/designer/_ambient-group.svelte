<!--
	Ambient Colors group component.
	
	This is a presentational component that displays UI controls for editing ambient colors
	(light and dark mode base colors). It receives palette data and callback functions as props
	and does not perform any palette calculations or token updates itself.
	
	All palette generation and token updates are handled by the parent designer.svelte component.
-->
<script lang="ts">
	import {
		SidebarGroup,
		SidebarGroupLabel,
		SidebarGroupContent,
		ColorPicker,
		Label,
		Collapsible,
		CollapsibleTrigger,
		CollapsibleContent
	} from '@ujl-framework/ui';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import type { GeneratedPalette } from '$lib/tools/colorPlate.js';
	import { ColorPalettePreview } from '$lib/components/ui/color-palette-preview/index.js';

	let {
		ambientLightValue,
		ambientDarkValue,
		ambientPalette,
		onLightChange,
		onDarkChange
	}: {
		ambientLightValue: string;
		ambientDarkValue: string;
		ambientPalette: GeneratedPalette | null;
		onLightChange: (hex: string) => void;
		onDarkChange: (hex: string) => void;
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
					Ambient Colors
				</CollapsibleTrigger>
			{/snippet}
		</SidebarGroupLabel>
		<CollapsibleContent>
			<SidebarGroupContent class="space-y-4 p-4">
				<!-- Light color input -->
				<div class="space-y-2">
					<Label for="ambient-light" class="text-xs">Light</Label>
					<ColorPicker
						id="ambient-light"
						bind:value={ambientLightValue}
						onChange={(value) => onLightChange(value)}
					/>
				</div>

				<!-- Dark color input -->
				<div class="space-y-2">
					<Label for="ambient-dark" class="text-xs">Dark</Label>
					<ColorPicker
						id="ambient-dark"
						bind:value={ambientDarkValue}
						onChange={(value) => onDarkChange(value)}
					/>
				</div>

				<!-- Final interpolated ambient palette -->
				{#if ambientPalette}
					<ColorPalettePreview palette={ambientPalette} mode="ambient" />
				{/if}
			</SidebarGroupContent>
		</CollapsibleContent>
	</SidebarGroup>
</Collapsible>
