<!--
	Color palette input component that combines a color picker with a palette preview.
	Receives colorSet as a read-only prop and communicates changes via onChange callback.
	Visualizes key foreground/background combinations from the new color system.
-->
<script lang="ts">
	import { ColorPicker, Label } from '@ujl-framework/ui';
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import type {
		UJLTColorSet,
		UJLTShadeKey,
		UJLTColorPalette,
		UJLTFlavor,
		UJLTAmbientColorSet
	} from '@ujl-framework/types';
	import {
		colorShades,
		resolveColorFromShades,
		resolveForegroundColor
	} from '@ujl-framework/types';
	import { getBaseHexFromColorSet, formatOklch } from '$lib/utils/colors/index.js';

	type PreviewSample = {
		lightBg: string;
		darkBg: string;
		lightFg: string;
		darkFg: string;
	};

	let {
		colorSet,
		label,
		id,
		onChange,
		onOriginalChange,
		palette,
		flavor,
		dualOriginal = false
	}: {
		colorSet: UJLTColorSet | null;
		label: string;
		id?: string;
		onChange?: (hex: string) => void;
		onOriginalChange?: (original: UJLTAmbientColorSet['_original']) => void;
		palette: UJLTColorPalette;
		flavor: UJLTFlavor;
		dualOriginal?: boolean;
	} = $props();

	// Tracks the exact last color chosen via the ColorPicker (single-color mode).
	// If null, the picker derives an initial value from the current colorSet.
	let userHex = $state<string | null>(null);

	// Tracks the exact last colors chosen via the ColorPickers in dual-color mode.
	let userLightHex = $state<string | null>(null);
	let userDarkHex = $state<string | null>(null);

	// Value shown in the ColorPicker:
	// - uses the exact last user input (userHex) if available
	// - otherwise derives a stable initial value from the theme tokens
	const pickerHex = $derived.by(() => {
		if (userHex) return userHex;
		if (!colorSet) return '#000000';
		return getBaseHexFromColorSet(colorSet);
	});

	const lightPickerHex = $derived.by(() => {
		if (userLightHex) return userLightHex;
		if (!colorSet) return '#000000';

		const original = colorSet._original;
		if ('lightHex' in original) {
			return original.lightHex;
		}

		return original.hex;
	});

	const darkPickerHex = $derived.by(() => {
		if (userDarkHex) return userDarkHex;
		if (!colorSet) return '#000000';

		const original = colorSet._original;
		if ('lightHex' in original) {
			return original.darkHex;
		}

		return original.hex;
	});

	// Shades preview: formatted OKLCH strings for all shades of the current flavor
	const shadePreview = $derived.by<Record<UJLTShadeKey, string> | null>(() => {
		if (!colorSet) return null;

		const shades: Partial<Record<UJLTShadeKey, string>> = {};
		for (const shade of colorShades) {
			const oklch = colorSet.shades[shade];
			if (oklch) {
				shades[shade] = formatOklch(oklch);
			}
		}

		return shades as Record<UJLTShadeKey, string>;
	});

	// Available shades for rendering (only those that exist)
	const availableShades = $derived.by(() => {
		if (!shadePreview) return [];
		return colorShades.filter((shade) => shadePreview[shade]);
	});

	// Preview: Flavor on Ambient (foreground) + Ambient on Flavor (foreground)
	const preview = $derived.by<PreviewSample | null>(() => {
		if (!palette || !flavor) return null;

		const ambientSet = palette.ambient;

		// Resolve background colors from shade references
		const lightBg = resolveColorFromShades(ambientSet.shades, ambientSet.light);
		const darkBg = resolveColorFromShades(ambientSet.shades, ambientSet.dark);

		// Resolve foreground colors from shade references
		const lightFg = resolveForegroundColor(palette, 'ambient', flavor, 'light');
		const darkFg = resolveForegroundColor(palette, 'ambient', flavor, 'dark');

		return {
			// Flavor on Ambient: ambient background, flavor foreground
			lightBg: formatOklch(lightBg),
			darkBg: formatOklch(darkBg),
			lightFg: formatOklch(lightFg),
			darkFg: formatOklch(darkFg)
		};
	});

	// Preview: Ambient on Flavor (foreground)
	const ambientOnFlavor = $derived.by<PreviewSample | null>(() => {
		if (!palette || !flavor) return null;

		const flavorSet = palette[flavor];

		// Resolve background colors from shade references
		const lightBg = resolveColorFromShades(flavorSet.shades, flavorSet.light);
		const darkBg = resolveColorFromShades(flavorSet.shades, flavorSet.dark);

		// Resolve foreground colors from shade references
		const lightFg = resolveForegroundColor(palette, flavor, 'ambient', 'light');
		const darkFg = resolveForegroundColor(palette, flavor, 'ambient', 'dark');

		return {
			// Ambient on Flavor: flavor background, ambient foreground
			lightBg: formatOklch(lightBg),
			darkBg: formatOklch(darkBg),
			lightFg: formatOklch(lightFg),
			darkFg: formatOklch(darkFg)
		};
	});

	// Handle color picker changes (single-color mode)
	function handleColorChange(hex: string) {
		if (!hex) return;

		// Remember the exact user input so the picker never snaps back
		// to a derived theme color.
		userHex = hex;

		if (!onChange) return;
		onChange(hex);
	}

	function emitOriginalChange() {
		if (!onOriginalChange || !colorSet) return;

		const baseOriginal = colorSet._original;

		const baseLightHex = 'lightHex' in baseOriginal ? baseOriginal.lightHex : baseOriginal.hex;
		const baseDarkHex = 'lightHex' in baseOriginal ? baseOriginal.darkHex : baseOriginal.hex;

		// Use user input if available, otherwise fall back to base values
		// Note: The "Light" picker (userLightHex) should correspond to lightHex (lighter color)
		// The "Dark" picker (userDarkHex) should correspond to darkHex (darker color)
		const lightHex = userLightHex ?? baseLightHex;
		const darkHex = userDarkHex ?? baseDarkHex;

		onOriginalChange({
			lightHex: lightHex,
			darkHex: darkHex
		});
	}

	function handleLightColorChange(hex: string) {
		if (!hex) return;

		userLightHex = hex;
		emitOriginalChange();
	}

	function handleDarkColorChange(hex: string) {
		if (!hex) return;

		userDarkHex = hex;
		emitOriginalChange();
	}
