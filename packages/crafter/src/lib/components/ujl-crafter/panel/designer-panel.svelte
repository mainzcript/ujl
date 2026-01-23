<script lang="ts">
	import { getContext } from 'svelte';
	import type {
		UJLTTokenSet,
		UJLTFlavor,
		UJLTAmbientColorSet,
		UJLTTypographyBase,
		UJLTTypographyHeading,
		UJLTTypographyHighlight,
		UJLTTypographyLink,
		UJLTTypographyCode
	} from '@ujl-framework/types';
	import { CRAFTER_CONTEXT, type CrafterContext } from '../context.js';
	import { updateFlavorByOriginal } from '$lib/utils/colors/index.js';
	import AmbientColorGroup from './designer/components/colors/ambient-color-group.svelte';
	import ThemeColorsGroup from './designer/components/colors/theme-colors-group.svelte';
	import NotificationColorsGroup from './designer/components/colors/notification-colors-group.svelte';
	import BaseTypographyGroup from './designer/components/typography/base-typography-group.svelte';
	import HeadingTypographyGroup from './designer/components/typography/heading-typography-group.svelte';
	import HighlightTypographyGroup from './designer/components/typography/highlight-typography-group.svelte';
	import LinkTypographyGroup from './designer/components/typography/link-typography-group.svelte';
	import CodeTypographyGroup from './designer/components/typography/code-typography-group.svelte';
	import AppearanceGroup from './designer/components/appearance-group.svelte';

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
		crafter.updateTokenSet((oldTokens: UJLTTokenSet) => {
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
		crafter.updateTokenSet((oldTokens: UJLTTokenSet) => {
			const updatedPalette = updateFlavorByOriginal(oldTokens.color, 'ambient', original);
			return {
				...oldTokens,
				color: updatedPalette
			};
		});
	}

	// Ensures unidirectional data flow by centralizing all radius mutations
	function updateRadiusToken(value: number) {
		crafter.updateTokenSet((oldTokens: UJLTTokenSet) => ({
			...oldTokens,
			radius: value
		}));
	}

	// Ensures unidirectional data flow by centralizing all spacing mutations
	function updateSpacingToken(value: number) {
		crafter.updateTokenSet((oldTokens: UJLTTokenSet) => ({
			...oldTokens,
			spacing: value
		}));
	}

	/**
	 * Helper function to update the base typography token.
	 * Merges partial updates into the existing base typography object.
	 * This is the only mutation path for base typography, ensuring unidirectional data flow.
	 *
	 * @param updates - Partial updates to apply to base typography
	 */
	function updateBaseTypography(updates: Partial<UJLTTypographyBase>) {
		crafter.updateTokenSet((oldTokens: UJLTTokenSet) => ({
			...oldTokens,
			typography: {
				...oldTokens.typography,
				base: {
					...oldTokens.typography.base,
					...updates
				}
			}
		}));
	}

	/**
	 * Helper function to update the heading typography token.
	 * Merges partial updates into the existing heading typography object.
	 * This is the only mutation path for heading typography, ensuring unidirectional data flow.
	 *
	 * @param updates - Partial updates to apply to heading typography
	 */
	function updateHeadingTypography(updates: Partial<UJLTTypographyHeading>) {
		crafter.updateTokenSet((oldTokens: UJLTTokenSet) => ({
			...oldTokens,
			typography: {
				...oldTokens.typography,
				heading: {
					...oldTokens.typography.heading,
					...updates
				}
			}
		}));
	}

	/**
	 * Helper function to update the highlight typography token.
	 * Merges partial updates into the existing highlight typography object.
	 * This is the only mutation path for highlight typography, ensuring unidirectional data flow.
	 *
	 * @param updates - Partial updates to apply to highlight typography
	 */
	function updateHighlightTypography(updates: Partial<UJLTTypographyHighlight>) {
		crafter.updateTokenSet((oldTokens: UJLTTokenSet) => ({
			...oldTokens,
			typography: {
				...oldTokens.typography,
				highlight: {
					...oldTokens.typography.highlight,
					...updates
				}
			}
		}));
	}

	/**
	 * Helper function to update the link typography token.
	 * Merges partial updates into the existing link typography object.
	 * This is the only mutation path for link typography, ensuring unidirectional data flow.
	 *
	 * @param updates - Partial updates to apply to link typography
	 */
	function updateLinkTypography(updates: Partial<UJLTTypographyLink>) {
		crafter.updateTokenSet((oldTokens: UJLTTokenSet) => ({
			...oldTokens,
			typography: {
				...oldTokens.typography,
				link: {
					...oldTokens.typography.link,
					...updates
				}
			}
		}));
	}

	// Ensures unidirectional data flow by centralizing all code typography mutations
	function updateCodeTypography(updates: Partial<UJLTTypographyCode>) {
		crafter.updateTokenSet((oldTokens: UJLTTokenSet) => ({
			...oldTokens,
			typography: {
				...oldTokens.typography,
				code: {
					...oldTokens.typography.code,
					...updates
				}
			}
		}));
	}
</script>

<!--
	Delegate UI rendering to presentational group components.
	Each group receives tokens directly as props and onChange callbacks for updates.
-->
<div class="h-full divide-y divide-border overflow-y-auto">
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
		onPrimaryChange={(hex: string) => updateColorToken('primary', hex)}
		onSecondaryChange={(hex: string) => updateColorToken('secondary', hex)}
		onAccentChange={(hex: string) => updateColorToken('accent', hex)}
	/>

	<NotificationColorsGroup
		palette={tokens.color}
		successColorSet={tokens.color.success}
		warningColorSet={tokens.color.warning}
		destructiveColorSet={tokens.color.destructive}
		infoColorSet={tokens.color.info}
		onSuccessChange={(hex: string) => updateColorToken('success', hex)}
		onWarningChange={(hex: string) => updateColorToken('warning', hex)}
		onDestructiveChange={(hex: string) => updateColorToken('destructive', hex)}
		onInfoChange={(hex: string) => updateColorToken('info', hex)}
	/>

	<BaseTypographyGroup typography={tokens.typography.base} onChange={updateBaseTypography} />

	<HeadingTypographyGroup
		typography={tokens.typography.heading}
		palette={tokens.color}
		onChange={updateHeadingTypography}
	/>

	<HighlightTypographyGroup
		typography={tokens.typography.highlight}
		palette={tokens.color}
		onChange={updateHighlightTypography}
	/>

	<LinkTypographyGroup typography={tokens.typography.link} onChange={updateLinkTypography} />

	<CodeTypographyGroup typography={tokens.typography.code} onChange={updateCodeTypography} />

	<AppearanceGroup
		radiusValue={tokens.radius}
		onRadiusChange={updateRadiusToken}
		spacingValue={tokens.spacing}
		onSpacingChange={updateSpacingToken}
	/>
</div>
