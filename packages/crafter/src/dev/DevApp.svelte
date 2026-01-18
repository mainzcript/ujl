<script lang="ts">
	import { UJLCrafter } from '../lib/components/ujl-crafter/index.js';
	import {
		Dialog,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogDescription,
		Button
	} from '@ujl-framework/ui';
	import { onMount, onDestroy } from 'svelte';

	/**
	 * Disclaimer dialog state
	 * Shows a warning that this is an early preview
	 */
	const DISCLAIMER_STORAGE_KEY = 'ujl-crafter-disclaimer-dismissed';
	let showDisclaimer = $state(false);

	// Container reference (bind:this target)
	let crafterContainer: HTMLDivElement | undefined = $state();

	// Crafter instance
	let crafter: UJLCrafter | null = null;

	onMount(() => {
		// Check if user has dismissed the disclaimer
		const dismissed = localStorage.getItem(DISCLAIMER_STORAGE_KEY);
		if (!dismissed) {
			showDisclaimer = true;
		}

		// Initialize Crafter
		if (crafterContainer) {
			crafter = new UJLCrafter({
				target: crafterContainer
			});
		}
	});

	onDestroy(() => {
		if (crafter) {
			crafter.destroy();
			crafter = null;
		}
	});

	function handleDismissDisclaimer() {
		showDisclaimer = false;
		localStorage.setItem(DISCLAIMER_STORAGE_KEY, 'true');
	}
</script>

<Dialog bind:open={showDisclaimer}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Early Preview</DialogTitle>
			<DialogDescription>
				This is a very early preview of the UJL Crafter. Many features are still in development and
				you will likely encounter bugs and unexpected behavior. This preview shows the vision and
				direction of the project, but it is not yet intended for productive use.
			</DialogDescription>
		</DialogHeader>
		<div class="flex justify-end gap-2 pt-4">
			<Button variant="default" onclick={handleDismissDisclaimer}>Got it</Button>
		</div>
	</DialogContent>
</Dialog>

<div bind:this={crafterContainer} class="h-screen w-screen"></div>
