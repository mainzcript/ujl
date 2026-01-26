<script lang="ts">
	import {
		Button,
		Card,
		Drawer,
		DrawerContent,
		Sheet,
		SheetContent,
		SheetHeader
	} from '@ujl-framework/ui';
	import { cn, type WithElementRef } from '@ujl-framework/ui/utils';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import XIcon from '@lucide/svelte/icons/x';
	import { setApp, setAppRegistry } from './context.svelte.js';
	import { APP_SIDEBAR_WIDTH, APP_PANEL_WIDTH } from './constants.js';
	import AppSidebarTrigger from './app-sidebar-trigger.svelte';

	let {
		ref = $bindable(null),
		initialSidebarOpen = true,
		initialPanelOpen = true,
		class: className,
		style,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		initialSidebarOpen?: boolean;
		initialPanelOpen?: boolean;
		children?: Snippet;
	} = $props();

	let containerRef: HTMLElement | null = $state(null);

	// Set App context (used by child components via useApp())
	// Initialize once with initial prop values.
	// Wrapped in a closure to avoid Svelte's `state_referenced_locally` warning.
	const app = (() =>
		setApp({
			initialSidebarOpen,
			initialPanelOpen
		}))();

	// Set App registry (used by child components to register their content)
	const registry = setAppRegistry();

	// ResizeObserver for responsive breakpoint detection
	$effect(() => {
		if (!containerRef) return;

		const observer = new ResizeObserver((entries) => {
			const width = entries[0]?.contentRect.width ?? 0;
			app.setContainerWidth(width);
		});

		observer.observe(containerRef);

		// Measure initial width to set correct breakpoint state on mount
		app.setContainerWidth(containerRef.offsetWidth);

		return () => {
			observer.disconnect();
		};
	});

	// Auto-close drawer and open desktop panel when transitioning from mobile to desktop
	$effect(() => {
		if (app.isDesktopPanel && app.panelDrawerOpen) {
			app.panelDrawerOpen = false;
			app.preferPanel();
		}
	});

	// Auto-close sheet and open desktop sidebar when transitioning from mobile to desktop
	$effect(() => {
		if (app.isDesktopSidebar && app.sidebarSheetOpen) {
			app.sidebarSheetOpen = false;
			app.preferSidebar();
		}
	});

	$effect(() => {
		ref = containerRef;
	});
</script>

<div
	bind:this={containerRef}
	data-slot="app-wrapper"
	style="--ujl-app-sidebar-width: {APP_SIDEBAR_WIDTH}; --ujl-app-panel-width: {APP_PANEL_WIDTH}; {style}"
	class={cn('h-full bg-background', className)}
	{...restProps}
>
	<!-- Render children first so they can register their content -->
	{@render children?.()}

	<div class="mx-auto flex h-full max-w-[2000px] flex-col gap-1 p-1">
		<!-- Header -->
		<header class="flex items-center gap-2">
			<div
				class={cn(
					'flex shrink-0 items-center justify-between gap-2 overflow-hidden duration-300',
					app.sidebarDesktopOpen && app.isDesktopSidebar ? 'min-w-[240px]' : 'min-w-0'
				)}
			>
				<AppSidebarTrigger />

				{#if registry.logo}
					<div class="flex items-center">{@render registry.logo()}</div>
				{/if}
			</div>

			{#if registry.header}
				<div class="flex-1 overflow-hidden">{@render registry.header()}</div>
			{/if}
		</header>

		<!-- Main Content -->
		<div class="flex flex-1 gap-1">
			<!-- Sidebar (Desktop) -->
			{#if app.isDesktopSidebar}
				<div
					class={cn(
						'relative h-full shrink-0 overflow-hidden duration-300',
						app.sidebarDesktopOpen ? 'w-(--ujl-app-sidebar-width)' : '-ms-1 w-0'
					)}
					data-slot="app-sidebar"
				>
					{#if registry.sidebar}
						<div class="absolute h-full w-full overflow-auto p-2">
							{@render registry.sidebar()}
						</div>
					{/if}
				</div>
			{/if}

			<!-- Canvas and Panel Container -->
			<div class="flex flex-1 flex-col gap-1">
				<div class="flex flex-1 gap-1 rounded-xl border border-border bg-foreground/5 p-1">
					<!-- Canvas -->
					{#if registry.canvas}
						<main class="flex-1" data-slot="app-canvas">
							<Card class="relative h-full w-full overflow-hidden p-0 shadow-none">
								<div
									class="absolute top-0 right-0 h-full w-full overflow-auto"
									data-ujl-scroll-container="canvas"
								>
									{@render registry.canvas()}
								</div>
							</Card>
						</main>
					{/if}

					<!-- Panel (Desktop) -->
					{#if app.isDesktopPanel}
						<div
							class={cn(
								'shrink-0 overflow-hidden duration-300',
								app.panelDesktopOpen ? 'w-sm' : '-ms-1 w-0'
							)}
							data-slot="app-panel"
						>
							{#if registry.panel}
								<Card class="relative h-full w-sm! flex-col gap-0 p-0 shadow-none">
									<div class="absolute top-0 left-0 h-full w-full">
										{@render registry.panel()}
									</div>
									<Button
										variant="ghost"
										size="icon"
										class="absolute top-2 right-2 size-6"
										onclick={app.hidePanel}
										title="Close Panel"
									>
										<XIcon class="size-4" />
									</Button>
								</Card>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- Sheet fallback for Sidebar (mobile) -->
	{#if !app.isDesktopSidebar}
		<Sheet bind:open={() => app.sidebarSheetOpen, (v) => (app.sidebarSheetOpen = v)}>
			<SheetContent side="left">
				<SheetHeader />
				<div class="relative flex-1 overflow-auto p-4 pt-0">
					{#if registry.sidebar}
						{@render registry.sidebar()}
					{/if}
				</div>
			</SheetContent>
		</Sheet>
	{/if}

	<!-- Drawer fallback for Panel (mobile) -->
	<Drawer bind:open={() => app.panelDrawerOpen, (v) => (app.panelDrawerOpen = v)}>
		<DrawerContent>
			<div class="flex h-full max-h-full w-full flex-col items-center overflow-hidden p-4">
				{#if registry.panel}
					<div class="min-h-0 w-full max-w-md flex-1 overflow-y-auto">
						{@render registry.panel()}
					</div>
				{/if}
			</div>
		</DrawerContent>
	</Drawer>
</div>
