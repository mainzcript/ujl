<!--
	CrafterEffects - Panel-Auto-Open and Close Callback Logic
	
	This component must be rendered as a child of <App> to access the useApp() context.
	It handles:
	- Auto-opening panel when a node is selected (desktop, editor mode)
	- Auto-opening panel when switching to designer mode (desktop)
	- Deselecting node when panel is closed (editor mode)
-->
<script lang="ts">
	import { useApp } from "$lib/components/ui/app/index.js";
	import type { CrafterMode } from "$lib/stores/index.js";

	let {
		mode,
		setSelectedNodeId,
		selectedNodeId,
	}: {
		mode: CrafterMode;
		setSelectedNodeId: (nodeId: string | null) => void;
		selectedNodeId: string | null;
	} = $props();

	const app = useApp();

	// Auto-open panel when node is selected (desktop, editor mode)
	$effect(() => {
		if (selectedNodeId && app.isDesktopPanel && mode === "editor") {
			app.preferPanel();
		}
	});

	// Open panel by default in designer mode (desktop)
	$effect(() => {
		if (mode === "designer" && app.isDesktopPanel) {
			app.preferPanel();
		}
	});

	// Deselect node when panel closes to maintain consistent UI state
	$effect(() => {
		return app.onPanelClose(() => {
			if (mode === "editor") {
				setSelectedNodeId(null);
			}
		});
	});
</script>
