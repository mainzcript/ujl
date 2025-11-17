<script lang="ts">
	import { SidebarProvider, SidebarInset } from '@ujl-framework/ui';
	import { setContext } from 'svelte';
	import type {
		UJLCDocument,
		UJLTDocument,
		UJLTTokenSet,
		UJLCSlotObject
	} from '@ujl-framework/types';
	import { validateUJLCDocument, validateUJLTDocument } from '@ujl-framework/types';
	import showcaseDocument from '@ujl-framework/examples/documents/showcase' with { type: 'json' };
	import defaultTheme from '@ujl-framework/examples/themes/default' with { type: 'json' };
	import { CRAFTER_CONTEXT, type CrafterContext } from './context.js';

	import SidebarLeft from './sidebar-left/sidebar-left.svelte';
	import SidebarRight from './sidebar-right/sidebar-right.svelte';
	import Header from './header/header.svelte';
	import Body from './body/preview.svelte';

	// Single Source of Truth: Load and validate documents
	let ujlcDocument = $state<UJLCDocument>(
		validateUJLCDocument(showcaseDocument as unknown as UJLCDocument)
	);
	let ujltDocument = $state<UJLTDocument>(
		validateUJLTDocument(defaultTheme as unknown as UJLTDocument)
	);

	// Editor context API methods
	function updateTokenSet(fn: (t: UJLTTokenSet) => UJLTTokenSet) {
		const newTokenSet = fn(ujltDocument.ujlt.tokens);
		ujltDocument = {
			...ujltDocument,
			ujlt: {
				...ujltDocument.ujlt,
				tokens: newTokenSet
			}
		};
	}

	function updateSlot(fn: (s: UJLCSlotObject) => UJLCSlotObject) {
		const currentSlot = ujlcDocument.ujlc.root;
		const newSlot = fn(currentSlot);
		ujlcDocument = {
			...ujlcDocument,
			ujlc: {
				...ujlcDocument.ujlc,
				root: newSlot
			}
		};
	}

	// Provide context API to child components
	const crafterContext: CrafterContext = {
		updateTokenSet,
		updateSlot
	};

	setContext(CRAFTER_CONTEXT, crafterContext);
</script>

<SidebarProvider>
	<SidebarLeft tokenSet={ujltDocument.ujlt.tokens} contentSlot={ujlcDocument.ujlc.root} />
	<SidebarInset>
		<Header />
		<Body {ujlcDocument} {ujltDocument} />
	</SidebarInset>
	<SidebarRight />
</SidebarProvider>
