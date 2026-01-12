<script lang="ts">
	import type { Snippet } from 'svelte';
	import { useAppRegistry } from './context.svelte.js';

	let { children }: { children?: Snippet } = $props();

	const registry = useAppRegistry();

	// Register content so App can render it in the header
	$effect(() => {
		if (children) {
			return registry.register('logo', children);
		}
	});
</script>

<!-- Content is rendered by App component -->
