<script lang="ts">
	import App from '$lib/components/app/app.svelte';
	import {
		Dialog,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogDescription,
		Button
	} from '@ujl-framework/ui';
	import { onMount } from 'svelte';
	import { env } from '$env/dynamic/public';

	/**
	 * Disclaimer dialog state
	 * Shows a warning that this is an early preview
	 */
	const DISCLAIMER_STORAGE_KEY = 'ujl-crafter-disclaimer-dismissed';
	let showDisclaimer = $state(false);

	onMount(() => {
		// dont show disclaimer in test mode
		if (env.PUBLIC_TEST_MODE === 'true') {
			showDisclaimer = false;
			return;
		}

		// Check if user has dismissed the disclaimer
		const dismissed = localStorage.getItem(DISCLAIMER_STORAGE_KEY);
		if (!dismissed) {
			showDisclaimer = true;
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

<App />
