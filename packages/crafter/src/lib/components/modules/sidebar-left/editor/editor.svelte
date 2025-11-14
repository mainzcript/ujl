<script lang="ts">
	import type { UJLCModuleObject } from '@ujl-framework/types';
	import NavTree from './nav-tree.svelte';

	let { ujlcData }: { ujlcData: UJLCModuleObject[] } = $props();
</script>

<div
	data-slot="sidebar-group"
	data-sidebar="group"
	class="relative flex w-full min-w-0 flex-col p-2"
>
	<NavTree nodes={ujlcData} />
</div>
