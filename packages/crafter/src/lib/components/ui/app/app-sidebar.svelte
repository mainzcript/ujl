<script lang="ts">
	import { Sheet, SheetContent, SheetHeader } from '@ujl-framework/ui';
	import { cn, type WithElementRef } from '@ujl-framework/ui/utils';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';
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
	let sidebarEl: HTMLDivElement | null = null;

	$effect(() => {
		app.setSidebarRef(sidebarEl);
	});

	$effect(() => {
		ref = sidebarEl;
	});
</script>

<div
	bind:this={sidebarEl}
	class={cn(
		'hidden h-full shrink-0 overflow-hidden duration-300 @7xl/app:block',
		app.sidebarOpen ? 'w-[var(--app-sidebar-width)]' : '-ms-1 w-0',
		className
	)}
	data-slot="app-sidebar"
	{...restProps}
>
	<div class="h-full w-[var(--app-sidebar-width)] p-2">
		{@render children?.()}
	</div>
</div>

<!-- Sheet fallback (only visible when container < @7xl/app) -->
<Sheet bind:open={() => app.sidebarSheetOpen, (v) => (app.sidebarSheetOpen = v)}>
	<SheetContent side="left" class="@7xl/app:hidden">
		<SheetHeader />
		<div class="flex-1 p-4 pt-0">
			{@render children?.()}
		</div>
	</SheetContent>
</Sheet>
