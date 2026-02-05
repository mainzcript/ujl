<!--
	Font weight slider component.
	Specialized wrapper around NumberSliderWithSelect for font-weight editing (100-900).
	Provides semantic labels (Thin, Regular, Bold, etc.) synchronized with numeric values.
-->
<script lang="ts">
	import { NumberSliderWithSelect } from "../number-slider-with-select/index.js";
	import type { ComponentProps } from "svelte";

	// Font weight options with semantic labels
	const fontWeightOptions = [
		{ value: "100", label: "Thin" },
		{ value: "200", label: "Extra Light" },
		{ value: "300", label: "Light" },
		{ value: "400", label: "Regular" },
		{ value: "500", label: "Medium" },
		{ value: "600", label: "Semi Bold" },
		{ value: "700", label: "Bold" },
		{ value: "800", label: "Extra Bold" },
		{ value: "900", label: "Black" },
	];

	let {
		value = $bindable<number | undefined>(),
		label = "Weight",
		id,
		onchange,
		...restProps
	}: {
		value?: number;
		label?: string;
		id?: string;
		onchange?: () => void;
	} & Omit<
		ComponentProps<typeof NumberSliderWithSelect>,
		"options" | "label" | "sliderMin" | "sliderMax" | "min" | "max" | "step"
	> = $props();
</script>

<NumberSliderWithSelect
	{id}
	{label}
	bind:value
	options={fontWeightOptions}
	sliderMin={100}
	sliderMax={900}
	min={100}
	max={900}
	step={100}
	{onchange}
	{...restProps}
/>
