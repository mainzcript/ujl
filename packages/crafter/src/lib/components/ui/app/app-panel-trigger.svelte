<script lang="ts">
	import { Button, Drawer, DrawerTriggerButton } from '@ujl-framework/ui';
	import { cn } from '@ujl-framework/ui/utils';
	import Settings2Icon from '@lucide/svelte/icons/settings-2';
	import { useApp } from './context.svelte.js';

	let {
		class: className
	}: {
		class?: string;
	} = $props();

	const app = useApp();
</script>

<!-- Drawer trigger for mobile (only visible when container < @5xl/app) -->
<div class="@5xl/ujl-app:hidden">
	<Drawer bind:open={() => app.panelDrawerOpen, (v) => (app.panelDrawerOpen = v)}>
		<DrawerTriggerButton size="icon" class="size-8" variant="ghost" title="Show Panel">
			<Settings2Icon />
		</DrawerTriggerButton>
	</Drawer>
</div>

<!-- Desktop toggle button (only visible when container >= @5xl/app) -->
<div class="hidden @5xl/ujl-app:block">
	<Button
		variant={app.panelOpen ? 'muted' : 'ghost'}
		size="icon"
		class={cn('size-8', className)}
		title={app.panelOpen ? 'Hide Panel' : 'Show Panel'}
		onclick={app.togglePanel}
	>
		<Settings2Icon />
	</Button>
</div>
