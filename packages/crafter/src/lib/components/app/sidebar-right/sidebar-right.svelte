<script lang="ts">
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
		Text,
		Button,
		DropdownMenu,
		DropdownMenuTrigger,
		DropdownMenuContent,
		DropdownMenuItem,
		useSidebar
	} from '@ujl-framework/ui';
	import type { ComponentProps } from 'svelte';
	import ShareIcon from '@lucide/svelte/icons/share';
	import FileJsonIcon from '@lucide/svelte/icons/file-json';
	import FolderOpenIcon from '@lucide/svelte/icons/folder-open';

	let {
		ref = $bindable(null),
		onExportTheme,
		onExportContent,
		onImportTheme,
		onImportContent,
		...restProps
	}: ComponentProps<typeof Sidebar> & {
		onExportTheme?: () => void;
		onExportContent?: () => void;
		onImportTheme?: (file: File) => void;
		onImportContent?: (file: File) => void;
	} = $props();

	let themeFileInput: HTMLInputElement | null = $state(null);
	let contentFileInput: HTMLInputElement | null = $state(null);

	function handleThemeFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file && onImportTheme) {
			onImportTheme(file);
			target.value = ''; // Reset input
		}
	}

	function handleContentFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file && onImportContent) {
			onImportContent(file);
			target.value = ''; // Reset input
		}
	}

	const sidebar = useSidebar();

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
</script>

<Sidebar
	bind:ref
	collapsible="none"
	class="sticky top-0 hidden h-svh border-l lg:flex"
	{...restProps}
>
	<SidebarHeader class="border-b border-sidebar-border">
		<div class="flex items-center justify-end gap-2">
			<!-- Hidden file inputs -->
			<input
				type="file"
				accept=".ujlt.json,application/json"
				bind:this={themeFileInput}
				onchange={handleThemeFileSelect}
				class="hidden"
			/>
			<input
				type="file"
				accept=".ujlc.json,application/json"
				bind:this={contentFileInput}
				onchange={handleContentFileSelect}
				class="hidden"
			/>

			<!-- Import Dropdown -->
			<DropdownMenu>
				<DropdownMenuTrigger title="Import">
					{#snippet child({ props })}
						<Button variant="muted" size="icon" class="size-8" {...props}>
							<FolderOpenIcon />
						</Button>
					{/snippet}
				</DropdownMenuTrigger>
				<DropdownMenuContent
					class="w-56"
					side={sidebar.isMobile ? 'bottom' : 'right'}
					align="end"
					sideOffset={4}
				>
					<DropdownMenuItem
						onclick={() => themeFileInput?.click()}
						title="Import a .ujlt.json file"
					>
						<FileJsonIcon class="mr-2 size-4" />
						<span>Import Theme</span>
					</DropdownMenuItem>
					<DropdownMenuItem
						onclick={() => contentFileInput?.click()}
						title="Import a .ujlc.json file"
					>
						<FileJsonIcon class="mr-2 size-4" />
						<span>Import Content</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<!-- Export Dropdown -->
			<DropdownMenu>
				<DropdownMenuTrigger title="Export">
					{#snippet child({ props })}
						<Button variant="muted" size="icon" class="size-8" {...props}>
							<ShareIcon />
						</Button>
					{/snippet}
				</DropdownMenuTrigger>
				<DropdownMenuContent
					class="w-56"
					side={sidebar.isMobile ? 'bottom' : 'right'}
					align="end"
					sideOffset={4}
				>
					<DropdownMenuItem onclick={() => onExportTheme?.()} title="Get the .ujlt.json file">
						<FileJsonIcon class="mr-2 size-4" />
						<span>Export Theme</span>
					</DropdownMenuItem>
					<DropdownMenuItem onclick={() => onExportContent?.()} title="Get the .ujlc.json file">
						<FileJsonIcon class="mr-2 size-4" />
						<span>Export Content</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<Button variant="primary" size="sm" onclick={() => alert('This will be implemented soon')}
				>Save</Button
			>
		</div>
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
