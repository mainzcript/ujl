<script lang="ts">
	import type { FieldDefinition } from '@ujl-framework/types';
	import {
		Input,
		Textarea,
		Switch,
		Select,
		SelectTrigger,
		SelectContent,
		SelectItem,
		SelectLabel,
		SelectGroup,
		Label,
		Text
	} from '@ujl-framework/ui';

	let {
		fieldName,
		definition,
		value,
		onChange
	}: {
		fieldName: string;
		definition: FieldDefinition;
		value: unknown;
		onChange: (value: unknown) => void;
	} = $props();

	// Refs to input elements for manual updates
	let textInputRef: HTMLInputElement | null = $state(null);
	let textareaRef: HTMLTextAreaElement | null = $state(null);
	let numberInputRef: HTMLInputElement | null = $state(null);

	// Update input elements when external value changes
	$effect(() => {
		if (textInputRef && isString(value)) {
			textInputRef.value = value;
		}
		if (textareaRef && isString(value)) {
			textareaRef.value = value;
		}
		if (numberInputRef && isNumber(value)) {
			numberInputRef.value = String(value);
		}
	});

	/**
	 * Unified change handler for all input types
	 */
	function handleChange(event: Event) {
		const target = event.currentTarget as HTMLInputElement | HTMLTextAreaElement;
		const newValue = target.type === 'number' ? Number(target.value) : target.value;
		onChange(newValue);
	}

	// Type guards
	const isString = (val: unknown): val is string => typeof val === 'string';
	const isNumber = (val: unknown): val is number => typeof val === 'number';
	const isBoolean = (val: unknown): val is boolean => typeof val === 'boolean';
</script>

<div class="space-y-2">
	<!-- Label Row -->
	<div class="flex items-center justify-between">
		<Label for={fieldName} class="text-s font-medium">
			{definition.label}
			{#if definition.required}
				<span class="text-destructive" title="Required field">*</span>
			{/if}
		</Label>
	</div>

	<!-- Description -->
	{#if definition.description}
		<Text size="xs" intensity="muted" class="leading-tight">
			{definition.description}
		</Text>
	{/if}

	<!-- Input Component -->
	{#if definition.type === 'text'}
		<Input
			bind:ref={textInputRef}
			id={fieldName}
			type="text"
			defaultValue={isString(value) ? value : ''}
			oninput={handleChange}
			placeholder={definition.placeholder}
			required={definition.required}
		/>
	{:else if definition.type === 'url'}
		<Input
			bind:ref={textInputRef}
			id={fieldName}
			type="url"
			defaultValue={isString(value) ? value : ''}
			oninput={handleChange}
			placeholder={definition.placeholder || 'https://example.com'}
			required={definition.required}
		/>
	{:else if definition.type === 'email'}
		<Input
			bind:ref={textInputRef}
			id={fieldName}
			type="email"
			defaultValue={isString(value) ? value : ''}
			oninput={handleChange}
			placeholder={definition.placeholder || 'email@example.com'}
			required={definition.required}
		/>
	{:else if definition.type === 'textarea'}
		<Textarea
			bind:ref={textareaRef}
			id={fieldName}
			defaultValue={isString(value) ? value : ''}
			oninput={handleChange}
			placeholder={definition.placeholder}
			required={definition.required}
			rows={4}
		/>
	{:else if definition.type === 'number'}
		<Input
			bind:ref={numberInputRef}
			id={fieldName}
			type="number"
			defaultValue={isNumber(value) ? value : 0}
			oninput={handleChange}
			placeholder={definition.placeholder}
			min={definition.min}
			max={definition.max}
			step={definition.step}
			required={definition.required}
		/>
	{:else if definition.type === 'boolean'}
		<div class="flex items-center space-x-2">
			<Switch
				id={fieldName}
				checked={isBoolean(value) ? value : false}
				onCheckedChange={onChange}
			/>
			<Label for={fieldName} class="text-sm font-normal">
				{isBoolean(value) && value ? 'Enabled' : 'Disabled'}
			</Label>
		</div>
	{:else if definition.type === 'select'}
		{#if !definition.options || definition.options.length === 0}
			<Text size="sm" intensity="muted" class="italic">No options available</Text>
		{:else}
			<Select type="single" value={isString(value) ? value : undefined} onValueChange={onChange}>
				<SelectTrigger id={fieldName} class="w-full">
					{#if value && isString(value)}
						{definition.options.find((opt) => opt.value === value)?.label || value}
					{:else}
						{definition.placeholder || 'Select...'}
					{/if}
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						<SelectLabel>Options</SelectLabel>
						{#each definition.options as option (option.value)}
							<SelectItem value={option.value} label={option.label}>
								{option.label}
							</SelectItem>
						{/each}
					</SelectGroup>
				</SelectContent>
			</Select>
		{/if}
	{:else if definition.type === 'richtext'}
		<div class="rounded-md border border-border bg-muted p-4">
			<Text size="sm" intensity="muted" class="italic">Rich text editor not yet implemented</Text>
			<Textarea
				bind:ref={textareaRef}
				id={fieldName}
				defaultValue={isString(value) ? value : ''}
				oninput={handleChange}
				placeholder={definition.placeholder || 'Enter text...'}
				required={definition.required}
				rows={6}
			/>
		</div>
	{:else}
		<div class="rounded-md border border-destructive/50 bg-destructive/10 p-3">
			<Text size="sm" intensity="muted" class="italic">
				Unsupported field type: <code class="font-mono">{definition.type}</code>
			</Text>
		</div>
	{/if}

	<!-- Validation hints -->
	{#if definition.min !== undefined || definition.max !== undefined}
		<Text size="xs" intensity="muted" class="leading-tight">
			{#if definition.min !== undefined && definition.max !== undefined}
				Range: {definition.min} - {definition.max}
			{:else if definition.min !== undefined}
				Minimum: {definition.min}
			{:else if definition.max !== undefined}
				Maximum: {definition.max}
			{/if}
		</Text>
	{/if}
</div>
