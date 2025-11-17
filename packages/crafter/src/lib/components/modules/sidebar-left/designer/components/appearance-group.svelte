<!--
	Appearance group component.
	
	This is a presentational component that displays UI controls for editing appearance settings
	(border radius). It receives the radius value as a bindable prop and does not
	perform any token updates itself.
	
	All token updates are handled by the parent designer.svelte component via reactive effects.
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
		radiusValue = $bindable(),
		radiusDisplayValue
	}: {
		radiusValue?: number;
		radiusDisplayValue: number;
	} = $props();
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
						bind:value={radiusValue}
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
