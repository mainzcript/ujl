<script lang="ts">
	import { untrack } from 'svelte';
	import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@ujl-framework/ui';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import type { UJLTTypographyCode } from '@ujl-framework/types';
	import {
		FontCombobox,
		NumberSliderWithInput,
		FontWeightSlider
	} from '../../../../../ui/index.js';

	let {
		typography,
		onChange
	}: {
		typography: UJLTTypographyCode;
		onChange?: (updates: Partial<UJLTTypographyCode>) => void;
	} = $props();

	let font = $state(untrack(() => typography.font));
	let size = $state(untrack(() => typography.size));
	let lineHeight = $state(untrack(() => typography.lineHeight));
	let letterSpacing = $state(untrack(() => typography.letterSpacing));
	let weight = $state(untrack(() => typography.weight));

	// Track previous value to detect external changes vs user-initiated changes
	let previous = $state(untrack(() => typography));

	// Sync state to handle theme switching without losing user edits
	$effect(() => {
		if (typography !== previous) {
			font = typography.font;
			size = typography.size;
			lineHeight = typography.lineHeight;
			letterSpacing = typography.letterSpacing;
			weight = typography.weight;
			previous = typography;
		}
	});

	function handleUpdate(field: keyof UJLTTypographyCode, value: unknown) {
		if (onChange) {
			onChange({ [field]: value } as Partial<UJLTTypographyCode>);
		}
	}
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
				Code
			</CollapsibleTrigger>
		</div>
		<CollapsibleContent>
			<div class="w-full space-y-8 p-4 text-sm">
				<FontCombobox
					id="code-font"
					bind:value={font}
					onchange={(value) => {
						font = value;
						handleUpdate('font', value);
					}}
				/>
				<NumberSliderWithInput
					id="code-size"
					label="Size"
					bind:value={size}
					placeholder="0.95"
					suffix="rem"
					step={0.1}
					min={0}
					sliderMin={0.5}
					sliderMax={2}
					onchange={() => handleUpdate('size', size)}
				/>
				<NumberSliderWithInput
					id="code-line-height"
					label="Line Height"
					bind:value={lineHeight}
					placeholder="1.5"
					suffix="em"
					step={0.1}
					min={0}
					sliderMin={0.8}
					sliderMax={2.5}
					onchange={() => handleUpdate('lineHeight', lineHeight)}
				/>
				<NumberSliderWithInput
					id="code-letter-spacing"
					label="Letter Spacing"
					bind:value={letterSpacing}
					placeholder="0"
					suffix="em"
					step={0.01}
					sliderMin={-0.1}
					sliderMax={0.1}
					onchange={() => handleUpdate('letterSpacing', letterSpacing)}
				/>
				<FontWeightSlider
					id="code-weight"
					label="Weight"
					bind:value={weight}
					onchange={() => handleUpdate('weight', weight)}
				/>
			</div>
		</CollapsibleContent>
	</div>
</Collapsible>
