<script lang="ts">
	import { SidebarProvider, SidebarInset } from '@ujl-framework/ui';

	import SidebarLeft from './sidebar-left/sidebar-left.svelte';
	import SidebarRight from './sidebar-right/sidebar-right.svelte';
	import Header from './header/header.svelte';
	import Body from './body/body.svelte';
</script>

<SidebarProvider>
	<SidebarLeft />
	<SidebarInset>
		<Header />
		<Body />
	</SidebarInset>
	<SidebarRight />
</SidebarProvider>