</script>

<div class="space-y-2">
	<Label for={id || `color-input-${label.toLowerCase().replace(/\s+/g, '-')}`} class="text-xs">
		{label}
	</Label>
	{#if !dualOriginal}
		<ColorPicker
			id={id || `color-input-${label.toLowerCase().replace(/\s+/g, '-')}`}
			value={pickerHex}
			onChange={handleColorChange}
		/>
	{:else}
		<div class="grid grid-cols-2 gap-2">
			<div class="space-y-1">
				<div class="text-[0.65rem] text-muted-foreground">Light</div>
				<ColorPicker
					id={(id || `color-input-${label.toLowerCase().replace(/\s+/g, '-')}`) + '-light'}
					value={lightPickerHex}
					onChange={handleLightColorChange}
				/>
			</div>
			<div class="space-y-1">
				<div class="text-[0.65rem] text-muted-foreground">Dark</div>
				<ColorPicker
					id={(id || `color-input-${label.toLowerCase().replace(/\s+/g, '-')}`) + '-dark'}
					value={darkPickerHex}
					onChange={handleDarkColorChange}
				/>
			</div>
		</div>
	{/if}

	{#if shadePreview}
		<div class="space-y-3 pt-2">
			<!-- Shades preview -->
			<div
				class="grid overflow-hidden rounded border border-border"
				style="grid-template-columns: repeat({availableShades.length}, minmax(0, 1fr));"
			>
				{#each availableShades as shade (shade)}
					<div
						class="h-6"
						style={`background-color: oklch(${shadePreview[shade]});`}
						title={`Shade ${shade}: oklch(${shadePreview[shade]})`}
					></div>
				{/each}
			</div>

			{#if preview}
				{#if flavor === 'ambient'}
					<!-- For ambient flavor, only show one preview (ambient on ambient) -->
					<div class="grid grid-cols-2 gap-2">
						<!-- Ambient on Ambient - Light -->
						<div class="space-y-1">
							<div
								class="rounded border border-border"
								style={`background-color: oklch(${preview.lightBg});`}
							>
								<div
									class="flex h-6 items-center justify-center"
									style={`color: oklch(${preview.lightFg});`}
								>
									<SunIcon size="14" />
								</div>
							</div>
						</div>

						<!-- Ambient on Ambient - Dark -->
						<div class="space-y-1">
							<div
								class="rounded border border-border"
								style={`background-color: oklch(${preview.darkBg});`}
							>
								<div
									class="flex h-6 items-center justify-center"
									style={`color: oklch(${preview.darkFg});`}
								>
									<MoonIcon size="14" />
								</div>
							</div>
						</div>
					</div>
				{:else if ambientOnFlavor}
					<!-- For non-ambient flavors, show both previews (flavor on ambient + ambient on flavor) -->
					<div class="grid grid-cols-4 gap-2">
						<!-- Flavor on Ambient - Light -->
						<div class="space-y-1">
							<div
								class="rounded border border-border"
								style={`background-color: oklch(${preview.lightBg});`}
							>
								<div
									class="flex h-6 items-center justify-center"
									style={`color: oklch(${preview.lightFg});`}
								>
									<SunIcon size="14" />
								</div>
							</div>
						</div>

						<!-- Flavor on Ambient - Dark -->
						<div class="space-y-1">
							<div
								class="rounded border border-border"
								style={`background-color: oklch(${preview.darkBg});`}
							>
								<div
									class="flex h-6 items-center justify-center"
									style={`color: oklch(${preview.darkFg});`}
								>
									<MoonIcon size="14" />
								</div>
							</div>
						</div>

						<!-- Ambient on Flavor - Light -->
						<div class="space-y-1">
							<div
								class="rounded border border-border"
								style={`background-color: oklch(${ambientOnFlavor.lightBg});`}
							>
								<div
									class="flex h-6 items-center justify-center"
									style={`color: oklch(${ambientOnFlavor.lightFg});`}
								>
									<SunIcon size="14" />
								</div>
							</div>
						</div>

						<!-- Ambient on Flavor - Dark -->
						<div class="space-y-1">
							<div
								class="rounded border border-border"
								style={`background-color: oklch(${ambientOnFlavor.darkBg});`}
							>
								<div
									class="flex h-6 items-center justify-center"
									style={`color: oklch(${ambientOnFlavor.darkFg});`}
								>
									<MoonIcon size="14" />
								</div>
							</div>
						</div>
					</div>
				{/if}
			{/if}
		</div>
	{/if}
</div>
