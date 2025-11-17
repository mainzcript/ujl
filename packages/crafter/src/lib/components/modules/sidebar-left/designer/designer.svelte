<!--
	Designer sidebar component for editing theme tokens (colors, radius, etc.).

	This component orchestrates the theme editing UI by:
	- Reading tokens from props
	- Computing color palettes from token values (including special ambient palette interpolation)
	- Providing callback functions to child group components
	- Updating tokens through the Crafter context API (updateTokenSet)

	The actual UI layout is delegated to presentational group components:
	- ambient-group.svelte: Ambient color controls
	- theme-colors-group.svelte: Primary, secondary, accent colors
	- notification-colors-group.svelte: Success, warning, destructive, info colors
	- appearance-group.svelte: Border radius control

	All palette calculations and token mutations remain in this component.
	The group components are pure presentational components that only handle UI rendering.
-->
<script lang="ts">
	import { getContext } from 'svelte';
	import type { UJLTTokenSet, UJLTFlavor } from '@ujl-framework/types';
	import {
		generateColorPalette,
		interpolateAmbientPalette,
		getReferencePalette,
		oklchToHex
	} from '$lib/tools/colorPlate.js';
	import { mapGeneratedPaletteToColorSet } from '$lib/tools/paletteToColorSet.js';
	import { CRAFTER_CONTEXT, type CrafterContext } from '../../context.js';
	import AmbientGroup from './_ambient-group.svelte';
	import ThemeColorsGroup from './_theme-colors-group.svelte';
	import NotificationColorsGroup from './_notification-colors-group.svelte';
	import AppearanceGroup from './_appearance-group.svelte';

	let { tokens }: { tokens: UJLTTokenSet } = $props();

	// Get context API for mutations
	const crafter = getContext<CrafterContext>(CRAFTER_CONTEXT);

	/**
	 * Local input states for color pickers.
	 * These track user edits before committing to tokens.
	 * null means use the value from tokens (no local override).
	 * When a user picks a color, we store it here first, then update tokens.
	 */
	let ambientLightInput = $state<string | null>(null);
	let ambientDarkInput = $state<string | null>(null);
	let primaryInput = $state<string | null>(null);
	let secondaryInput = $state<string | null>(null);
	let accentInput = $state<string | null>(null);
	let successInput = $state<string | null>(null);
	let warningInput = $state<string | null>(null);
	let destructiveInput = $state<string | null>(null);
	let infoInput = $state<string | null>(null);

	/**
	 * Computed values for ColorPicker bindings (derived from inputs and tokens).
	 * These are the actual hex values displayed in the color pickers.
	 * Priority: if *Input is set, use that; otherwise derive from tokens.
	 */
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

	/**
	 * Radius input state for tracking user edits before committing to tokens.
	 * null means use the value from tokens.
	 */
	let radiusInput = $state<number | null>(null);

	/**
	 * Gets the color value for a ColorPicker, prioritizing local input over tokens.
	 *
	 * @param flavor - The color flavor (primary, secondary, accent, etc.)
	 * @param input - Local input override (null means use tokens)
	 * @returns Hex color string for the ColorPicker
	 */
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

	/**
	 * Gets the ambient color (light or dark) for a ColorPicker.
	 *
	 * @param isLight - true for light mode, false for dark mode
	 * @param input - Local input override (null means use tokens)
	 * @returns Hex color string for the ColorPicker
	 */
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

	/**
	 * Gets the radius value, prioritizing local input over tokens.
	 *
	 * @returns Radius value in rem units (as a number)
	 */
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

	/**
	 * Handler for theme/notification color changes (primary, secondary, accent, success, warning, destructive, info).
	 * Generates a new palette from the hex color and immediately updates tokens.
	 *
	 * @param flavor - The color flavor to update
	 * @param hex - The new hex color value
	 */
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

	/**
	 * Handler for ambient light color changes.
	 * Stores the input and lets the reactive effect handle the token update.
	 *
	 * @param hex - The new hex color value for light mode
	 */
	function handleAmbientLightChange(hex: string) {
		if (!hex) return;
		ambientLightInput = hex;
	}

	/**
	 * Handler for ambient dark color changes.
	 * Stores the input and lets the reactive effect handle the token update.
	 *
	 * @param hex - The new hex color value for dark mode
	 */
	function handleAmbientDarkChange(hex: string) {
		if (!hex) return;
		ambientDarkInput = hex;
	}

	/**
	 * Handler for radius changes.
	 * Updates the local input state and immediately commits to tokens.
	 *
	 * @param value - The new radius value in rem units
	 */
	function handleRadiusChange(value: number) {
		radiusInput = value;
		crafter.updateTokenSet((oldTokens) => ({
			...oldTokens,
			radius: `${value}rem`
		}));
	}

	let radiusValue = $state(getRadiusValue());

	/**
	 * Handle radius changes from the slider.
	 * When radiusValue changes (via binding from AppearanceGroup), update tokens.
	 * We track the previous value to avoid infinite loops.
	 */
	let previousRadiusValue = $state(getRadiusValue());
	$effect(() => {
		// Only update if radiusValue actually changed from user input
		if (radiusValue !== previousRadiusValue) {
			previousRadiusValue = radiusValue;
			handleRadiusChange(radiusValue);
		}
	});

	/**
	 * Sync radiusValue with tokens when tokens change externally (e.g., from external updates).
	 * This ensures the slider reflects the current token value.
	 */
	$effect(() => {
		const tokenValue = getRadiusValue();
		// Only update if the token value changed externally (not from our own updates via radiusInput)
		if (radiusInput === null && radiusValue !== tokenValue) {
			radiusValue = tokenValue;
			previousRadiusValue = tokenValue;
		}
	});

	/**
	 * Reactive effect that updates ambient tokens when the interpolated palette changes.
	 * This replaces the setTimeout pattern by reacting to ambientPalette changes.
	 * When ambientLightInput or ambientDarkInput change, ambientPalette is recomputed,
	 * and this effect commits the new palette to tokens.
	 */
	$effect(() => {
		if (ambientPalette && (ambientLightInput !== null || ambientDarkInput !== null)) {
			const colorSet = mapGeneratedPaletteToColorSet(ambientPalette);
			crafter.updateTokenSet((oldTokens) => ({
				...oldTokens,
				color: {
					...oldTokens.color,
					ambient: colorSet
				}
			}));
		}
	});
