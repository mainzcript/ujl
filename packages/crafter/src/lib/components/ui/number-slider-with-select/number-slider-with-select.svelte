<!--
	Number slider with synchronized select component.
	Combines a Select dropdown (top-right) with a synchronized Slider (below).
	Manages numeric values with semantic labels for any numeric range.
-->
<script lang="ts">
	import {
		Select,
		SelectTrigger,
		SelectContent,
		SelectGroup,
		SelectLabel,
		SelectItem,
		Slider,
		Label
	} from '@ujl-framework/ui';
	import { generateUid } from '@ujl-framework/core';

	let {
		value = $bindable<number | undefined>(),
		options,
		label,
		id,
		sliderMin = 0,
		sliderMax = 1,
		min,
		max,
		step = 1,
		onchange
	}: {
		value?: number;
		options: Array<{ value: string; label: string }>;
		label?: string;
		id?: string;
		sliderMin?: number;
		sliderMax?: number;
		min?: number;
		max?: number;
		step?: number | string;
		onchange?: () => void;
	} = $props();

	// Generate a stable fallback ID per component instance if no id prop is provided.
	// Using $state ensures the ID is generated once per instance and remains stable.
	const fallbackId = $state(generateUid(10));

	// Use provided id or fallback to generated ID.
	// Using $derived ensures we always use the provided id if available, otherwise the fallback.
	const effectiveId = $derived(id ?? fallbackId);

	// Local string state for the Select value. This keeps the Select value (string)
	// independent from the numeric `value` prop so we can handle conversion manually.
	let selectValue = $state('');

	// Find the option that matches the current numeric value
	const currentOption = $derived.by(() => {
		if (value === undefined || Number.isNaN(value)) return null;
		return options.find((opt) => Number(opt.value) === value) ?? null;
	});

	// Sync the local Select value whenever the external numeric value changes.
	$effect(() => {
		if (currentOption) {
			selectValue = currentOption.value;
		} else if (value !== undefined && !Number.isNaN(value)) {
			// Fallback: if value doesn't match any option, use the numeric value as string
			selectValue = String(value);
		} else {
			selectValue = '';
		}
	});

	// Effective slider bounds derived from sliderMin/sliderMax (defaults to 0 and 1),
	// clamped to min/max when those are set.
	const effectiveSliderMin = $derived.by(() => {
		const base = sliderMin ?? min ?? 0;
		if (min !== undefined && base < min) return min;
		return base;
	});
	const effectiveSliderMax = $derived.by(() => {
		const base = sliderMax ?? max ?? 1;
		if (max !== undefined && base > max) return max;
		return base;
	});

	// Clamps value to hard boundaries (min/max props).
	const clampToValueRange = (val: number | undefined): number => {
		let v = val ?? effectiveSliderMin;
		if (min !== undefined && v < min) v = min;
		if (max !== undefined && v > max) v = max;
		return v;
	};

	// Clamps value to slider view range (sliderMin/sliderMax).
	const clampToSliderRange = (val: number | undefined): number => {
		let v = val ?? effectiveSliderMin;
		if (v < effectiveSliderMin) v = effectiveSliderMin;
		if (v > effectiveSliderMax) v = effectiveSliderMax;
		return v;
	};

	const numericStep = $derived(typeof step === 'string' ? Number(step) : step);

	// Get display label for current value
	const displayLabel = $derived.by(() => {
		if (currentOption) return currentOption.label;
		if (value !== undefined && !Number.isNaN(value)) return String(value);
		return '';
	});
</script>

<div class="space-y-2">
	{#if label}
		<div class="flex items-center justify-between">
			<Label for={effectiveId} class="text-xs">{label}</Label>
			<div class="w-24">
				<Select
					type="single"
					bind:value={selectValue}
					onValueChange={(v) => {
						if (v) {
							selectValue = v;
							const parsed = Number.parseInt(v, 10);
							if (!Number.isNaN(parsed)) {
								value = clampToValueRange(parsed);
								// Notify parent about the change
								onchange?.();
							}
						}
					}}
				>
					<SelectTrigger id={effectiveId} class="h-5! w-full text-[0.7rem]">
						<span class="truncate">
							{displayLabel}
						</span>
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectLabel>{label || 'Options'}</SelectLabel>
							{#each options as option (option.value)}
								<SelectItem value={option.value} label={option.label}>
									{option.label}
								</SelectItem>
							{/each}
						</SelectGroup>
					</SelectContent>
				</Select>
			</div>
		</div>
	{/if}
	<Slider
		type="single"
		min={effectiveSliderMin}
		max={effectiveSliderMax}
		step={numericStep}
		value={clampToSliderRange(value)}
		onValueChange={(next) => {
			if (Array.isArray(next)) return;
			const clamped = clampToValueRange(next);
			value = clamped;
			// Update Select to match the new value
			const matchingOption = options.find((opt) => Number(opt.value) === clamped);
			if (matchingOption) {
				selectValue = matchingOption.value;
			} else {
				selectValue = String(clamped);
			}
			// Notify parent about the change so it can persist to token store
			onchange?.();
		}}
	/>
</div>
