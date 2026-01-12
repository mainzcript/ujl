<script lang="ts">
	import { App, AppHeaderWrapper, AppSidebar, AppCanvas, AppPanel } from '$lib/components/ui/app';

	let sidebarOpen = $state(true);
	let panelOpen = $state(false);

	// Optional: Hook for custom control logic
	// import { useApp } from '$lib/components/ui/app';
	// const app = useApp();
	// app.togglePanel();
	// app.requireSidebar();
</script>

{#snippet logo()}
	<div class="text-sm font-semibold">UJL Crafter</div>
{/snippet}

{#snippet header()}
	<div class="text-sm">Editor Header</div>
{/snippet}

<App bind:sidebarOpen bind:panelOpen>
	<AppHeaderWrapper {logo} {header} />

	<div class="flex flex-1 gap-1">
		<AppSidebar>
			<div class="space-y-2">
				<div class="p-2 font-semibold">Navigation</div>
				<div class="space-y-1">
					<div class="rounded-md bg-muted p-2 text-sm">Item 1</div>
					<div class="rounded-md p-2 text-sm">Item 2</div>
					<div class="rounded-md p-2 text-sm">Item 3</div>
				</div>
			</div>
		</AppSidebar>

		<div class="flex flex-1 flex-col gap-1">
			<div class="flex flex-1 gap-1 rounded-xl border border-border bg-foreground/5 p-1">
				<AppCanvas>
					<div class="p-8">
						<h1 class="mb-4 text-2xl font-bold">Canvas Content</h1>
						<p class="text-muted-foreground">
							This is the main content area of the editor. The canvas is rendered here.
						</p>
						<div class="mt-8 space-y-4">
							<div class="rounded-lg border p-4">
								<h2 class="mb-2 font-semibold">Section 1</h2>
								<p class="text-sm text-muted-foreground">Content here...</p>
							</div>
							<div class="rounded-lg border p-4">
								<h2 class="mb-2 font-semibold">Section 2</h2>
								<p class="text-sm text-muted-foreground">More content...</p>
							</div>
						</div>
					</div>
				</AppCanvas>

				<AppPanel>
					<div class="space-y-4">
						<div>
							<h3 class="mb-2 text-sm font-semibold">Properties</h3>
							<div class="space-y-2 text-sm">
								<div>
									<div class="text-muted-foreground">Name</div>
									<div class="mt-1 rounded border p-2">Element Name</div>
								</div>
								<div>
									<div class="text-muted-foreground">Type</div>
									<div class="mt-1 rounded border p-2">Container</div>
								</div>
							</div>
						</div>
						<div>
							<h3 class="mb-2 text-sm font-semibold">Settings</h3>
							<div class="space-y-2">
								<label class="flex items-center gap-2 text-sm">
									<input type="checkbox" />
									<span>Enable feature</span>
								</label>
								<label class="flex items-center gap-2 text-sm">
									<input type="checkbox" />
									<span>Show details</span>
								</label>
							</div>
						</div>
					</div>
				</AppPanel>
			</div>
		</div>
	</div>
</App>