</script>

<!--
	Delegate UI rendering to presentational group components.
	Each group receives the necessary data and callbacks as props.
-->
<AmbientGroup
	{ambientLightValue}
	{ambientDarkValue}
	{ambientPalette}
	onLightChange={handleAmbientLightChange}
	onDarkChange={handleAmbientDarkChange}
/>

<ThemeColorsGroup
	bind:primaryValue
	{primaryPalette}
	primaryOnChange={(hex) => {
		primaryInput = hex;
		handleColorChange('primary', hex);
	}}
	bind:secondaryValue
	{secondaryPalette}
	secondaryOnChange={(hex) => {
		secondaryInput = hex;
		handleColorChange('secondary', hex);
	}}
	bind:accentValue
	{accentPalette}
	accentOnChange={(hex) => {
		accentInput = hex;
		handleColorChange('accent', hex);
	}}
/>

<NotificationColorsGroup
	bind:successValue
	{successPalette}
	successOnChange={(hex) => {
		successInput = hex;
		handleColorChange('success', hex);
	}}
	bind:warningValue
	{warningPalette}
	warningOnChange={(hex) => {
		warningInput = hex;
		handleColorChange('warning', hex);
	}}
	bind:destructiveValue
	{destructivePalette}
	destructiveOnChange={(hex) => {
		destructiveInput = hex;
		handleColorChange('destructive', hex);
	}}
	bind:infoValue
	{infoPalette}
	infoOnChange={(hex) => {
		infoInput = hex;
		handleColorChange('info', hex);
	}}
/>

<AppearanceGroup bind:radiusValue radiusDisplayValue={getRadiusValue()} />
