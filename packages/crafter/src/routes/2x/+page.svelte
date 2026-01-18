<script lang="ts">
	import { UJLCrafter } from '../../lib/components/ujl-crafter/index.js';
	import { Grid } from '@ujl-framework/ui';
	import { onMount, onDestroy } from 'svelte';

	let crafterContainer1: HTMLDivElement;
	let crafter1: UJLCrafter | null = null;
	let crafterContainer2: HTMLDivElement;
	let crafter2: UJLCrafter | null = null;

	onMount(() => {
		// Initialize Crafter after container is mounted
		if (crafterContainer1) {
			crafter1 = new UJLCrafter({
				target: crafterContainer1
			});
		}
		if (crafterContainer2) {
			crafter2 = new UJLCrafter({
				target: crafterContainer2
			});
		}
	});

	onDestroy(() => {
		if (crafter1) {
			crafter1.destroy();
			crafter1 = null;
		}
		if (crafter2) {
			crafter2.destroy();
			crafter2 = null;
		}
	});
</script>

<Grid class="h-full w-full md:grid-cols-2">
	<div>
		<div bind:this={crafterContainer1} class="h-full w-full"></div>
	</div>
	<div>
		<div bind:this={crafterContainer2} class="h-full w-full"></div>
	</div>
</Grid>
