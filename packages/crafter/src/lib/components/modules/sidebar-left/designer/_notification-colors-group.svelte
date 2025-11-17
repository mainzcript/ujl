<!--
	Notification Colors group component.
	
	This is a presentational component that displays UI controls for editing notification colors
	(success, warning, destructive, info). It receives color values, palettes, and callback functions
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
		successValue = $bindable(),
		successPalette,
		successOnChange,
		warningValue = $bindable(),
		warningPalette,
		warningOnChange,
		destructiveValue = $bindable(),
		destructivePalette,
		destructiveOnChange,
		infoValue = $bindable(),
		infoPalette,
		infoOnChange
	}: {
		successValue?: string;
		successPalette: GeneratedPalette | null;
		successOnChange: (hex: string) => void;
		warningValue?: string;
		warningPalette: GeneratedPalette | null;
		warningOnChange: (hex: string) => void;
		destructiveValue?: string;
		destructivePalette: GeneratedPalette | null;
		destructiveOnChange: (hex: string) => void;
		infoValue?: string;
		infoPalette: GeneratedPalette | null;
		infoOnChange: (hex: string) => void;
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
				<!-- Success color input -->
				<div class="space-y-2">
					<Label for="success-color" class="text-xs">Success Color</Label>
					<ColorPicker
						id="success-color"
						bind:value={successValue}
						onChange={(value) => successOnChange(value)}
					/>
					<ColorPalettePreview palette={successPalette} />
				</div>

				<!-- Warning color input -->
				<div class="space-y-2">
					<Label for="warning-color" class="text-xs">Warning Color</Label>
					<ColorPicker
						id="warning-color"
						bind:value={warningValue}
						onChange={(value) => warningOnChange(value)}
					/>
					<ColorPalettePreview palette={warningPalette} />
				</div>

				<!-- Destructive color input -->
				<div class="space-y-2">
					<Label for="destructive-color" class="text-xs">Destructive Color</Label>
					<ColorPicker
						id="destructive-color"
						bind:value={destructiveValue}
						onChange={(value) => destructiveOnChange(value)}
					/>
					<ColorPalettePreview palette={destructivePalette} />
				</div>

				<!-- Info color input -->
				<div class="space-y-2">
					<Label for="info-color" class="text-xs">Info Color</Label>
					<ColorPicker
						id="info-color"
						bind:value={infoValue}
						onChange={(value) => infoOnChange(value)}
					/>
					<ColorPalettePreview palette={infoPalette} />
				</div>
			</SidebarGroupContent>
		</CollapsibleContent>
	</SidebarGroup>
</Collapsible>
