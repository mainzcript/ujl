<script lang="ts">
	import type { Snippet } from 'svelte';
	import { useAppRegistry } from './context.svelte.js';

	let { children }: { children?: Snippet } = $props();

	const registry = useAppRegistry();

	// Register content so App can render it in the sidebar (desktop) or sheet (mobile)
	$effect(() => {
		if (children) {
			return registry.register('sidebar', children);
		}
	});
</script>

<!-- Content is rendered by App component -->
