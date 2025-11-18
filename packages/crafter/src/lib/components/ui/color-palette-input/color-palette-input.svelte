<!--
	Color palette input component that combines a color picker with a palette preview.
	Binds directly to UJLTColorSet and handles all internal conversions (hex ↔ palette ↔ colorSet).
-->
<script lang="ts">
	import { ColorPicker, Label } from '@ujl-framework/ui';
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import type { UJLTColorSet } from '@ujl-framework/types';
	import type { GeneratedPalette } from '$lib/tools/colors/index.js';
	import {
		generateColorPalette,
		getBaseHexFromColorSet,
		generateColorSetFromHex
	} from '$lib/tools/colors/index.js';

	let {
		colorSet = $bindable<UJLTColorSet | null>(null),
		label,
		id,
		onChange,
		shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const
	}: {
		colorSet?: UJLTColorSet | null;
		label: string;
		id?: string;
		onChange?: (colorSet: UJLTColorSet) => void;
		shades?: readonly number[];
	} = $props();

	// Derive base hex from colorSet for the ColorPicker
	const baseHex = $derived.by(() => {
		if (!colorSet) return '#000000';
		try {
			return getBaseHexFromColorSet(colorSet);
		} catch {
			return '#000000';
		}
	});

	// Generate palette for preview (derived from current hex)
	const palette = $derived.by<GeneratedPalette | null>(() => {
		if (!baseHex) return null;
		try {
			return generateColorPalette(baseHex);
		} catch (error) {
			console.error('Error generating palette:', error);
			return null;
		}
	});

	// Handle color picker changes
	function handleColorChange(hex: string) {
		if (!hex) return;

		try {
			const newColorSet = generateColorSetFromHex(hex);
			colorSet = newColorSet;
			onChange?.(newColorSet);
		} catch (error) {
			console.error('Error updating color set:', error);
		}
	}

	// Filter shades to only those that exist in the palette
	const availableShades = $derived.by(() => {
		if (!palette) return [];
		return shades.filter((shade) => palette.shades[shade]);
	});
</script>

<div class="space-y-2">
	<Label for={id || `color-input-${label.toLowerCase().replace(/\s+/g, '-')}`} class="text-xs">
		{label}
	</Label>
	<ColorPicker
		id={id || `color-input-${label.toLowerCase().replace(/\s+/g, '-')}`}
		value={baseHex}
		onChange={handleColorChange}
	/>
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

			<!-- Light/Dark examples (light bg, light text, dark bg, dark text) -->
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
		</div>
	{/if}
</div>
