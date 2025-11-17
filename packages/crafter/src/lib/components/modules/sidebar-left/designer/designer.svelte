<script lang="ts">
	import {
		SidebarGroup,
		SidebarGroupLabel,
		SidebarGroupContent,
		ColorPicker,
		Label,
		Slider,
		Text,
		Collapsible,
		CollapsibleTrigger,
		CollapsibleContent
	} from '@ujl-framework/ui';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import { getContext } from 'svelte';
	import type { UJLTTokenSet, UJLTFlavor } from '@ujl-framework/types';
	import {
		generateColorPalette,
		interpolateAmbientPalette,
		getReferencePalette,
		oklchToHex,
		type GeneratedPalette
	} from '$lib/tools/colorPlate.js';
	import { mapGeneratedPaletteToColorSet } from '$lib/tools/paletteToColorSet.js';
	import { CRAFTER_CONTEXT, type CrafterContext } from '../../context.js';
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';

	let { tokens }: { tokens: UJLTTokenSet } = $props();

	// Get context API for mutations
	const crafter = getContext<CrafterContext>(CRAFTER_CONTEXT);

	// Local input states for color pickers (null means use value from tokens)
	let ambientLightInput = $state<string | null>(null);
	let ambientDarkInput = $state<string | null>(null);
	let primaryInput = $state<string | null>(null);
	let secondaryInput = $state<string | null>(null);
	let accentInput = $state<string | null>(null);
	let successInput = $state<string | null>(null);
	let warningInput = $state<string | null>(null);
	let destructiveInput = $state<string | null>(null);
	let infoInput = $state<string | null>(null);

	// Computed values for ColorPicker bindings (derived from inputs and tokens)
	// Initialize with values from tokens
	let ambientLightValue = $state(getAmbientColor(true, null));
	let ambientDarkValue = $state(getAmbientColor(false, null));
	let primaryValue = $state(getColorValue('primary', null));
	let secondaryValue = $state(getColorValue('secondary', null));
	let accentValue = $state(getColorValue('accent', null));
	let successValue = $state(getColorValue('success', null));
	let warningValue = $state(getColorValue('warning', null));
	let destructiveValue = $state(getColorValue('destructive', null));
	let infoValue = $state(getColorValue('info', null));

	// Update computed values when tokens or inputs change
	$effect(() => {
		ambientLightValue = getAmbientColor(true, ambientLightInput);
		ambientDarkValue = getAmbientColor(false, ambientDarkInput);
		primaryValue = getColorValue('primary', primaryInput);
		secondaryValue = getColorValue('secondary', secondaryInput);
		accentValue = getColorValue('accent', accentInput);
		successValue = getColorValue('success', successInput);
		warningValue = getColorValue('warning', warningInput);
		destructiveValue = getColorValue('destructive', destructiveInput);
		infoValue = getColorValue('info', infoInput);
	});

	// Radius state
	let radiusInput = $state<number | null>(null);

	// Helper function to get color value for ColorPicker
	function getColorValue(flavor: UJLTFlavor, input: string | null): string {
		if (input !== null) {
			return input;
		}
		// Extract from tokens - use shade 500 as base color
		const colorSet = tokens.color[flavor];
		if (colorSet && colorSet.shades[500]) {
			return oklchToHex(colorSet.shades[500]);
		}
		return '#000000'; // Fallback
	}

	// Helper function to get ambient light/dark color
	function getAmbientColor(isLight: boolean, input: string | null): string {
		if (input !== null) {
			return input;
		}
		const colorSet = tokens.color.ambient;
		if (isLight && colorSet.light) {
			return oklchToHex(colorSet.light);
		}
		if (!isLight && colorSet.dark) {
			return oklchToHex(colorSet.dark);
		}
		return isLight ? '#fafafa' : '#09090b'; // Fallback
	}

	// Helper function to get radius value
	function getRadiusValue(): number {
		if (radiusInput !== null) {
			return radiusInput;
		}
		// Parse radius from tokens (e.g., "0.75rem" -> 0.75)
		const radiusStr = tokens.radius;
		const match = radiusStr.match(/^([\d.]+)/);
		return match ? Number.parseFloat(match[1]) : 0.75;
	}

	// Generated palettes for all colors
	let ambientLightPalette = $derived.by(() => {
		try {
			const color = getAmbientColor(true, ambientLightInput);
			return generateColorPalette(color);
		} catch (error) {
			console.error('Error generating ambient light palette:', error);
			return null;
		}
	});

	let ambientDarkPalette = $derived.by(() => {
		try {
			const color = getAmbientColor(false, ambientDarkInput);
			return generateColorPalette(color);
		} catch (error) {
			console.error('Error generating ambient dark palette:', error);
			return null;
		}
	});

	// Mid palette (zinc reference palette)
	let ambientMidPalette = $derived.by(() => {
		try {
			return getReferencePalette('zinc');
		} catch (error) {
			console.error('Error getting zinc reference palette:', error);
			return null;
		}
	});

	// Final ambient palette interpolated from light, mid (zinc), and dark
	let ambientPalette = $derived.by(() => {
		if (!ambientLightPalette || !ambientMidPalette || !ambientDarkPalette) {
			return null;
		}
		try {
			return interpolateAmbientPalette(ambientLightPalette, ambientMidPalette, ambientDarkPalette);
		} catch (error) {
			console.error('Error interpolating ambient palette:', error);
			return null;
		}
	});

	let primaryPalette = $derived.by(() => {
		try {
			const color = getColorValue('primary', primaryInput);
			return generateColorPalette(color);
		} catch (error) {
			console.error('Error generating primary palette:', error);
			return null;
		}
	});

	let secondaryPalette = $derived.by(() => {
		try {
			const color = getColorValue('secondary', secondaryInput);
			return generateColorPalette(color);
		} catch (error) {
			console.error('Error generating secondary palette:', error);
			return null;
		}
	});

	let accentPalette = $derived.by(() => {
		try {
			const color = getColorValue('accent', accentInput);
			return generateColorPalette(color);
		} catch (error) {
			console.error('Error generating accent palette:', error);
			return null;
		}
	});

	let successPalette = $derived.by(() => {
		try {
			const color = getColorValue('success', successInput);
			return generateColorPalette(color);
		} catch (error) {
			console.error('Error generating success palette:', error);
			return null;
		}
	});

	let warningPalette = $derived.by(() => {
		try {
			const color = getColorValue('warning', warningInput);
			return generateColorPalette(color);
		} catch (error) {
			console.error('Error generating warning palette:', error);
			return null;
		}
	});

	let destructivePalette = $derived.by(() => {
		try {
			const color = getColorValue('destructive', destructiveInput);
			return generateColorPalette(color);
		} catch (error) {
			console.error('Error generating destructive palette:', error);
			return null;
		}
	});

	let infoPalette = $derived.by(() => {
		try {
			const color = getColorValue('info', infoInput);
			return generateColorPalette(color);
		} catch (error) {
			console.error('Error generating info palette:', error);
			return null;
		}
	});

	// Handler functions for color changes
	function handleColorChange(flavor: UJLTFlavor, hex: string) {
		if (!hex) return;

		try {
			const newPalette = generateColorPalette(hex);
			const colorSet = mapGeneratedPaletteToColorSet(newPalette);

			crafter.updateTokenSet((oldTokens) => ({
				...oldTokens,
				color: {
					...oldTokens.color,
					[flavor]: colorSet
				}
			}));
		} catch (error) {
			console.error(`Error updating ${flavor} color:`, error);
		}
	}

	function handleAmbientLightChange(hex: string) {
		if (!hex) return;
		ambientLightInput = hex;
		// Update tokens after a short delay to ensure ambientPalette is computed
		setTimeout(() => {
			if (ambientPalette) {
				const colorSet = mapGeneratedPaletteToColorSet(ambientPalette);
				crafter.updateTokenSet((oldTokens) => ({
					...oldTokens,
					color: {
						...oldTokens.color,
						ambient: colorSet
					}
				}));
			}
		}, 0);
	}

	function handleAmbientDarkChange(hex: string) {
		if (!hex) return;
		ambientDarkInput = hex;
		// Update tokens after a short delay to ensure ambientPalette is computed
		setTimeout(() => {
			if (ambientPalette) {
				const colorSet = mapGeneratedPaletteToColorSet(ambientPalette);
				crafter.updateTokenSet((oldTokens) => ({
					...oldTokens,
					color: {
						...oldTokens.color,
						ambient: colorSet
					}
				}));
			}
		}, 0);
	}

	function handleRadiusChange(value: number) {
		radiusInput = value;
		crafter.updateTokenSet((oldTokens) => ({
			...oldTokens,
			radius: `${value}rem`
		}));
	}

	let radiusValue = $state(getRadiusValue());

	// Watch for radius changes
	$effect(() => {
		const tokenValue = getRadiusValue();
		if (radiusValue !== tokenValue) {
			handleRadiusChange(radiusValue);
		}
	});

	const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
