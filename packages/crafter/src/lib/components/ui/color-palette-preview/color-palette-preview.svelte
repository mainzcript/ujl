<!--
	Reusable color palette preview component.
	
	This component displays a visual preview of a generated color palette, including:
	- Shade stripes showing all available shades (50-950)
	- Light/dark mode examples with foreground colors
	- Text color examples on light/dark backgrounds
	
	The component is "dumb" - it only displays the provided palette structure and does not
	perform any palette calculations. All palette generation logic remains in the Crafter package.
	
	This component can be used for both regular color palettes (primary, secondary, etc.) and
	ambient palettes, though ambient palettes may use a different layout via the `mode` prop.
-->
<script lang="ts">
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import type { GeneratedPalette } from '$lib/tools/colors/index.js';

	/**
	 * Preview mode determines the layout:
	 * - "default": Shows shade stripes + 4 light/dark examples (for theme/notification colors)
	 * - "ambient": Shows shade stripes + 2 text examples (for ambient palette)
	 */
	type PreviewMode = 'default' | 'ambient';

	let {
		palette,
		mode = 'default' as PreviewMode,
		shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const
	}: {
		palette: GeneratedPalette | null;
		mode?: PreviewMode;
		shades?: readonly number[];
	} = $props();

	// Filter shades to only those that exist in the palette
	const availableShades = $derived.by(() => {
		if (!palette) return [];
		return shades.filter((shade) => palette.shades[shade]);
	});
</script>

{#if palette}
	<div class="space-y-2 pt-2">
		<!-- Shade stripes -->
		<div
			class="grid overflow-hidden rounded border border-border"
			style="grid-template-columns: repeat({availableShades.length}, minmax(0, 1fr));"
		>
			{#each availableShades as shade (shade)}
				<div
					class="h-6"
					style="background-color: {palette.shades[shade].hex};"
					title="Shade {shade}: {palette.shades[shade].hex}"
				></div>
			{/each}
		</div>

		<!-- Light/Dark examples -->
		{#if mode === 'default'}
			<!-- Default mode: 4 examples (light bg, light text, dark bg, dark text) -->
			<div class="grid grid-cols-4 gap-2">
				<div class="rounded border border-border" style="background-color: {palette.light.hex};">
					<div style="color: {palette.lightFg.hex};" class="flex h-6 items-center justify-center">
						<SunIcon size="14" />
					</div>
				</div>
				<div class="rounded border border-border bg-white">
					<div style="color: {palette.lightText.hex};" class="flex h-6 items-center justify-center">
						<SunIcon class="h-4 w-4" />
					</div>
				</div>
				<div class="rounded border border-border" style="background-color: {palette.dark.hex};">
					<div style="color: {palette.darkFg.hex};" class="flex h-6 items-center justify-center">
						<MoonIcon class="h-4 w-4" />
					</div>
				</div>
				<div class="rounded border border-border bg-black">
					<div style="color: {palette.darkText.hex};" class="flex h-6 items-center justify-center">
						<MoonIcon class="h-4 w-4" />
					</div>
				</div>
			</div>
		{:else if mode === 'ambient'}
			<!-- Ambient mode: 2 text examples only -->
			<div class="grid grid-cols-2 gap-2">
				<div class="rounded border border-border bg-white">
					<div style="color: {palette.lightText.hex};" class="flex h-6 items-center justify-center">
						<SunIcon class="h-4 w-4" />
					</div>
				</div>
				<div class="rounded border border-border bg-black">
					<div style="color: {palette.darkText.hex};" class="flex h-6 items-center justify-center">
						<MoonIcon class="h-4 w-4" />
					</div>
				</div>
			</div>
		{/if}
	</div>
{/if}
