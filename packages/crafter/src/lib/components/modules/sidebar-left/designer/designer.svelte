<script lang="ts">
	import {
		SidebarGroup,
		SidebarGroupLabel,
		SidebarGroupContent,
		ColorPicker,
		Label,
		Slider,
		Text,
		Collapsible,
		CollapsibleTrigger,
		CollapsibleContent
	} from '@ujl-framework/ui';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import {
		generateColorPalette,
		interpolateAmbientPalette,
		getReferencePalette
	} from '$lib/tools/colorPlate.js';

	// Color state for design tokens
	let ambientLightColor = $state('#ffffff');
	let ambientDarkColor = $state('#000000');
	let primaryColor = $state('#3b82f6');
	let secondaryColor = $state('#8b5cf6');
	let accentColor = $state('#10b981');
	let successColor = $state('#10b981');
	let warningColor = $state('#10b981');
	let destructiveColor = $state('#10b981');
	let infoColor = $state('#10b981');

	// Radius state for design tokens (0-2 rem range)
	let radius = $state(0.75);

	// Generated palettes for all colors
	let ambientLightPalette = $derived.by(() => {
		try {
			return generateColorPalette(ambientLightColor);
		} catch (error) {
			console.error('Error generating ambient light palette:', error);
			return null;
		}
	});

	let ambientDarkPalette = $derived.by(() => {
		try {
			return generateColorPalette(ambientDarkColor);
		} catch (error) {
			console.error('Error generating ambient dark palette:', error);
			return null;
		}
	});

	// Mid palette (zinc reference palette)
	let ambientMidPalette = $derived.by(() => {
		try {
			return getReferencePalette('zinc');
		} catch (error) {
			console.error('Error getting zinc reference palette:', error);
			return null;
		}
	});

	// Final ambient palette interpolated from light, mid (zinc), and dark with shade-specific factors
	let ambientPalette = $derived.by(() => {
		if (!ambientLightPalette || !ambientMidPalette || !ambientDarkPalette) {
			return null;
		}
		try {
			return interpolateAmbientPalette(ambientLightPalette, ambientMidPalette, ambientDarkPalette);
		} catch (error) {
			console.error('Error interpolating ambient palette:', error);
			return null;
		}
	});

	let primaryPalette = $derived.by(() => {
		try {
			return generateColorPalette(primaryColor);
		} catch (error) {
			console.error('Error generating primary palette:', error);
			return null;
		}
	});

	let secondaryPalette = $derived.by(() => {
		try {
			return generateColorPalette(secondaryColor);
		} catch (error) {
			console.error('Error generating secondary palette:', error);
			return null;
		}
	});

	let accentPalette = $derived.by(() => {
		try {
			return generateColorPalette(accentColor);
		} catch (error) {
			console.error('Error generating accent palette:', error);
			return null;
		}
	});

	let successPalette = $derived.by(() => {
		try {
			return generateColorPalette(successColor);
		} catch (error) {
			console.error('Error generating success palette:', error);
			return null;
		}
	});

	let warningPalette = $derived.by(() => {
		try {
			return generateColorPalette(warningColor);
		} catch (error) {
			console.error('Error generating warning palette:', error);
			return null;
		}
	});

	let destructivePalette = $derived.by(() => {
		try {
			return generateColorPalette(destructiveColor);
		} catch (error) {
			console.error('Error generating destructive palette:', error);
			return null;
		}
	});

	let infoPalette = $derived.by(() => {
		try {
			return generateColorPalette(infoColor);
		} catch (error) {
			console.error('Error generating info palette:', error);
			return null;
		}
	});

	const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
</script>

