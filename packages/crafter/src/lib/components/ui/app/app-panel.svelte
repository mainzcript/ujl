<script lang="ts">
	import type { Snippet } from 'svelte';
	import { useAppRegistry } from './context.svelte.js';

	let { children }: { children?: Snippet } = $props();

	const registry = useAppRegistry();

	// Register content so App can render it in the panel (desktop) or drawer (mobile)
	$effect(() => {
		if (children) {
			return registry.register('panel', children);
		}
	});
</script>
