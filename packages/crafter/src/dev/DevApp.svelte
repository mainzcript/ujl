<script lang="ts">
	import { UJLCrafter } from '../lib/components/ujl-crafter/index.js';
	import { onMount, onDestroy } from 'svelte';

	// Container reference
	let crafterContainer: HTMLDivElement | undefined = $state();

	// Crafter instance
	let crafter: UJLCrafter | null = null;

	// Check if running in test mode (set by Playwright via environment variable)
	const isTestMode = import.meta.env.PUBLIC_TEST_MODE === 'true';

	onMount(() => {
		if (crafterContainer) {
			crafter = new UJLCrafter({
				target: crafterContainer,
				testMode: isTestMode
			});
		}
	});

	onDestroy(() => {
		if (crafter) {
			crafter.destroy();
			crafter = null;
		}
	});
</script>

<div bind:this={crafterContainer} class="h-screen w-screen"></div>
