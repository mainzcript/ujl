<script lang="ts">
	import { Input, Label, Text } from '@ujl-framework/ui';
	import type { FieldEntry } from '@ujl-framework/core';
	import type { ProseMirrorDocument } from '@ujl-framework/types';
	import { ImageField, NumberField } from '@ujl-framework/core';
	import { ImagePicker } from '../image-picker/index.js';
	import { RichTextInput } from '../richtext-input/index.js';

	let {
		fieldName,
		fieldEntry,
		value,
		onChange
	}: {
		fieldName: string;
		fieldEntry: FieldEntry;
		value: unknown;
		onChange: (value: unknown) => void;
	} = $props();

	// Get field type and config (using $derived to avoid Svelte state warnings)
	const fieldType = $derived(fieldEntry.field.getFieldType());
	const config = $derived(fieldEntry.field.config);

	// Type guard for NumberField
	function isNumberField(field: typeof fieldEntry.field): field is NumberField {
		return field.getFieldType() === 'number';
	}

	// Type guard for ImageField
	function isImageField(field: typeof fieldEntry.field): field is ImageField {
		return field.getFieldType() === 'image';
	}

	// Get number field config if applicable
	const numberFieldConfig = $derived(
		isNumberField(fieldEntry.field) ? fieldEntry.field.config : null
	);

	// Type guard for image ID (string, number, or null)
	// Backend services may return numeric IDs (e.g., Payload CMS returns numbers)
	const isImageId = (val: unknown): val is string | number | null => {
		return val === null || typeof val === 'string' || typeof val === 'number';
	};

	// Refs to input elements for manual updates
	let textInputRef: HTMLInputElement | null = $state(null);
	let numberInputRef: HTMLInputElement | null = $state(null);

	// Update input elements when external value changes
	$effect(() => {
		if (textInputRef && isString(value)) {
			textInputRef.value = value;
		}
		if (numberInputRef && isNumber(value)) {
			numberInputRef.value = String(value);
		}
	});

	// Normalizes input values (number conversion) before calling onChange
	function handleChange(event: Event) {
		const target = event.currentTarget as HTMLInputElement | HTMLTextAreaElement;
		const newValue = target.type === 'number' ? Number(target.value) : target.value;
		onChange(newValue);
	}

	// Type guards
	const isString = (val: unknown): val is string => typeof val === 'string';
	const isNumber = (val: unknown): val is number => typeof val === 'number';
	const isProseMirrorDocument = (val: unknown): val is ProseMirrorDocument => {
		return (
			typeof val === 'object' &&
			val !== null &&
			'type' in val &&
			val.type === 'doc' &&
			'content' in val &&
			Array.isArray(val.content)
		);
	};
</script>

<div class="space-y-2">
	<!-- Label Row -->
	<div class="flex items-center justify-between">
		<Label for={fieldName} class="text-s font-medium">
			{config.label}
		</Label>
	</div>

	<!-- Description -->
	{#if config.description}
		<Text size="xs" intensity="muted" class="leading-tight">
			{config.description}
		</Text>
	{/if}

	<!-- Input Component -->
	{#if fieldType === 'text'}
		<Input
			bind:ref={textInputRef}
			id={fieldName}
			type="text"
			defaultValue={isString(value) ? value : ''}
			oninput={handleChange}
			placeholder={config.placeholder}
		/>
	{:else if fieldType === 'number'}
		<Input
			bind:ref={numberInputRef}
			id={fieldName}
			type="number"
			defaultValue={isNumber(value) ? value : 0}
			oninput={handleChange}
			placeholder={config.placeholder}
			min={numberFieldConfig?.min}
			max={numberFieldConfig?.max}
			step={numberFieldConfig?.decimals !== undefined
				? Math.pow(10, -numberFieldConfig.decimals)
				: undefined}
		/>
	{:else if fieldType === 'richtext'}
		<RichTextInput
			value={isProseMirrorDocument(value) ? value : undefined}
			onChange={(newValue) => onChange(newValue)}
		/>
	{:else if fieldType === 'image'}
		{@const imageValue = isImageId(value) ? value : null}
		{#if isImageField(fieldEntry.field)}
			{#key value}
				<ImagePicker value={imageValue} {onChange} />
			{/key}
		{/if}
	{:else}
		<div class="rounded-md border border-destructive/50 bg-destructive/10 p-3">
			<Text size="sm" intensity="muted" class="italic">
				Unsupported field type: <code class="font-mono">{fieldType}</code>
			</Text>
		</div>
	{/if}

	<!-- Validation hints -->
	{#if numberFieldConfig && (numberFieldConfig.min !== undefined || numberFieldConfig.max !== undefined)}
		<Text size="xs" intensity="muted" class="leading-tight">
			{#if numberFieldConfig.min !== undefined && numberFieldConfig.max !== undefined}
				Range: {numberFieldConfig.min} - {numberFieldConfig.max}
			{:else if numberFieldConfig.min !== undefined}
				Minimum: {numberFieldConfig.min}
			{:else if numberFieldConfig.max !== undefined}
				Maximum: {numberFieldConfig.max}
			{/if}
		</Text>
	{/if}
</div>
