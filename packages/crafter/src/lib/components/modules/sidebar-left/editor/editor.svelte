<!-- Placeholder content editor for visualizing the UJLCSlotObject; full drag & drop editor TBD. -->
<script lang="ts">
	import type { UJLCSlotObject } from '@ujl-framework/types';

	let { slot }: { slot: UJLCSlotObject } = $props();

	// Context API is available for future mutations (e.g., module selection, drag & drop)
	// When needed, import: import { getContext } from 'svelte';
	// import { CRAFTER_CONTEXT, type CrafterContext } from '../../context.js';
	// const crafter = getContext<CrafterContext>(CRAFTER_CONTEXT);
</script>

<div
	data-slot="sidebar-group"
	data-sidebar="group"
	class="relative flex w-full min-w-0 flex-col p-2"
>
	<div class="p-4 text-sm text-muted-foreground">
		{#if slot && slot.length > 0}
			Content editor coming soon ({slot.length} module{slot.length !== 1 ? 's' : ''})
		{:else}
			No content yet
		{/if}
	</div>
</div>
