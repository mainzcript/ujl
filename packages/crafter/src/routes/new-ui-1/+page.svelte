<script lang="ts">
	import {
		SidebarProvider,
		SidebarInset,
		SidebarTrigger,
		Sidebar,
		SidebarHeader,
		SidebarContent,
		SidebarFooter,
		Button,
		DropdownMenu,
		DropdownMenuTrigger,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuSeparator,
		Select,
		SelectTrigger,
		SelectContent,
		SelectGroup,
		SelectLabel,
		SelectItem,
		ToggleGroup,
		ToggleGroupItem,
		Sheet,
		SheetContent,
		SheetHeader,
		SheetTitle,
		SheetDescription,
		Text
	} from '@ujl-framework/ui';
	import Maximize2Icon from '@lucide/svelte/icons/maximize-2';
	import ThreeDotsIcon from '@lucide/svelte/icons/more-vertical';
	import FolderOpenIcon from '@lucide/svelte/icons/folder-open';
	import ShareIcon from '@lucide/svelte/icons/share';
	import PencilRulerIcon from '@lucide/svelte/icons/pencil-ruler';
	import PaletteIcon from '@lucide/svelte/icons/palette';
	import MonitorIcon from '@lucide/svelte/icons/monitor';
	import TabletIcon from '@lucide/svelte/icons/tablet';
	import SmartphoneIcon from '@lucide/svelte/icons/smartphone';
	import PanelRightIcon from '@lucide/svelte/icons/panel-right';

	// Breakpoint für die rechte Sidebar: 1280px Container-Breite
	const RIGHT_SIDEBAR_BREAKPOINT = 1280;

	// State für die Container-Breite und Sheet
	let containerRef: HTMLElement | null = $state(null);
	let containerWidth = $state(0);
	let rightSheetOpen = $state(false);

	// State für die Viewport-Simulation (null = volle Breite, sonst exakte Pixel-Breite)
	// ToggleGroup verwendet Strings, daher speichern wir als String und konvertieren zu Zahl
	let viewportSizeString = $state<string | undefined>(undefined);

	// Konvertiere String zu Zahl (null wenn undefined)
	let viewportSize = $derived(
		viewportSizeString ? (Number.parseInt(viewportSizeString) as 1024 | 768 | 375) : null
	);

	// Reaktive Variable: Sidebar anzeigen wenn Container breit genug ist
	let showRightSidebar = $derived(containerWidth >= RIGHT_SIDEBAR_BREAKPOINT);

	// ResizeObserver für Container-Breite
	$effect(() => {
		if (!containerRef) return;

		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				containerWidth = entry.contentRect.width;
			}
		});

		observer.observe(containerRef);

		return () => {
			observer.disconnect();
		};
	});
</script>

<div bind:this={containerRef} class="flex w-full flex-1">
	<SidebarProvider>
		<Sidebar variant="inset" side="left">
			<SidebarHeader>Left Sidebar Header</SidebarHeader>
			<SidebarContent>Left Sidebar Content</SidebarContent>
			<SidebarFooter>Left Sidebar Footer</SidebarFooter>
		</Sidebar>
		<SidebarInset
			class="overflow-hidden border border-border"
			style="height: calc(100svh - var(--spacing) * 4);"
		>
			<header class="flex shrink-0 items-center justify-between gap-2 px-4 py-2">
				<div class="flex items-center gap-2">
					<SidebarTrigger>
						<Maximize2Icon />
						<span class="sr-only">Toggle Fullscreen</span>
					</SidebarTrigger>

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
				</div>

				<div>
					<ToggleGroup type="single" bind:value={viewportSizeString}>
						<ToggleGroupItem value="1024" aria-label="Desktop View (1024px)">
							<MonitorIcon />
							<span class="sr-only">Desktop (1024px)</span>
						</ToggleGroupItem>
						<ToggleGroupItem value="768" aria-label="Tablet View (768px)">
							<TabletIcon class="-rotate-90" />
							<span class="sr-only">Tablet (768px)</span>
						</ToggleGroupItem>
						<ToggleGroupItem value="375" aria-label="Mobile View (375px)">
							<SmartphoneIcon />
							<span class="sr-only">Mobile (375px)</span>
						</ToggleGroupItem>
					</ToggleGroup>
				</div>

				<div class="flex items-center gap-2">
					<!-- Button für rechtes Panel (nur sichtbar wenn Container < xl) -->
					{#if !showRightSidebar}
						<Button
							variant="ghost"
							size="icon"
							class="size-7"
							onclick={() => (rightSheetOpen = true)}
							title="Open Properties Panel"
						>
							<PanelRightIcon />
							<span class="sr-only">Open Properties Panel</span>
						</Button>
					{/if}
					<Button variant="accent" size="sm">Save</Button>
					<DropdownMenu>
						<DropdownMenuTrigger>
							{#snippet child({ props })}
								<Button variant="muted" size="icon" class="size-8" {...props} title="More Actions">
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
				</div>
			</header>
			<div class="flex h-0 flex-1 justify-center">
				<div
					class="mx-2 overflow-auto rounded border border-border/50 bg-muted/10 duration-300"
					style={viewportSize
						? `width: ${viewportSize}px; max-width: calc(100% - var(--spacing) * 4);`
						: 'width: 100%;'}
				>
					<div
						class="duration-300"
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
			</div>
			<div class="flex shrink-0 items-center justify-center gap-2 p-1">
				<Text size="xs" intensity="muted">
					UJL Crafter · Landing Page · Imprint · Privacy Policy
				</Text>
			</div>
		</SidebarInset>
		<!-- Rechte Sidebar: nur wenn Container breit genug ist (>= 1280px) -->
		{#if showRightSidebar}
			<Sidebar variant="inset" side="right">
				<SidebarHeader>Right Sidebar Header</SidebarHeader>
				<SidebarContent>
					<div class="p-4">
						<h3 class="mb-2 font-semibold">Properties</h3>
						<p class="text-sm text-muted-foreground">Right Sidebar Content</p>
					</div>
				</SidebarContent>
				<SidebarFooter>Right Sidebar Footer</SidebarFooter>
			</Sidebar>
		{/if}
	</SidebarProvider>
</div>
<!-- Sheet für rechtes Panel (< xl) – außerhalb des Providers -->
<Sheet bind:open={rightSheetOpen}>
	<SheetContent side="right" class="w-80">
		<SheetHeader>
			<SheetTitle>Right Sidebar Header</SheetTitle>
			<SheetDescription class="sr-only">Properties panel</SheetDescription>
		</SheetHeader>
		<div class="p-4">
			<h3 class="mb-2 font-semibold">Properties</h3>
			<p class="text-sm text-muted-foreground">Right Sidebar Content</p>
		</div>
	</SheetContent>
</Sheet>
