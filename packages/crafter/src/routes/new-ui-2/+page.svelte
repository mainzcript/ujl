<script lang="ts">
	import {
		AppLogo,
		AppHeader,
		AppSidebar,
		AppCanvas,
		AppPanel,
		useApp
	} from '$lib/components/ui/app';
	import {
		Button,
		Select,
		SelectTrigger,
		SelectContent,
		SelectGroup,
		SelectLabel,
		SelectItem,
		ToggleGroup,
		ToggleGroupItem,
		DropdownMenu,
		DropdownMenuTrigger,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuSeparator,
		Badge
	} from '@ujl-framework/ui';
	import Settings2Icon from '@lucide/svelte/icons/settings-2';
	import PencilRulerIcon from '@lucide/svelte/icons/pencil-ruler';
	import PaletteIcon from '@lucide/svelte/icons/palette';
	import MonitorIcon from '@lucide/svelte/icons/monitor';
	import TabletIcon from '@lucide/svelte/icons/tablet';
	import SmartphoneIcon from '@lucide/svelte/icons/smartphone';
	import ThreeDotsIcon from '@lucide/svelte/icons/more-vertical';
	import FolderOpenIcon from '@lucide/svelte/icons/folder-open';
	import ShareIcon from '@lucide/svelte/icons/share';

	// useApp() works here because we're inside the App layout
	const app = useApp();

	// Viewport size toggle state
	let viewportType = $state<string | undefined>(undefined);

	// Viewport size mapping
	const VIEWPORT_SIZES: Record<string, number> = {
		desktop: 1024,
		tablet: 768,
		mobile: 375
	};

	// Derived viewport size based on selected type
	const viewportSize = $derived(viewportType ? (VIEWPORT_SIZES[viewportType] ?? null) : null);
</script>

<AppLogo>
	<Badge>UJL</Badge>
</AppLogo>

<AppHeader>
	<div class="flex items-center justify-between py-2">
		<div class="flex items-center gap-2">
			<Select type="single">
				<SelectTrigger>
					<PencilRulerIcon />
					<span>Editor</span>
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						<SelectLabel>Mode</SelectLabel>
						<SelectItem value="editor">
							<PencilRulerIcon />
							<span>Editor</span>
						</SelectItem>
						<SelectItem value="designer">
							<PaletteIcon />
							<span>Designer</span>
						</SelectItem>
					</SelectGroup>
				</SelectContent>
			</Select>

			<ToggleGroup type="single" bind:value={viewportType}>
				<ToggleGroupItem value="desktop" title="Desktop View (1024px)">
					<MonitorIcon />
				</ToggleGroupItem>
				<ToggleGroupItem value="tablet" title="Tablet View (768px)">
					<TabletIcon class="-rotate-90" />
				</ToggleGroupItem>
				<ToggleGroupItem value="mobile" title="Mobile View (375px)">
					<SmartphoneIcon />
				</ToggleGroupItem>
			</ToggleGroup>
		</div>

		<div class="flex items-center gap-2">
			<Button variant="accent" size="sm">Save</Button>
			<DropdownMenu>
				<DropdownMenuTrigger>
					{#snippet child({ props })}
						<Button variant="ghost" size="icon" class="size-8" {...props} title="More Actions">
							<ThreeDotsIcon />
						</Button>
					{/snippet}
				</DropdownMenuTrigger>
				<DropdownMenuContent class="w-56">
					<DropdownMenuItem title="Import a .ujlt.json file">
						<FolderOpenIcon class="mr-2 size-4" />
						<span>Import Theme</span>
					</DropdownMenuItem>
					<DropdownMenuItem title="Import a .ujlc.json file">
						<FolderOpenIcon class="mr-2 size-4" />
						<span>Import Content</span>
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem title="Get the .ujlt.json file">
						<ShareIcon class="mr-2 size-4" />
						<span>Export Theme</span>
					</DropdownMenuItem>
					<DropdownMenuItem title="Get the .ujlc.json file">
						<ShareIcon class="mr-2 size-4" />
						<span>Export Content</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<Button
				onclick={() => app.togglePanel()}
				variant={app.isPanelVisible ? 'muted' : 'ghost'}
				size="icon"
			>
				<Settings2Icon />
			</Button>
		</div>
	</div>
</AppHeader>

<AppSidebar>
	SIDEBAR CONTENT: Here should be the Editor's NavTree. The old UI switched between NavTree and
	Design Tokens depending on the mode. In the new UI, the NavTree should always be shown and the
	Design Tokens should be shown in the Properties Panel.
</AppSidebar>

<AppCanvas>
	<div class="overflow-auto">
		<div
			class="mx-auto min-w-[375px] duration-300"
			style={viewportSize ? `width: ${viewportSize}px;` : 'width: 100%;'}
		>
			<div class="flex flex-1 flex-col gap-4 p-4">
				<div class="grid auto-rows-min gap-4 md:grid-cols-3">
					<div class="aspect-video rounded-xl bg-muted/50"></div>
					<div class="aspect-video rounded-xl bg-muted/50"></div>
					<div class="aspect-video rounded-xl bg-muted/50"></div>
				</div>
				<div class="min-h-[3000px] flex-1 rounded-xl bg-muted/50"></div>
			</div>
		</div>
	</div>
</AppCanvas>

<AppPanel>
	PANEL CONTENT: In Editor mode, this should be the Properties Panel where the modules can be
	configured. In Designer mode, the Tokens can be configured here. In the old UI this was placed in
	the left sidebar but in the new UI it should be placed here.
</AppPanel>
