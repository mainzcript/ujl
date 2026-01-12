<script lang="ts">
	import {
		AppLogo,
		AppHeader,
		AppSidebar,
		AppCanvas,
		AppPanel,
		useApp
	} from '$lib/components/ui/app';
	import { Button, Input } from '@ujl-framework/ui';
	import Settings2Icon from '@lucide/svelte/icons/settings-2';

	// useApp() works here because we're inside the App layout
	const app = useApp();

	// Set up callbacks
	$effect(() => {
		return app.onPanelClose(() => {
			console.log('Panel closed');
		});
	});
</script>

<AppLogo>
	<span class="text-sm font-semibold">UJL Crafter</span>
</AppLogo>

<AppHeader>
	<div class="flex items-center justify-between">
		<span> Header Element 1 </span>
		<span> Header Element 2 </span>
		<Button
			onclick={() => app.togglePanel()}
			variant={app.isPanelVisible ? 'muted' : 'ghost'}
			size="icon"
		>
			<Settings2Icon />
		</Button>
	</div>
</AppHeader>

<AppSidebar>
	<Input placeholder="Test Input" />
</AppSidebar>

<AppCanvas>This is the canvas content.</AppCanvas>

<AppPanel>
	<Input placeholder="Test Input" />
</AppPanel>
