<!--
	Number slider with synchronized input component.
	Wraps InputGroup with InputGroupInput and a fixed suffix (rem/em).
	Manages numeric values with a visual unit suffix and a synchronized slider for better UX.
-->
<script lang="ts">
	import {
		InputGroup,
		InputGroupInput,
		InputGroupAddon,
		InputGroupText,
		Slider,
		Label,
	} from "@ujl-framework/ui";
	import { generateUid } from "@ujl-framework/core";
	import type { ComponentProps } from "svelte";

	let {
		value = $bindable<number | undefined>(),
		suffix,
		step,
		sliderMin = 0,
		sliderMax = 1,
		min,
		max,
		label,
		id,
		onchange,
		...restProps
	}: {
		value?: number;
		suffix: string;
		step: number | string;
		sliderMin?: number;
		sliderMax?: number;
		min?: number;
		max?: number;
		label?: string;
		id?: string;
		onchange?: () => void;
	} & ComponentProps<typeof InputGroupInput> = $props();

	// Generate a stable fallback ID per component instance if no id prop is provided.
	// Using $state ensures the ID is generated once per instance and remains stable.
	const fallbackId = $state(generateUid(10));

	// Use provided id or fallback to generated ID.
	// Using $derived ensures we always use the provided id if available, otherwise the fallback.
	const effectiveId = $derived(id ?? fallbackId);

	// Local string state for the text input value. This keeps the DOM value
	// independent from the numeric `value` prop so we can handle parsing manually.
	let inputValue = $state("");

	// Sync the local text representation whenever the external numeric value changes.
	$effect(() => {
		if (value === undefined || Number.isNaN(value)) {
			inputValue = "";
		} else {
			inputValue = String(value);
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

	const numericStep = $derived(typeof step === "string" ? Number(step) : step);
</script>

<div class="space-y-2">
	{#if label}
		<div class="flex items-center justify-between">
			<Label for={effectiveId} class="text-xs">{label}</Label>
			<div class="w-24">
				<InputGroup class="h-5">
					<InputGroupInput
						id={effectiveId}
						bind:value={inputValue}
						type="text"
						inputmode="decimal"
						{step}
						{min}
						{max}
						class="text-right text-[0.7rem]!"
						{...restProps}
						onchange={() => {
							const normalized = inputValue.trim().replace(",", ".");
							if (!normalized) {
								// Revert to the last valid numeric value (or empty if undefined).
								inputValue = value === undefined || Number.isNaN(value) ? "" : String(value);
								return;
							}

							const parsed = Number(normalized);
							if (Number.isNaN(parsed)) {
								// Invalid input: revert to the last valid numeric value.
								inputValue = value === undefined || Number.isNaN(value) ? "" : String(value);
								return;
							}

							value = clampToValueRange(parsed);
							// Notify parent about the change
							onchange?.();
						}}
					/>
					<InputGroupAddon align="inline-end">
						<InputGroupText class="text-[0.7rem]">{suffix}</InputGroupText>
					</InputGroupAddon>
				</InputGroup>
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
			value = clampToValueRange(next);
			// Notify parent about the change so it can persist to token store
			onchange?.();
		}}
	/>
</div>
