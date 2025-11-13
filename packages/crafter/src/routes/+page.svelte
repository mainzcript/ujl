<script lang="ts">
	import SidebarLeft from '$lib/components/modules/sidebar-left.svelte';
	import SidebarRight from '$lib/components/modules/sidebar-right.svelte';
	import {
		Breadcrumb,
		BreadcrumbList,
		BreadcrumbItem,
		BreadcrumbPage,
		Separator
	} from '@ujl-framework/ui';

	// Namespace object to maintain compatibility with existing component usage patterns.
	// Components from @ujl-framework/ui are exported with full names (e.g., Breadcrumb, BreadcrumbItem)
	// but the codebase uses namespace-style access (e.g., Breadcrumb.Root, Breadcrumb.List)
	const BreadcrumbNamespace = {
		Root: Breadcrumb,
		List: BreadcrumbList,
		Item: BreadcrumbItem,
		Page: BreadcrumbPage
	};
	import {
		SidebarProvider,
		SidebarInset,
		SidebarTrigger
	} from '@ujl-framework/ui';
</script>

<SidebarProvider>
	<SidebarLeft />
	<SidebarInset>
		<header class="sticky top-0 flex h-14 shrink-0 items-center gap-2 bg-background">
			<div class="flex flex-1 items-center gap-2 px-3">
				<SidebarTrigger />
				<Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
				<BreadcrumbNamespace.Root>
					<BreadcrumbNamespace.List>
						<BreadcrumbNamespace.Item>
							<BreadcrumbNamespace.Page class="line-clamp-1">
								Project Management & Task Tracking
							</BreadcrumbNamespace.Page>
						</BreadcrumbNamespace.Item>
					</BreadcrumbNamespace.List>
				</BreadcrumbNamespace.Root>
			</div>
		</header>
		<div class="flex flex-1 flex-col gap-4 p-4">
			<div class="mx-auto h-24 w-full max-w-3xl rounded-xl bg-muted/50"></div>
			<div class="mx-auto h-[100vh] w-full max-w-3xl rounded-xl bg-muted/50"></div>
		</div>
	</SidebarInset>
	<SidebarRight />
</SidebarProvider>
