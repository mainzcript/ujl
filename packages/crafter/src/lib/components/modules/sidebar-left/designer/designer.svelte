<script lang="ts">
	import {
		SidebarGroup,
		SidebarGroupLabel,
		SidebarGroupContent,
		ColorPicker,
		Label
	} from '@ujl-framework/ui';

	// Color state for design tokens
	let primaryColor = $state('#3b82f6');
	let secondaryColor = $state('#8b5cf6');
	let backgroundColor = $state('#ffffff');
	let textColor = $state('#000000');
	let accentColor = $state('#10b981');
</script>

<div
	data-slot="sidebar-group"
	data-sidebar="group"
	class="relative flex w-full min-w-0 flex-col p-2"
>
	<SidebarGroup>
		<SidebarGroupLabel>Designer</SidebarGroupLabel>
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
				<Label for="background-color" class="text-xs">Background Color</Label>
				<ColorPicker id="background-color" bind:value={backgroundColor} />
			</div>

			<!-- Text Color -->
			<div class="space-y-2">
				<Label for="text-color" class="text-xs">Text Color</Label>
				<ColorPicker id="text-color" bind:value={textColor} />
			</div>

			<!-- Accent Color -->
			<div class="space-y-2">
				<Label for="accent-color" class="text-xs">Accent Color</Label>
				<ColorPicker id="accent-color" bind:value={accentColor} />
			</div>
		</SidebarGroupContent>
	</SidebarGroup>
</div>
