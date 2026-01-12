<script lang="ts">
	import { setApp, useApp } from './context.svelte.js';

	let {
		initialSidebarOpen = true,
		initialPanelOpen = false,
		onAppReady
	}: {
		initialSidebarOpen?: boolean;
		initialPanelOpen?: boolean;
		onAppReady?: (helpers: {
			app: ReturnType<typeof useApp>;
			getSidebarOpen: () => boolean;
			getPanelOpen: () => boolean;
		}) => void;
	} = $props();

	// Internal state that the AppState will control
	// Initialize in $effect to avoid Svelte warning about capturing initial prop values
	let sidebarOpen = $state(false);
	let panelOpen = $state(false);

	$effect(() => {
		sidebarOpen = initialSidebarOpen ?? true;
		panelOpen = initialPanelOpen ?? false;
	});

	setApp({
		sidebarOpen: () => sidebarOpen,
		setSidebarOpen: (v) => {
			sidebarOpen = v;
		},
		panelOpen: () => panelOpen,
		setPanelOpen: (v) => {
			panelOpen = v;
		}
	});

	const app = useApp();

	// Expose helpers to tests
	$effect(() => {
		if (onAppReady) {
			onAppReady({
				app,
				getSidebarOpen: () => sidebarOpen,
				getPanelOpen: () => panelOpen
			});
		}
	});
</script>
