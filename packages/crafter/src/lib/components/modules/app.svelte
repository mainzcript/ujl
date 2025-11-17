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

	/**
	 * Single Source of Truth: Load and validate documents
	 *
	 * Both validation functions throw ZodError if validation fails.
	 * This ensures only valid documents are used in the application.
	 */
	let ujlcDocument = $state<UJLCDocument>(
		validateUJLCDocument(showcaseDocument as unknown as UJLCDocument)
	);
	let ujltDocument = $state<UJLTDocument>(
		validateUJLTDocument(defaultTheme as unknown as UJLTDocument)
	);

	/**
	 * Updates the theme document (ujlt) by applying a functional updater to the token set.
	 * This is the only mutation entrypoint for theme tokens and ensures immutable updates.
	 *
	 * @param fn - Function that receives the current token set and returns a new one
	 *              Must return a new object, not mutate the input
	 *
	 * This method is designed to be wrapped for future features like undo/redo history.
	 */
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

	/**
	 * Updates the content document (ujlc) by applying a functional updater to the root slot.
	 * This is the only mutation entrypoint for content structure and ensures immutable updates.
	 *
	 * @param fn - Function that receives the current root slot and returns a new one
	 *              Must return a new object, not mutate the input
	 *
	 * This method is designed to be wrapped for future features like undo/redo history.
	 */
	function updateRootSlot(fn: (s: UJLCSlotObject) => UJLCSlotObject) {
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
		updateRootSlot
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
