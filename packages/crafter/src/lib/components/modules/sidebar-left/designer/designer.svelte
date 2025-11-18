<!--
	Designer sidebar for editing theme tokens (colors, radius, etc.).
	Reads tokens from props, updates them via CrafterContext.updateTokenSet and delegates UI to group components.
-->
<script lang="ts">
	import { getContext } from 'svelte';
	import type { UJLTTokenSet, UJLTColorSet } from '@ujl-framework/types';
	import { CRAFTER_CONTEXT, type CrafterContext } from '../../context.js';
	import ThemeColorsGroup from './components/theme-colors-group.svelte';
	import NotificationColorsGroup from './components/notification-colors-group.svelte';
	import AppearanceGroup from './components/appearance-group.svelte';

	let { tokens }: { tokens: UJLTTokenSet } = $props();

	// Get context API for mutations
	const crafter = getContext<CrafterContext>(CRAFTER_CONTEXT);

	/**
	 * Helper function to update a single color token.
	 * This is the only mutation path for color tokens, ensuring unidirectional data flow.
	 *
	 * @param key - The color key to update (e.g., 'primary', 'secondary', etc.)
	 * @param set - The new UJLTColorSet value
	 */
	function updateColorToken(key: keyof UJLTTokenSet['color'], set: UJLTColorSet) {
		crafter.updateTokenSet((oldTokens) => ({
			...oldTokens,
			color: { ...oldTokens.color, [key]: set }
		}));
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
<ThemeColorsGroup
	primaryColorSet={tokens.color.primary}
	secondaryColorSet={tokens.color.secondary}
	accentColorSet={tokens.color.accent}
	onPrimaryChange={(set) => updateColorToken('primary', set)}
	onSecondaryChange={(set) => updateColorToken('secondary', set)}
	onAccentChange={(set) => updateColorToken('accent', set)}
/>

<NotificationColorsGroup
	successColorSet={tokens.color.success}
	warningColorSet={tokens.color.warning}
	destructiveColorSet={tokens.color.destructive}
	infoColorSet={tokens.color.info}
	onSuccessChange={(set) => updateColorToken('success', set)}
	onWarningChange={(set) => updateColorToken('warning', set)}
	onDestructiveChange={(set) => updateColorToken('destructive', set)}
	onInfoChange={(set) => updateColorToken('info', set)}
/>

<AppearanceGroup
	radiusValue={parseRadius(tokens)}
	radiusDisplayValue={parseRadius(tokens)}
	onRadiusChange={updateRadiusToken}
/>
