<!--
	Appearance group for editing border radius.
	Uses local slider state and reports changes via onRadiusChange; designer.svelte performs token updates.
-->
<script lang="ts">
	import {
		SidebarGroup,
		SidebarGroupLabel,
		SidebarGroupContent,
		Slider,
		Label,
		Text,
		Collapsible,
		CollapsibleTrigger,
		CollapsibleContent
	} from '@ujl-framework/ui';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';

	let {
		radiusValue,
		radiusDisplayValue,
		onRadiusChange
	}: {
		radiusValue: number;
		radiusDisplayValue: number;
		onRadiusChange?: (value: number) => void;
	} = $props();

	// Local state for the slider, initialized from prop
	// Note: We use $state here because the Slider component requires a bindable value.
	let sliderValue = $state(radiusValue);

	// Track previous value to detect user-initiated changes
	let previousValue = $state(radiusValue);

	// Sync sliderValue with prop when it changes externally
	$effect(() => {
		if (radiusValue !== previousValue) {
			sliderValue = radiusValue;
			previousValue = radiusValue;
		}
	});

	// Call onChange when sliderValue changes from user interaction
	$effect(() => {
		if (sliderValue !== previousValue && sliderValue !== radiusValue && onRadiusChange) {
			previousValue = sliderValue;
			onRadiusChange(sliderValue);
		}
	});
</script>

<Collapsible open class="group/collapsible">
	<SidebarGroup>
		<SidebarGroupLabel>
			{#snippet child({ props })}
				<CollapsibleTrigger {...props}>
					<ChevronRightIcon
						class="mr-1 transition-transform group-data-[state=open]/collapsible:rotate-90"
					/>
					Appearance
				</CollapsibleTrigger>
			{/snippet}
		</SidebarGroupLabel>
		<CollapsibleContent>
			<SidebarGroupContent class="space-y-8 p-4">
				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<Label for="radius" class="text-xs">Radius</Label>
						<Text size="xs" intensity="muted">{radiusDisplayValue} rem</Text>
					</div>
					<Slider
						id="radius"
						type="single"
						bind:value={sliderValue}
						min={0}
						max={2}
						step={0.05}
						class="w-full"
					/>
				</div>
			</SidebarGroupContent>
		</CollapsibleContent>
	</SidebarGroup>
</Collapsible>
