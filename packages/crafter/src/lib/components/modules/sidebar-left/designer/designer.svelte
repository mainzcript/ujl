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
</script>

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
				<!-- Color for light elements -->
				<div class="space-y-2">
					<Label for="ambient-light" class="text-xs">Light</Label>
					<ColorPicker id="ambient-light" bind:value={ambientLightColor} />
				</div>

				<!-- Color for dark elements -->
				<div class="space-y-2">
					<Label for="ambient-dark" class="text-xs">Dark</Label>
					<ColorPicker id="ambient-dark" bind:value={ambientDarkColor} />
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
					Theme Colors
				</CollapsibleTrigger>
			{/snippet}
		</SidebarGroupLabel>
		<CollapsibleContent>
			<SidebarGroupContent class="space-y-4 p-4">
				<!-- Primary Color -->
				<div class="space-y-2">
					<Label for="primary-color" class="text-xs">Primary Color</Label>
					<ColorPicker id="primary-color" bind:value={primaryColor} />
				</div>

				<!-- Secondary Color -->
				<div class="space-y-2">
					<Label for="secondary-color" class="text-xs">Secondary Color</Label>
					<ColorPicker id="secondary-color" bind:value={secondaryColor} />
				</div>

				<!-- Background Color -->
				<div class="space-y-2">
					<Label for="accent-color" class="text-xs">Accent Color</Label>
					<ColorPicker id="accent-color" bind:value={accentColor} />
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
				<!-- Success Color -->
				<div class="space-y-2">
					<Label for="success-color" class="text-xs">Success Color</Label>
					<ColorPicker id="success-color" bind:value={successColor} />
				</div>

				<!-- Warning Color -->
				<div class="space-y-2">
					<Label for="warning-color" class="text-xs">Warning Color</Label>
					<ColorPicker id="warning-color" bind:value={warningColor} />
				</div>

				<!-- Destructive Color -->
				<div class="space-y-2">
					<Label for="destructive-color" class="text-xs">Destructive Color</Label>
					<ColorPicker id="destructive-color" bind:value={destructiveColor} />
				</div>

				<!-- Info Color -->
				<div class="space-y-2">
					<Label for="info-color" class="text-xs">Info Color</Label>
					<ColorPicker id="info-color" bind:value={infoColor} />
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