</script>

{#snippet palettePreview(palette: GeneratedPalette | null)}
	{#if palette}
		<div class="space-y-2 pt-2">
			<div class="grid grid-cols-11 overflow-hidden rounded border border-border">
				{#each SHADES as shade (shade)}
					{#if palette.shades[shade]}
						<div
							class="h-6"
							style="background-color: {palette.shades[shade].hex};"
							title="Shade {shade}: {palette.shades[shade].hex}"
						></div>
					{/if}
				{/each}
			</div>
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
{/snippet}

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
						onChange={(value) => handleAmbientLightChange(value)}
					/>
				</div>

				<!-- Dark color input -->
				<div class="space-y-2">
					<Label for="ambient-dark" class="text-xs">Dark</Label>
					<ColorPicker
						id="ambient-dark"
						bind:value={ambientDarkValue}
						onChange={(value) => handleAmbientDarkChange(value)}
					/>
				</div>

				<!-- Final interpolated ambient palette -->
				{#if ambientPalette}
					<div class="space-y-2 pt-2">
						<div class="grid grid-cols-11 overflow-hidden rounded border border-border">
							{#each SHADES as shade (shade)}
								{#if ambientPalette.shades[shade]}
									<div
										class="h-6"
										style="background-color: {ambientPalette.shades[shade].hex};"
										title="Shade {shade}: {ambientPalette.shades[shade].hex}"
									></div>
								{/if}
							{/each}
						</div>
						<div class="grid grid-cols-2 gap-2">
							<div class="rounded border border-border bg-white">
								<div
									style="color: {ambientPalette.lightText.hex};"
									class="flex h-6 items-center justify-center"
								>
									<SunIcon class="h-4 w-4" />
								</div>
							</div>
							<div class="rounded border border-border bg-black">
								<div
									style="color: {ambientPalette.darkText.hex};"
									class="flex h-6 items-center justify-center"
								>
									<MoonIcon class="h-4 w-4" />
								</div>
							</div>
						</div>
					</div>
				{/if}
			</SidebarGroupContent>
		</CollapsibleContent>
	</SidebarGroup>
</Collapsible>

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
						onChange={(value) => {
							primaryInput = value;
							handleColorChange('primary', value);
						}}
					/>
					{@render palettePreview(primaryPalette)}
				</div>

				<!-- Secondary color input -->
				<div class="space-y-2">
					<Label for="secondary-color" class="text-xs">Secondary Color</Label>
					<ColorPicker
						id="secondary-color"
						bind:value={secondaryValue}
						onChange={(value) => {
							secondaryInput = value;
							handleColorChange('secondary', value);
						}}
					/>
					{@render palettePreview(secondaryPalette)}
				</div>

				<!-- Accent color input -->
				<div class="space-y-2">
					<Label for="accent-color" class="text-xs">Accent Color</Label>
					<ColorPicker
						id="accent-color"
						bind:value={accentValue}
						onChange={(value) => {
							accentInput = value;
							handleColorChange('accent', value);
						}}
					/>
					{@render palettePreview(accentPalette)}
				</div>
			</SidebarGroupContent>
		</CollapsibleContent>
	</SidebarGroup>
</Collapsible>

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
						onChange={(value) => {
							successInput = value;
							handleColorChange('success', value);
						}}
					/>
					{@render palettePreview(successPalette)}
				</div>

				<!-- Warning color input -->
				<div class="space-y-2">
					<Label for="warning-color" class="text-xs">Warning Color</Label>
					<ColorPicker
						id="warning-color"
						bind:value={warningValue}
						onChange={(value) => {
							warningInput = value;
							handleColorChange('warning', value);
						}}
					/>
					{@render palettePreview(warningPalette)}
				</div>

				<!-- Destructive color input -->
				<div class="space-y-2">
					<Label for="destructive-color" class="text-xs">Destructive Color</Label>
					<ColorPicker
						id="destructive-color"
						bind:value={destructiveValue}
						onChange={(value) => {
							destructiveInput = value;
							handleColorChange('destructive', value);
						}}
					/>
					{@render palettePreview(destructivePalette)}
				</div>

				<!-- Info color input -->
				<div class="space-y-2">
					<Label for="info-color" class="text-xs">Info Color</Label>
					<ColorPicker
						id="info-color"
						bind:value={infoValue}
						onChange={(value) => {
							infoInput = value;
							handleColorChange('info', value);
						}}
					/>
					{@render palettePreview(infoPalette)}
				</div>
			</SidebarGroupContent>
		</CollapsibleContent>
	</SidebarGroup>
</Collapsible>

<Collapsible open class="group/collapsible">
	<SidebarGroup>
		<SidebarGroupLabel>
			{#snippet child({ props })}
				<CollapsibleTrigger {...props}>
					<ChevronRightIcon
						class="mr-1 transition-transform group-data-[state=open]/collapsible:rotate-90"
					/>
					Appearance
				</CollapsibleTrigger>
			{/snippet}
		</SidebarGroupLabel>
		<CollapsibleContent>
			<SidebarGroupContent class="space-y-8 p-4">
				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<Label for="radius" class="text-xs">Radius</Label>
						<Text size="xs" intensity="muted">{getRadiusValue()} rem</Text>
					</div>
					<Slider
						id="radius"
						type="single"
						bind:value={radiusValue}
						min={0}
						max={2}
						step={0.05}
						class="w-full"
					/>
				</div>
			</SidebarGroupContent>
		</CollapsibleContent>
	</SidebarGroup>
</Collapsible>
