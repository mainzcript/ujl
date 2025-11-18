<!--
	Header component for the Crafter interface.
	
	Displays the main navigation breadcrumb and sidebar trigger.
	This is a presentational component with no internal state.
-->
<script lang="ts">
	import {
		Breadcrumb,
		BreadcrumbList,
		BreadcrumbItem,
		BreadcrumbPage,
		Separator
	} from '@ujl-framework/ui';
	import { SidebarTrigger } from '@ujl-framework/ui';
</script>

<header class="sticky top-0 flex h-14 shrink-0 items-center gap-2 bg-sidebar">
	<div class="flex flex-1 items-center gap-2 px-3">
		<SidebarTrigger />
		<Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
		<Breadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbPage class="line-clamp-1">UJL Crafter</BreadcrumbPage>
				</BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>
	</div>
</header>
