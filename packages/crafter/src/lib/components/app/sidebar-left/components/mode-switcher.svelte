<!-- Mode switcher dropdown between Editor and Designer; calls onModeChange on selection. -->
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
	import type { CrafterMode } from '../../types.js';

	let {
		mode,
		onModeChange
	}: {
		mode: CrafterMode;
		onModeChange?: (mode: CrafterMode) => void;
	} = $props();

	// Mode configuration with display name and icon
	const modes = [
		{
			id: 'editor' as const,
			name: 'Editor',
			icon: PencilRulerIcon
		},
		{
			id: 'designer' as const,
			name: 'Designer',
			icon: PaletteIcon
		}
	] satisfies { id: CrafterMode; name: string; icon: typeof PencilRulerIcon }[];

	// Find the current mode config
	const currentModeConfig = $derived(modes.find((m) => m.id === mode) ?? modes[0]);
</script>

<SidebarMenu>
	<SidebarMenuItem>
		<DropdownMenu>
			<DropdownMenuTrigger>
				{#snippet child({ props })}
					<SidebarMenuButton {...props} class="w-fit px-1.5">
						<div class="flex aspect-square size-5 items-center justify-center rounded-md">
							<currentModeConfig.icon class="size-3" />
						</div>
						<span class="truncate font-medium">{currentModeConfig.name}</span>
						<ChevronDownIcon class="opacity-50" />
					</SidebarMenuButton>
				{/snippet}
			</DropdownMenuTrigger>
			<DropdownMenuContent class="w-64 rounded-lg" align="start" side="bottom" sideOffset={4}>
				<DropdownMenuLabel>Mode</DropdownMenuLabel>
				{#each modes as modeConfig, index (modeConfig.id)}
					<DropdownMenuItem
						onSelect={() => {
							onModeChange?.(modeConfig.id);
						}}
						class="gap-2 p-2"
					>
						<div class="flex size-6 items-center justify-center rounded-xs">
							<modeConfig.icon class="size-4 shrink-0 text-[currentColor]" />
						</div>
						<div class="font-medium">{modeConfig.name}</div>
						<DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
					</DropdownMenuItem>
				{/each}
			</DropdownMenuContent>
		</DropdownMenu>
	</SidebarMenuItem>
</SidebarMenu>
