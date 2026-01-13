<!--
	CrafterEffects - Panel-Auto-Open and Close Callback Logic
	
	This component must be rendered as a child of <App> to access the useApp() context.
	It handles:
	- Auto-opening panel when a node is selected (desktop, editor mode)
	- Auto-opening panel when switching to designer mode (desktop)
	- Deselecting node when panel is closed (editor mode)
-->
<script lang="ts">
	import { useApp } from '$lib/components/ui/app';
	import { page } from '$app/state';
	import type { CrafterMode } from './types.js';

	let {
		mode,
		setSelectedNodeId
	}: {
		mode: CrafterMode;
		setSelectedNodeId: (nodeId: string | null) => void;
	} = $props();

	const app = useApp();

	const selectedNodeId = $derived(page.url.searchParams.get('selected'));

	// Auto-open panel when node is selected (desktop, editor mode)
	$effect(() => {
		if (selectedNodeId && app.isDesktopPanel && mode === 'editor') {
			app.preferPanel();
		}
	});

	// Open panel by default in designer mode (desktop)
	$effect(() => {
		if (mode === 'designer' && app.isDesktopPanel) {
			app.preferPanel();
		}
	});

	// Deselect node when panel closes to maintain consistent UI state
	$effect(() => {
		return app.onPanelClose(() => {
			if (mode === 'editor') {
				setSelectedNodeId(null);
			}
		});
	});
</script>
