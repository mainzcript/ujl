<script lang="ts">
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import {
		Breadcrumb,
		BreadcrumbList,
		BreadcrumbItem,
		BreadcrumbLink,
		BreadcrumbPage,
		BreadcrumbSeparator,
		Separator
	} from '@ujl-framework/ui';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';

	// Namespace object to maintain compatibility with existing component usage patterns.
	// Components from @ujl-framework/ui are exported with full names (e.g., Breadcrumb, BreadcrumbItem)
	// but the codebase uses namespace-style access (e.g., Breadcrumb.Root, Breadcrumb.List)
	const BreadcrumbNamespace = {
		Root: Breadcrumb,
		List: BreadcrumbList,
		Item: BreadcrumbItem,
		Link: BreadcrumbLink,
		Page: BreadcrumbPage,
		Separator: BreadcrumbSeparator
	};
</script>

<Sidebar.Provider style="--sidebar-width: 350px;">
	<AppSidebar />
	<Sidebar.Inset>
		<header class="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-background p-4">
			<Sidebar.Trigger class="-ml-1" />
			<Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
			<BreadcrumbNamespace.Root>
				<BreadcrumbNamespace.List>
					<BreadcrumbNamespace.Item class="hidden md:block">
						<BreadcrumbNamespace.Link href="##">All Inboxes</BreadcrumbNamespace.Link>
					</BreadcrumbNamespace.Item>
					<BreadcrumbNamespace.Separator class="hidden md:block" />
					<BreadcrumbNamespace.Item>
						<BreadcrumbNamespace.Page>Inbox</BreadcrumbNamespace.Page>
					</BreadcrumbNamespace.Item>
				</BreadcrumbNamespace.List>
			</BreadcrumbNamespace.Root>
		</header>
		<div class="flex flex-1 flex-col gap-4 p-4">
			{#each Array.from({ length: 24 }, (_, i) => ({ id: i })) as item (item.id)}
				<div class="aspect-video h-12 w-full rounded-lg bg-ambient-foreground/10"></div>
			{/each}
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>
