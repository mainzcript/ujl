<!--
	Designer sidebar for editing theme tokens (colors, radius, etc.).
	Reads tokens from props, updates them via CrafterContext.updateTokenSet and delegates UI to group components.
-->
<script lang="ts">
	import { getContext } from 'svelte';
	import type { UJLTTokenSet, UJLTFlavor, UJLTAmbientColorSet } from '@ujl-framework/types';
	import { CRAFTER_CONTEXT, type CrafterContext } from '../../context.js';
	import { updateFlavorByOriginal } from '$lib/tools/colors/index.ts';
	import AmbientColorGroup from './components/ambient-color-group.svelte';
	import ThemeColorsGroup from './components/theme-colors-group.svelte';
	import NotificationColorsGroup from './components/notification-colors-group.svelte';
	import AppearanceGroup from './components/appearance-group.svelte';

	let { tokens }: { tokens: UJLTTokenSet } = $props();

	// Get context API for mutations
	const crafter = getContext<CrafterContext>(CRAFTER_CONTEXT);

	/**
	 * Helper function to update a single non-ambient color flavor from a hex input.
	 * Uses updateFlavorByOriginal to recalculate all derived colors
	 * (light, dark and the complete foreground matrix) from a single hex color.
	 * This is the only mutation path for non-ambient color tokens, ensuring unidirectional data flow.
	 *
	 * @param flavor - The color flavor to update (e.g., 'primary', 'secondary', etc.)
	 * @param hex - The new hex color string (e.g., "#3b82f6")
	 */
	function updateColorToken(flavor: Exclude<UJLTFlavor, 'ambient'>, hex: string) {
		crafter.updateTokenSet((oldTokens) => {
			const updatedPalette = updateFlavorByOriginal(oldTokens.color, flavor, { hex });
			return {
				...oldTokens,
				color: updatedPalette
			};
		});
	}

	/**
	 * Helper function to update the ambient color flavor from a dual original input.
	 * Accepts UJLTAmbientColorSet['_original'] so that ambient can be driven by separate light/dark hex values.
	 */
	function updateAmbientColorToken(original: UJLTAmbientColorSet['_original']) {
		crafter.updateTokenSet((oldTokens) => {
			const updatedPalette = updateFlavorByOriginal(oldTokens.color, 'ambient', original);
			return {
				...oldTokens,
				color: updatedPalette
			};
		});
	}

	/**
	 * Parses the radius value from tokens.
	 *
	 * @param tokens - The token set to parse
	 * @returns Radius value in rem units (as a number)
	 */
	function parseRadius(tokens: UJLTTokenSet): number {
		const match = tokens.radius.match(/^([\d.]+)/);
		return match ? Number.parseFloat(match[1]) : 0.75;
	}

	/**
	 * Helper function to update the radius token.
	 * This is the only mutation path for radius, ensuring unidirectional data flow.
	 *
	 * @param value - The new radius value in rem units (as a number)
	 */
	function updateRadiusToken(value: number) {
		crafter.updateTokenSet((oldTokens) => ({
			...oldTokens,
			radius: `${value}rem`
		}));
	}
</script>

<!--
	Delegate UI rendering to presentational group components.
	Each group receives tokens directly as props and onChange callbacks for updates.
-->
<AmbientColorGroup
	palette={tokens.color}
	ambientColorSet={tokens.color.ambient}
	onAmbientChange={updateAmbientColorToken}
/>

<ThemeColorsGroup
	palette={tokens.color}
	primaryColorSet={tokens.color.primary}
	secondaryColorSet={tokens.color.secondary}
	accentColorSet={tokens.color.accent}
	onPrimaryChange={(hex) => updateColorToken('primary', hex)}
	onSecondaryChange={(hex) => updateColorToken('secondary', hex)}
	onAccentChange={(hex) => updateColorToken('accent', hex)}
/>

<NotificationColorsGroup
	palette={tokens.color}
	successColorSet={tokens.color.success}
	warningColorSet={tokens.color.warning}
	destructiveColorSet={tokens.color.destructive}
	infoColorSet={tokens.color.info}
	onSuccessChange={(hex) => updateColorToken('success', hex)}
	onWarningChange={(hex) => updateColorToken('warning', hex)}
	onDestructiveChange={(hex) => updateColorToken('destructive', hex)}
	onInfoChange={(hex) => updateColorToken('info', hex)}
/>

<AppearanceGroup
	radiusValue={parseRadius(tokens)}
	radiusDisplayValue={parseRadius(tokens)}
	onRadiusChange={updateRadiusToken}
/>
