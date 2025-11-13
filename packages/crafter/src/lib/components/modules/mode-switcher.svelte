<script lang="ts">
	import {
		DropdownMenu,
		DropdownMenuTrigger,
		DropdownMenuContent,
		DropdownMenuLabel,
		DropdownMenuItem,
		DropdownMenuSeparator,
		DropdownMenuShortcut
	} from '@ujl-framework/ui';

	// Namespace object to maintain compatibility with existing component usage patterns.
	// Components from @ujl-framework/ui are exported with full names (e.g., DropdownMenu, DropdownMenuItem)
	// but the codebase uses namespace-style access (e.g., DropdownMenu.Root, DropdownMenu.Item)
	const DropdownMenuNamespace = {
		Root: DropdownMenu,
		Trigger: DropdownMenuTrigger,
		Content: DropdownMenuContent,
		Label: DropdownMenuLabel,
		Item: DropdownMenuItem,
		Separator: DropdownMenuSeparator,
		Shortcut: DropdownMenuShortcut
	};
	import {
		SidebarMenu,
		SidebarMenuItem,
		SidebarMenuButton
	} from '@ujl-framework/ui';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import PencilRulerIcon from '@lucide/svelte/icons/pencil-ruler';
	import PaletteIcon from '@lucide/svelte/icons/palette';
	import type { Component } from 'svelte';

	type Mode = {
		name: string;
		icon: Component;
		fileType: string;
	};

	const modes: Mode[] = [
		{
			name: 'Editor',
			icon: PencilRulerIcon,
			fileType: 'ujlc'
		},
		{
			name: 'Designer',
			icon: PaletteIcon,
			fileType: 'ujlt'
		}
	];

	let activeMode = $state(modes[0]);
</script>

<SidebarMenu>
	<SidebarMenuItem>
		<DropdownMenuNamespace.Root>
			<DropdownMenuNamespace.Trigger>
				{#snippet child({ props })}
					<SidebarMenuButton {...props} class="w-fit px-1.5">
						<div class="flex aspect-square size-5 items-center justify-center rounded-md">
							<activeMode.icon class="size-3" />
						</div>
						<span class="truncate font-medium">{activeMode.name}</span>
						<ChevronDownIcon class="opacity-50" />
					</SidebarMenuButton>
				{/snippet}
			</DropdownMenuNamespace.Trigger>
			<DropdownMenuNamespace.Content
				class="w-64 rounded-lg"
				align="start"
				side="bottom"
				sideOffset={4}
			>
				<DropdownMenuNamespace.Label>Mode</DropdownMenuNamespace.Label>
				{#each modes as mode, index (mode.name)}
					<DropdownMenuNamespace.Item onSelect={() => (activeMode = mode)} class="gap-2 p-2">
						<div class="flex size-6 items-center justify-center rounded-xs">
							<mode.icon class="size-4 shrink-0 text-[currentColor]" />
						</div>
						<div class="font-medium">{mode.name}</div>
						<DropdownMenuNamespace.Shortcut>⌘{index + 1}</DropdownMenuNamespace.Shortcut>
					</DropdownMenuNamespace.Item>
				{/each}
			</DropdownMenuNamespace.Content>
		</DropdownMenuNamespace.Root>
	</SidebarMenuItem>
</SidebarMenu>
