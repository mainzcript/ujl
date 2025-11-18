<!--
	Designer sidebar component for editing theme tokens (colors, radius, etc.).
	Orchestrates the theme editing UI by managing UJLTColorSet states per flavor and syncing them with tokens.
	UI layout is delegated to presentational group components (theme-colors-group, notification-colors-group, appearance-group).
	All palette generation is handled by ColorPaletteInput; this component only bridges UJLTColorSet states and tokens.
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
	 * UJLTColorSet states for each color flavor.
	 * These are initialized from tokens and kept in sync via reactive effects.
	 * When a ColorPaletteInput changes a colorSet, it updates the corresponding state,
	 * which triggers a token update.
	 */
	let primaryColorSet = $state<UJLTColorSet | null>(tokens.color.primary);
	let secondaryColorSet = $state<UJLTColorSet | null>(tokens.color.secondary);
	let accentColorSet = $state<UJLTColorSet | null>(tokens.color.accent);
	let successColorSet = $state<UJLTColorSet | null>(tokens.color.success);
	let warningColorSet = $state<UJLTColorSet | null>(tokens.color.warning);
	let destructiveColorSet = $state<UJLTColorSet | null>(tokens.color.destructive);
	let infoColorSet = $state<UJLTColorSet | null>(tokens.color.info);

	/**
	 * Radius input state for tracking user edits before committing to tokens.
	 * null means use the value from tokens.
	 */
	let radiusInput = $state<number | null>(null);

	/**
	 * Sync color sets from tokens when tokens change externally.
	 * This ensures the UI reflects external token updates.
	 */
	$effect(() => {
		primaryColorSet = tokens.color.primary;
		secondaryColorSet = tokens.color.secondary;
		accentColorSet = tokens.color.accent;
		successColorSet = tokens.color.success;
		warningColorSet = tokens.color.warning;
		destructiveColorSet = tokens.color.destructive;
		infoColorSet = tokens.color.info;
	});

	/**
	 * Update tokens when color sets change via ColorPaletteInput bindings.
	 * We use a single effect that watches all color sets and updates the corresponding token.
	 */
	$effect(() => {
		if (primaryColorSet && primaryColorSet !== tokens.color.primary) {
			crafter.updateTokenSet((oldTokens) => ({
				...oldTokens,
				color: { ...oldTokens.color, primary: primaryColorSet! }
			}));
		}
		if (secondaryColorSet && secondaryColorSet !== tokens.color.secondary) {
			crafter.updateTokenSet((oldTokens) => ({
				...oldTokens,
				color: { ...oldTokens.color, secondary: secondaryColorSet! }
			}));
		}
		if (accentColorSet && accentColorSet !== tokens.color.accent) {
			crafter.updateTokenSet((oldTokens) => ({
				...oldTokens,
				color: { ...oldTokens.color, accent: accentColorSet! }
			}));
		}
		if (successColorSet && successColorSet !== tokens.color.success) {
			crafter.updateTokenSet((oldTokens) => ({
				...oldTokens,
				color: { ...oldTokens.color, success: successColorSet! }
			}));
		}
		if (warningColorSet && warningColorSet !== tokens.color.warning) {
			crafter.updateTokenSet((oldTokens) => ({
				...oldTokens,
				color: { ...oldTokens.color, warning: warningColorSet! }
			}));
		}
		if (destructiveColorSet && destructiveColorSet !== tokens.color.destructive) {
			crafter.updateTokenSet((oldTokens) => ({
				...oldTokens,
				color: { ...oldTokens.color, destructive: destructiveColorSet! }
			}));
		}
		if (infoColorSet && infoColorSet !== tokens.color.info) {
			crafter.updateTokenSet((oldTokens) => ({
				...oldTokens,
				color: { ...oldTokens.color, info: infoColorSet! }
			}));
		}
	});

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
</script>

<!--
	Delegate UI rendering to presentational group components.
	Each group receives UJLTColorSet bindings that sync with tokens.
-->
<ThemeColorsGroup bind:primaryColorSet bind:secondaryColorSet bind:accentColorSet />

<NotificationColorsGroup
	bind:successColorSet
	bind:warningColorSet
	bind:destructiveColorSet
	bind:infoColorSet
/>

<AppearanceGroup bind:radiusValue radiusDisplayValue={getRadiusValue()} />
