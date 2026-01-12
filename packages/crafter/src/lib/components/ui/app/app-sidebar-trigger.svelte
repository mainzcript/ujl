<script lang="ts">
	import { Button, Sheet, SheetTriggerButton } from '@ujl-framework/ui';
	import { cn } from '@ujl-framework/ui/utils';
	import PanelLeftCloseIcon from '@lucide/svelte/icons/panel-left-close';
	import PanelLeftOpenIcon from '@lucide/svelte/icons/panel-left-open';
	import { useApp } from './context.svelte.js';

	let {
		class: className
	}: {
		class?: string;
	} = $props();

	const app = useApp();
</script>

<Button
	variant="ghost"
	size="icon"
	class={cn('hidden size-8 @7xl/app:flex', className)}
	onclick={app.toggleSidebar}
	title={app.sidebarOpen ? 'Collapse Sidebar' : 'Show Sidebar'}
>
	{#if app.sidebarOpen}
		<PanelLeftCloseIcon />
	{:else}
		<PanelLeftOpenIcon />
	{/if}
</Button>

<!-- Sheet trigger for mobile (only visible when container < @7xl/app) -->
<div class="@7xl/app:hidden">
	<Sheet bind:open={() => app.sidebarSheetOpen, (v) => (app.sidebarSheetOpen = v)}>
		<SheetTriggerButton variant="ghost" size="icon" class="size-8" title="Open Sidebar">
			<PanelLeftOpenIcon />
		</SheetTriggerButton>
	</Sheet>
</div>
