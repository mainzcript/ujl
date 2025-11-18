<script lang="ts">
	import { SidebarProvider, SidebarInset } from '@ujl-framework/ui';
	import type { UJLCDocument } from '@ujl-framework/types';

	import SidebarLeft from './sidebar-left/sidebar-left.svelte';
	import SidebarRight from './sidebar-right/sidebar-right.svelte';
	import Header from './header/header.svelte';
	import Body from './body/body.svelte';

	import { setDocumentContext } from '$lib/components/modules/context/document-context.svelte.ts';
	// import { setThemeContext } from '$lib/components/modules/stores/theme-context.svelte';

	// Import documents
	import showcaseDocumentJson from '@ujl-framework/examples/documents/showcase' with { type: 'json' };
	// import defaultThemeJson from '@ujl-framework/examples/themes/default' with { type: 'json' };

	// Initialize contexts - this makes them available to all child components
	setDocumentContext(showcaseDocumentJson as unknown as UJLCDocument);
	// setThemeContext(defaultThemeJson as unknown as UJLTDocument);
</script>

<SidebarProvider>
	<SidebarLeft />
	<SidebarInset>
		<Header />
		<Body />
	</SidebarInset>
	<SidebarRight />
</SidebarProvider>
