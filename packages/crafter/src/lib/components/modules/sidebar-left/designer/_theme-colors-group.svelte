<!--
	Theme Colors group component.
	
	This is a presentational component that displays UI controls for editing theme colors
	(primary, secondary, accent). It receives color values, palettes, and callback functions
	as props and does not perform any palette calculations or token updates itself.
	
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
		primaryValue = $bindable(),
		primaryPalette,
		primaryOnChange,
		secondaryValue = $bindable(),
		secondaryPalette,
		secondaryOnChange,
		accentValue = $bindable(),
		accentPalette,
		accentOnChange
	}: {
		primaryValue?: string;
		primaryPalette: GeneratedPalette | null;
		primaryOnChange: (hex: string) => void;
		secondaryValue?: string;
		secondaryPalette: GeneratedPalette | null;
		secondaryOnChange: (hex: string) => void;
		accentValue?: string;
		accentPalette: GeneratedPalette | null;
		accentOnChange: (hex: string) => void;
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
				<!-- Primary color input -->
				<div class="space-y-2">
					<Label for="primary-color" class="text-xs">Primary Color</Label>
					<ColorPicker
						id="primary-color"
						bind:value={primaryValue}
						onChange={(value) => primaryOnChange(value)}
					/>
					<ColorPalettePreview palette={primaryPalette} />
				</div>

				<!-- Secondary color input -->
				<div class="space-y-2">
					<Label for="secondary-color" class="text-xs">Secondary Color</Label>
					<ColorPicker
						id="secondary-color"
						bind:value={secondaryValue}
						onChange={(value) => secondaryOnChange(value)}
					/>
					<ColorPalettePreview palette={secondaryPalette} />
				</div>

				<!-- Accent color input -->
				<div class="space-y-2">
					<Label for="accent-color" class="text-xs">Accent Color</Label>
					<ColorPicker
						id="accent-color"
						bind:value={accentValue}
						onChange={(value) => accentOnChange(value)}
					/>
					<ColorPalettePreview palette={accentPalette} />
				</div>
			</SidebarGroupContent>
		</CollapsibleContent>
	</SidebarGroup>
</Collapsible>
