<script lang="ts">
	import NavUser from './_nav-user.svelte';
	import {
		Sidebar,
		SidebarHeader,
		SidebarContent,
		SidebarGroup,
		SidebarGroupLabel,
		SidebarGroupContent,
		Input,
		Textarea,
		Select,
		SelectTrigger,
		SelectContent,
		SelectItem,
		SelectLabel,
		SelectGroup,
		Switch,
		Label,
		Slider,
		Text
	} from '@ujl-framework/ui';
	import type { ComponentProps } from 'svelte';

	// This is sample data.
	const data = {
		user: {
			name: 'shadcn',
			email: 'm@example.com',
			avatar: '/avatars/shadcn.jpg'
		}
	};

	// Form state
	let titleValue = $state('UJL Framework Example');
	let descriptionValue = $state('A comprehensive example showcasing UJL framework capabilities');
	let selectValue = $state<string | undefined>(undefined);
	let switchValue = $state(false);
	let sliderValue = $state(50);

	const selectOptions = [
		{ value: 'container', label: 'Container' },
		{ value: 'text', label: 'Text' },
		{ value: 'grid', label: 'Grid' },
		{ value: 'card', label: 'Card' },
		{ value: 'button', label: 'Button' }
	];

	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar> = $props();
</script>

<Sidebar
	bind:ref
	collapsible="none"
	class="sticky top-0 hidden h-svh border-l lg:flex"
	{...restProps}
>
	<SidebarHeader class="h-16 border-b border-sidebar-border">
		<NavUser user={data.user} />
	</SidebarHeader>
	<SidebarContent class="overflow-y-auto">
		<SidebarGroup>
			<SidebarGroupLabel>Properties</SidebarGroupLabel>
			<SidebarGroupContent class="space-y-4 p-4">
				<!-- Title Input -->
				<div class="space-y-2">
					<Label for="title" class="text-xs">Title</Label>
					<Input id="title" bind:value={titleValue} placeholder="Enter title..." />
				</div>

				<!-- Description Textarea -->
				<div class="space-y-2">
					<Label for="description" class="text-xs">Description</Label>
					<Textarea
						id="description"
						bind:value={descriptionValue}
						placeholder="Enter description..."
						rows={3}
					/>
				</div>

				<!-- Type Select -->
				<div class="space-y-2">
					<Label for="type" class="text-xs">Type</Label>
					<Select type="single" bind:value={selectValue}>
						<SelectTrigger id="type" class="w-full">
							{selectValue || 'Select type...'}
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectLabel>Module Types</SelectLabel>
								{#each selectOptions as option (option.value)}
									<SelectItem value={option.value} label={option.label}>
										{option.label}
									</SelectItem>
								{/each}
							</SelectGroup>
						</SelectContent>
					</Select>
				</div>

				<!-- Switch -->
				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<Label for="enabled" class="text-xs">Enabled</Label>
						<Switch id="enabled" bind:checked={switchValue} />
					</div>
				</div>

				<!-- Slider -->
				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<Label for="opacity" class="text-xs">Opacity</Label>
						<Text size="xs" intensity="muted">{sliderValue}%</Text>
					</div>
					<Slider
						id="opacity"
						type="single"
						bind:value={sliderValue}
						max={100}
						step={1}
						class="w-full"
					/>
				</div>

				<!-- Additional Input Fields -->
				<div class="space-y-2">
					<Label for="url" class="text-xs">URL</Label>
					<Input id="url" type="url" placeholder="https://example.com" />
				</div>

				<div class="space-y-2">
					<Label for="email" class="text-xs">Email</Label>
					<Input id="email" type="email" placeholder="email@example.com" />
				</div>

				<div class="space-y-2">
					<Label for="number" class="text-xs">Number</Label>
					<Input id="number" type="number" placeholder="0" />
				</div>
			</SidebarGroupContent>
		</SidebarGroup>
	</SidebarContent>
</Sidebar>
