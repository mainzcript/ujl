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

{#if app.isDesktopSidebar}
	<Button
		variant="ghost"
		size="icon"
		class={cn('size-8', className)}
		onclick={app.toggleSidebar}
		title={app.sidebarDesktopOpen ? 'Collapse Sidebar' : 'Show Sidebar'}
	>
		{#if app.sidebarDesktopOpen}
			<PanelLeftCloseIcon />
		{:else}
			<PanelLeftOpenIcon />
		{/if}
	</Button>
{/if}

{#if !app.isDesktopSidebar}
	<Sheet bind:open={() => app.sidebarSheetOpen, (v) => (app.sidebarSheetOpen = v)}>
		<SheetTriggerButton variant="ghost" size="icon" class="size-8" title="Open Sidebar">
			<PanelLeftOpenIcon />
		</SheetTriggerButton>
	</Sheet>
{/if}
