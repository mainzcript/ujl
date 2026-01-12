<script lang="ts">
	import { setApp, setAppRegistry, useApp } from './context.svelte.js';

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
			getIsSidebarVisible: () => boolean;
			getIsPanelVisible: () => boolean;
		}) => void;
	} = $props();

	// Set App context with initial values
	// Initialize once with initial prop values.
	// Wrapped in a closure to avoid Svelte's `state_referenced_locally` warning.
	const app = (() =>
		setApp({
			initialSidebarOpen,
			initialPanelOpen
		}))();

	// Set registry for components that need it
	setAppRegistry();

	// Expose helpers to tests
	$effect(() => {
		if (onAppReady) {
			onAppReady({
				app,
				getSidebarOpen: () => app.sidebarDesktopOpen,
				getPanelOpen: () => app.panelDesktopOpen,
				getIsSidebarVisible: () => app.isSidebarVisible,
				getIsPanelVisible: () => app.isPanelVisible
			});
		}
	});
</script>
