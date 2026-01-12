<script lang="ts">
	import { Button, Card, Drawer, DrawerContent } from '@ujl-framework/ui';
	import { cn, type WithElementRef } from '@ujl-framework/ui/utils';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import XIcon from '@lucide/svelte/icons/x';
	import { useApp } from './context.svelte.js';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		children?: Snippet;
	} = $props();

	const app = useApp();
	let panelEl: HTMLDivElement | null = null;

	$effect(() => {
		app.setPanelRef(panelEl);
	});

	$effect(() => {
		ref = panelEl;
	});
</script>

<div
	bind:this={panelEl}
	class={cn(
		'hidden shrink-0 overflow-hidden duration-300 @5xl/ujl-app:block',
		app.panelOpen ? 'w-sm' : '-ms-1 w-0',
		className
	)}
	data-slot="app-panel"
	{...restProps}
>
	<Card class="flex h-full w-sm! flex-col gap-0 p-0">
		<div class="flex justify-end p-2">
			<Button variant="ghost" size="icon" class="size-6" onclick={app.hidePanel}>
				<XIcon />
			</Button>
		</div>
		<div class="flex-1 p-6 pt-0">
			{@render children?.()}
		</div>
	</Card>
</div>

<!-- Drawer fallback (only visible when container < @5xl/app) -->
<Drawer bind:open={() => app.panelDrawerOpen, (v) => (app.panelDrawerOpen = v)}>
	<DrawerContent>
		<div class="mx-auto w-full max-w-sm p-4">
			{@render children?.()}
		</div>
	</DrawerContent>
</Drawer>
