<!--
	Flavor selection component with color preview.
	Displays a color dot next to each flavor option based on the palette.
-->
<script lang="ts">
	import {
		Select,
		SelectTrigger,
		SelectContent,
		SelectItem,
		SelectLabel,
		SelectGroup,
		Label
	} from '@ujl-framework/ui';
	import type { UJLTTypographyFlavor, UJLTColorPalette } from '@ujl-framework/types';
	import { typographyFlavors } from '@ujl-framework/types';
	import { formatOklch } from '../../../utils/colors/index.js';

	let {
		id,
		label = 'Flavor',
		value = $bindable<UJLTTypographyFlavor>(),
		palette,
		onchange
	}: {
		id: string;
		label?: string;
		value?: UJLTTypographyFlavor;
		palette: UJLTColorPalette;
		onchange?: (value: UJLTTypographyFlavor) => void;
	} = $props();

	const flavorOptions = typographyFlavors.map((flavor) => ({
		value: flavor,
		label: flavor.charAt(0).toUpperCase() + flavor.slice(1)
	}));

	// Extract hex colors for all typography flavors from the palette
	const flavorColors = $derived.by(() => {
		const colors: Record<UJLTTypographyFlavor, { light: string; dark: string }> = {} as Record<
			UJLTTypographyFlavor,
			{ light: string; dark: string }
		>;
		for (const flavor of typographyFlavors) {
			const colorSet = palette[flavor];
			if (colorSet) {
				colors[flavor] = {
					light: formatOklch(colorSet.shades[palette.ambient.lightForeground[flavor]]),
					dark: formatOklch(colorSet.shades[palette.ambient.darkForeground[flavor]])
				};
			}
		}
		return colors;
	});
</script>

<div class="space-y-2">
	<Label for={id} class="text-xs">{label}</Label>
	<Select
		type="single"
		bind:value
		onValueChange={(v) => {
			if (v) {
				value = v as UJLTTypographyFlavor;
				onchange?.(v as UJLTTypographyFlavor);
			}
		}}
	>
		<SelectTrigger {id} class="w-full">
			<div class="flex items-center gap-2">
				<span
					class="h-3 w-3 shrink-0 rounded-full border border-border dark:hidden"
					style="background-color: oklch({flavorColors[value].light});"
				></span>
				<span
					class="hidden h-3 w-3 shrink-0 rounded-full border border-border dark:block"
					style="background-color: oklch({flavorColors[value].dark});"
				></span>
				{flavorOptions.find((o) => o.value === value)?.label ?? value}
			</div>
		</SelectTrigger>
		<SelectContent>
			<SelectGroup>
				<SelectLabel>Flavor</SelectLabel>
				{#each flavorOptions as option (option.value)}
					<SelectItem value={option.value} label={option.label}>
						<span>
							<span
								class="h-3 w-3 shrink-0 rounded-full border border-border dark:hidden"
								style="background-color: oklch({flavorColors[option.value].light});"
							></span>
							<span
								class="hidden h-3 w-3 shrink-0 rounded-full border border-border dark:block"
								style="background-color: oklch({flavorColors[option.value].dark});"
							></span>
						</span>
						{option.label}
					</SelectItem>
				{/each}
			</SelectGroup>
		</SelectContent>
	</Select>
</div>
