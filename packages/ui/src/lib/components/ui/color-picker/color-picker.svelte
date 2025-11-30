<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '$lib/utils.js';
	import {
		InputGroup,
		InputGroupInput,
		InputGroupAddon,
		InputGroupButton,
		InputGroupText
	} from '$lib/components/ui/input-group/index.js';
	import SwatchBookIcon from '@lucide/svelte/icons/swatch-book';

	interface ColorPickerProps extends WithElementRef<HTMLAttributes<HTMLDivElement>> {
		value?: string;
		onChange?: (value: string) => void;
		disabled?: boolean;
		id?: string;
		placeholder?: string;
		name?: string;
	}

	let {
		ref = $bindable(null),
		value = $bindable('#000000'),
		onChange,
		disabled = false,
		id,
		placeholder,
		name: inputName,
		class: className,
		...restProps
	}: ColorPickerProps = $props();

	let colorInputRef: HTMLInputElement | null = null;

	/**
	 * Text value for the hex input field (without the # prefix, which is shown separately).
	 * We use $state instead of writable $derived because we need two-way binding with the input field
	 * (via bind:value). While writable $derived exists, $state with $effect provides clearer
	 * separation of concerns: $state manages the local editable value, $effect syncs from external changes.
	 */
	// eslint-disable-next-line svelte/prefer-writable-derived
	let textValue = $state(value.replace(/^#/, ''));

	$effect(() => {
		textValue = value.replace(/^#/, '');
	});

	/**
	 * Calculates the contrast color (black or white) for optimal readability
	 * against the given background color using WCAG relative luminance.
	 *
	 * @param hexColor - Hex color string (e.g., "#ffffff")
	 * @returns "#000000" for light backgrounds, "#ffffff" for dark backgrounds
	 */
	function getContrastColor(hexColor: string): string {
		const hex = hexColor.replace('#', '');

		const r = parseInt(hex.substring(0, 2), 16);
		const g = parseInt(hex.substring(2, 4), 16);
		const b = parseInt(hex.substring(4, 6), 16);

		const getLuminance = (val: number) => {
			val = val / 255;
			return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
		};

		const luminance =
			0.2126 * getLuminance(r) + 0.7152 * getLuminance(g) + 0.0722 * getLuminance(b);

		return luminance > 0.5 ? '#000000' : '#ffffff';
	}

	let iconColor = $derived(getContrastColor(value));

	/**
	 * Normalizes and validates a hex color string.
	 * Supports both 3-digit (#rgb) and 6-digit (#rrggbb) formats.
	 *
	 * @param input - Raw hex color input (with or without #)
	 * @returns Normalized 6-digit lowercase hex string, or null if invalid
	 */
	function normalizeHex(input: string): string | null {
		let hex = input.trim();
		if (!hex) return null;

		// Add # prefix if missing
		if (!hex.startsWith('#')) hex = `#${hex}`;

		// Validate hex format (#rgb or #rrggbb)
		const match = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(hex);
		if (!match) return null;

		// Expand 3-digit hex to 6-digit format
		if (match[1].length === 3) {
			const [r, g, b] = match[1].split('');
			hex = `#${r}${r}${g}${g}${b}${b}`;
		}

		return hex.toLowerCase();
	}

	/**
	 * Central color update function that normalizes hex values,
	 * ignores invalid input, and prevents unnecessary updates.
	 *
	 * @param raw - Raw color input string
	 */
	function updateColor(raw: string): void {
		const normalized = normalizeHex(raw);
		if (!normalized) return;

		if (normalized !== value) {
			value = normalized;
			onChange?.(normalized);
		}
	}

	/**
	 * Opens the native browser color picker by clicking the hidden color input.
	 */
	function handleButtonClick(): void {
		if (!disabled && colorInputRef) {
			colorInputRef.click();
		}
	}

	/**
	 * Handles changes from the native browser color picker.
	 * The browser picker always provides valid #rrggbb format.
	 *
	 * @param event - Input event from the color input
	 */
	function handleColorInputChange(event: Event): void {
		const target = event.target as HTMLInputElement;
		if (!target.value) return;

		updateColor(target.value);
	}

	/**
	 * Handles text input changes from the hex input field.
	 * Updates the text value immediately (even if invalid) for better UX,
	 * but only propagates valid hex values to the parent component.
	 *
	 * @param event - Change event from the text input
	 */
	function handleTextInputChange(event: Event): void {
		const target = event.target as HTMLInputElement;
		const next = target.value;

		// Update text field immediately, even if value is (temporarily) invalid
		textValue = next;

		// Only propagate valid hex values
		updateColor(next);
	}
</script>

<InputGroup {ref} class={cn('w-full', className)} {...restProps as HTMLAttributes<HTMLDivElement>}>
	<!-- Hidden native color input used only to open the browser color picker -->
	<input
		bind:this={colorInputRef}
		type="color"
		{value}
		oninput={(e) => handleColorInputChange(e)}
		class="sr-only"
		{id}
		name={inputName}
		{disabled}
	/>

	<!-- Color picker button -->
	<InputGroupAddon align="inline-start">
		<InputGroupButton
			size="icon-xs"
			onclick={handleButtonClick}
			{disabled}
			style="background-color: {value}; color: {iconColor};"
			type="button"
			aria-label="Select color"
			title="Select color"
		>
			<SwatchBookIcon />
		</InputGroupButton>
		<InputGroupText>#</InputGroupText>
	</InputGroupAddon>

	<!-- Text input for displaying and editing the hex color value -->
	<InputGroupInput
		bind:value={textValue}
		onchange={handleTextInputChange}
		{placeholder}
		{disabled}
		class="!pl-0.5"
		autocomplete="off"
		spellcheck="false"
		data-form-type="other"
	/>
</InputGroup>
