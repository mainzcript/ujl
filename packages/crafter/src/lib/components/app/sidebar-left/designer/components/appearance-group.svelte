<script lang="ts">
	import {
		SidebarGroup,
		SidebarGroupLabel,
		SidebarGroupContent,
		Collapsible,
		CollapsibleTrigger,
		CollapsibleContent
	} from '@ujl-framework/ui';
	import { NumberSliderWithInput } from '$lib/components/ui/index.js';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';

	let {
		radiusValue,
		onRadiusChange,
		spacingValue,
		onSpacingChange
	}: {
		radiusValue: number;
		onRadiusChange?: (value: number) => void;
		spacingValue: number;
		onSpacingChange?: (value: number) => void;
	} = $props();
</script>

<Collapsible class="group/collapsible">
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
				<NumberSliderWithInput
					id="radius"
					label="Radius"
					bind:value={radiusValue}
					suffix="rem"
					step={0.05}
					min={0}
					sliderMin={0}
					sliderMax={2}
					onchange={() => onRadiusChange?.(radiusValue)}
				/>
				<NumberSliderWithInput
					id="spacing"
					label="Spacing"
					bind:value={spacingValue}
					suffix="rem"
					step={0.01}
					min={0}
					sliderMin={0.1}
					sliderMax={0.4}
					onchange={() => onSpacingChange?.(spacingValue)}
				/>
			</SidebarGroupContent>
		</CollapsibleContent>
	</SidebarGroup>
</Collapsible>
