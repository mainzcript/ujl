<script lang="ts">
	import NavTreeMock from './nav-tree-mock.svelte';

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let { nodes }: { nodes: any[] } = $props();
</script>

<div
	data-slot="sidebar-group"
	data-sidebar="group"
	class="relative flex w-full min-w-0 flex-col p-2"
>
	<NavTreeMock {nodes} />
</div>
