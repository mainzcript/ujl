<script lang="ts">
	import { CRAFTER_CONTEXT, type CrafterContext } from "./index.js";
	import { createCrafterStore, type CrafterStoreDeps } from "./crafter-store.svelte.js";
	import { setContext } from "svelte";

	let {
		deps,
		onStoreReady,
	}: {
		deps: CrafterStoreDeps;
		onStoreReady?: (store: CrafterContext) => void;
	} = $props();

	// Create the store with real Svelte 5 runes
	// Wrapped in closure to avoid `state_referenced_locally` warning
	const store = (() => createCrafterStore(deps))();

	// Set context just like the real app does
	setContext<CrafterContext>(CRAFTER_CONTEXT, store);

	// Expose store to tests once initialized
	$effect(() => {
		if (onStoreReady) {
			onStoreReady(store);
		}
	});
</script>

<span data-testid="store-wrapper-ready"></span>
