<script lang="ts">
	import {
		DropdownMenu,
		DropdownMenuTrigger,
		DropdownMenuContent,
		DropdownMenuLabel,
		DropdownMenuItem,
		DropdownMenuShortcut
	} from '@ujl-framework/ui';
	import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@ujl-framework/ui';
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
		<DropdownMenu>
			<DropdownMenuTrigger>
				{#snippet child({ props })}
					<SidebarMenuButton {...props} class="w-fit px-1.5">
						<div class="flex aspect-square size-5 items-center justify-center rounded-md">
							<activeMode.icon class="size-3" />
						</div>
						<span class="truncate font-medium">{activeMode.name}</span>
						<ChevronDownIcon class="opacity-50" />
					</SidebarMenuButton>
				{/snippet}
			</DropdownMenuTrigger>
			<DropdownMenuContent
				class="w-64 rounded-lg"
				align="start"
				side="bottom"
				sideOffset={4}
			>
				<DropdownMenuLabel>Mode</DropdownMenuLabel>
				{#each modes as mode, index (mode.name)}
					<DropdownMenuItem onSelect={() => (activeMode = mode)} class="gap-2 p-2">
						<div class="flex size-6 items-center justify-center rounded-xs">
							<mode.icon class="size-4 shrink-0 text-[currentColor]" />
						</div>
						<div class="font-medium">{mode.name}</div>
						<DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
					</DropdownMenuItem>
				{/each}
			</DropdownMenuContent>
		</DropdownMenu>
	</SidebarMenuItem>
</SidebarMenu>