{#snippet palettePreview(palette: ReturnType<typeof generateColorPalette> | null)}
	{#if palette}
		<div class="space-y-2 pt-2">
			<Text size="xs" intensity="muted" class="block">Generated Palette</Text>
			<div class="flex flex-wrap gap-1">
				{#each SHADES as shade (shade)}
					{#if palette.shades[shade]}
						<div
							class="h-6 w-6 rounded border border-border"
							style="background-color: {palette.shades[shade].hex};"
							title="Shade {shade}: {palette.shades[shade].hex}"
						></div>
					{/if}
				{/each}
			</div>
		</div>
	{/if}
{/snippet}

<Collapsible open class="group/collapsible">
	<SidebarGroup>
		<SidebarGroupLabel>
			{#snippet child({ props })}
				<CollapsibleTrigger {...props}>
					<ChevronRightIcon
						class="mr-1 transition-transform group-data-[state=open]/collapsible:rotate-90"
					/>
					Ambient Colors
				</CollapsibleTrigger>
			{/snippet}
		</SidebarGroupLabel>
		<CollapsibleContent>
			<SidebarGroupContent class="space-y-4 p-4">
				<!-- Light color input -->
				<div class="space-y-2">
					<Label for="ambient-light" class="text-xs">Light</Label>
					<ColorPicker id="ambient-light" bind:value={ambientLightColor} />
				</div>

				<!-- Dark color input -->
				<div class="space-y-2">
					<Label for="ambient-dark" class="text-xs">Dark</Label>
					<ColorPicker id="ambient-dark" bind:value={ambientDarkColor} />
				</div>

				<!-- Final interpolated ambient palette -->
				{#if ambientPalette}
					<div class="space-y-2 pt-2">
						<Text size="xs" intensity="muted" class="block">Ambient Palette</Text>
						<div class="flex flex-wrap gap-1">
							{#each SHADES as shade (shade)}
								{#if ambientPalette.shades[shade]}
									<div
										class="h-6 w-6 rounded border border-border"
										style="background-color: {ambientPalette.shades[shade].hex};"
										title="Shade {shade}: {ambientPalette.shades[shade].hex}"
									></div>
								{/if}
							{/each}
						</div>
					</div>
				{/if}
			</SidebarGroupContent>
		</CollapsibleContent>
	</SidebarGroup>
</Collapsible>

<Collapsible open class="group/collapsible">
	<SidebarGroup>
		<SidebarGroupLabel>
			{#snippet child({ props })}
				<CollapsibleTrigger {...props}>
					<ChevronRightIcon
						class="mr-1 transition-transform group-data-[state=open]/collapsible:rotate-90"
					/>
					Theme Colors
				</CollapsibleTrigger>
			{/snippet}
		</SidebarGroupLabel>
		<CollapsibleContent>
			<SidebarGroupContent class="space-y-4 p-4">
				<!-- Primary color input -->
				<div class="space-y-2">
					<Label for="primary-color" class="text-xs">Primary Color</Label>
					<ColorPicker id="primary-color" bind:value={primaryColor} />
					{@render palettePreview(primaryPalette)}
				</div>

				<!-- Secondary color input -->
				<div class="space-y-2">
					<Label for="secondary-color" class="text-xs">Secondary Color</Label>
					<ColorPicker id="secondary-color" bind:value={secondaryColor} />
					{@render palettePreview(secondaryPalette)}
				</div>

				<!-- Accent color input -->
				<div class="space-y-2">
					<Label for="accent-color" class="text-xs">Accent Color</Label>
					<ColorPicker id="accent-color" bind:value={accentColor} />
					{@render palettePreview(accentPalette)}
				</div>
			</SidebarGroupContent>
		</CollapsibleContent>
	</SidebarGroup>
</Collapsible>

<Collapsible open class="group/collapsible">
	<SidebarGroup>
		<SidebarGroupLabel>
			{#snippet child({ props })}
				<CollapsibleTrigger {...props}>
					<ChevronRightIcon
						class="mr-1 transition-transform group-data-[state=open]/collapsible:rotate-90"
					/>
					Notification Colors
				</CollapsibleTrigger>
			{/snippet}
		</SidebarGroupLabel>
		<CollapsibleContent>
			<SidebarGroupContent class="space-y-4 p-4">
				<!-- Success color input -->
				<div class="space-y-2">
					<Label for="success-color" class="text-xs">Success Color</Label>
					<ColorPicker id="success-color" bind:value={successColor} />
					{@render palettePreview(successPalette)}
				</div>

				<!-- Warning color input -->
				<div class="space-y-2">
					<Label for="warning-color" class="text-xs">Warning Color</Label>
					<ColorPicker id="warning-color" bind:value={warningColor} />
					{@render palettePreview(warningPalette)}
				</div>

				<!-- Destructive color input -->
				<div class="space-y-2">
					<Label for="destructive-color" class="text-xs">Destructive Color</Label>
					<ColorPicker id="destructive-color" bind:value={destructiveColor} />
					{@render palettePreview(destructivePalette)}
				</div>

				<!-- Info color input -->
				<div class="space-y-2">
					<Label for="info-color" class="text-xs">Info Color</Label>
					<ColorPicker id="info-color" bind:value={infoColor} />
					{@render palettePreview(infoPalette)}
				</div>
			</SidebarGroupContent>
		</CollapsibleContent>
	</SidebarGroup>
</Collapsible>

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
			<SidebarGroupContent class="space-y-4 p-4">
				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<Label for="radius" class="text-xs">Radius</Label>
						<Text size="xs" intensity="muted">{radius} rem</Text>
					</div>
					<Slider
						id="radius"
						type="single"
						bind:value={radius}
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
