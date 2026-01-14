<!--
	Base typography group for editing base text typography tokens.
	Receives UJLTTypographyBase props and forwards changes via onChange callback to designer-panel.svelte.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@ujl-framework/ui';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import type { UJLTTypographyBase } from '@ujl-framework/types';
	import {
		FontCombobox,
		StyleToggles,
		NumberSliderWithInput,
		FontWeightSlider
	} from '$lib/components/ui/index.js';

	let {
		typography,
		onChange
	}: {
		typography: UJLTTypographyBase;
		onChange?: (updates: Partial<UJLTTypographyBase>) => void;
	} = $props();

	let font = $state(untrack(() => typography.font));
	let size = $state(untrack(() => typography.size));
	let lineHeight = $state(untrack(() => typography.lineHeight));
	let letterSpacing = $state(untrack(() => typography.letterSpacing));
	let weight = $state(untrack(() => typography.weight));
	let italic = $state(untrack(() => typography.italic));
	let underline = $state(untrack(() => typography.underline));
	let textTransform = $state(untrack(() => typography.textTransform));

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
			italic = typography.italic;
			underline = typography.underline;
			textTransform = typography.textTransform;
			previous = typography;
		}
	});

	function handleUpdate(field: keyof UJLTTypographyBase, value: unknown) {
		if (onChange) {
			onChange({ [field]: value } as Partial<UJLTTypographyBase>);
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
				Base Text
			</CollapsibleTrigger>
		</div>
		<CollapsibleContent>
			<div class="w-full space-y-8 p-4 text-sm">
				<FontCombobox
					id="base-font"
					bind:value={font}
					onchange={(value) => {
						font = value;
						handleUpdate('font', value);
					}}
				/>
				<NumberSliderWithInput
					id="base-size"
					label="Size"
					bind:value={size}
					placeholder="1"
					suffix="rem"
					step={0.1}
					min={0}
					sliderMin={0.5}
					sliderMax={2}
					onchange={() => handleUpdate('size', size)}
				/>
				<NumberSliderWithInput
					id="base-line-height"
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
					id="base-letter-spacing"
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
					id="base-weight"
					label="Weight"
					bind:value={weight}
					onchange={() => handleUpdate('weight', weight)}
				/>
				<StyleToggles
					id="base"
					bind:italic
					bind:underline
					bind:textTransform
					showItalic={true}
					showUnderline={true}
					showTextTransform={true}
					onItalicChange={(v) => {
						italic = v;
						handleUpdate('italic', v);
					}}
					onUnderlineChange={(v) => {
						underline = v;
						handleUpdate('underline', v);
					}}
					onTextTransformChange={(v) => {
						textTransform = v as 'none' | 'capitalize' | 'uppercase' | 'lowercase';
						handleUpdate('textTransform', v);
					}}
				/>
			</div>
		</CollapsibleContent>
	</div>
</Collapsible>
