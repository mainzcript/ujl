<script lang="ts">
	import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@ujl-framework/ui';
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
	<div class="relative flex w-full min-w-0 flex-col p-2">
		<div
			class="flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 ring-sidebar-ring outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0"
		>
			<CollapsibleTrigger class="flex w-full items-center gap-2">
				<ChevronRightIcon
					class="mr-1 size-5 transition-transform group-data-[state=open]/collapsible:rotate-90"
				/>
				Appearance
			</CollapsibleTrigger>
		</div>
		<CollapsibleContent>
			<div class="w-full space-y-8 p-4 text-sm">
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
			</div>
		</CollapsibleContent>
	</div>
</Collapsible>
