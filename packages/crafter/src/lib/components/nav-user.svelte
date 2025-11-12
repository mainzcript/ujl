<script lang="ts">
	import BadgeCheckIcon from '@lucide/svelte/icons/badge-check';
	import BellIcon from '@lucide/svelte/icons/bell';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import CreditCardIcon from '@lucide/svelte/icons/credit-card';
	import LogOutIcon from '@lucide/svelte/icons/log-out';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';

	import {
		Avatar,
		AvatarImage,
		AvatarFallback,
		DropdownMenu,
		DropdownMenuTrigger,
		DropdownMenuContent,
		DropdownMenuLabel,
		DropdownMenuSeparator,
		DropdownMenuGroup,
		DropdownMenuItem
	} from '@ujl-framework/ui';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { useSidebar } from '$lib/components/ui/sidebar/index.js';

	// Namespace objects to maintain compatibility with existing component usage patterns.
	// Components from @ujl-framework/ui are exported with full names (e.g., Avatar, AvatarImage)
	// but the codebase uses namespace-style access (e.g., Avatar.Root, Avatar.Image)
	const AvatarNamespace = {
		Root: Avatar,
		Image: AvatarImage,
		Fallback: AvatarFallback
	};

	const DropdownMenuNamespace = {
		Root: DropdownMenu,
		Trigger: DropdownMenuTrigger,
		Content: DropdownMenuContent,
		Label: DropdownMenuLabel,
		Separator: DropdownMenuSeparator,
		Group: DropdownMenuGroup,
		Item: DropdownMenuItem
	};

	let { user }: { user: { name: string; email: string; avatar: string } } = $props();

	const sidebar = useSidebar();
</script>

<Sidebar.Menu>
	<Sidebar.MenuItem>
		<DropdownMenuNamespace.Root>
			<DropdownMenuNamespace.Trigger>
				{#snippet child({ props })}
					<Sidebar.MenuButton
						{...props}
						size="lg"
						class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground md:h-8 md:p-0"
					>
						<AvatarNamespace.Root class="size-8 rounded-lg">
							<AvatarNamespace.Image src={user.avatar} alt={user.name} />
							<AvatarNamespace.Fallback class="rounded-lg">CN</AvatarNamespace.Fallback>
						</AvatarNamespace.Root>
						<div class="grid flex-1 text-left text-sm leading-tight">
							<span class="truncate font-medium">{user.name}</span>
							<span class="truncate text-xs">{user.email}</span>
						</div>
						<ChevronsUpDownIcon class="ml-auto size-4" />
					</Sidebar.MenuButton>
				{/snippet}
			</DropdownMenuNamespace.Trigger>
			<DropdownMenuNamespace.Content
				class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg"
				side={sidebar.isMobile ? 'bottom' : 'right'}
				align="end"
				sideOffset={4}
			>
				<DropdownMenuNamespace.Label class="p-0 font-normal">
					<div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
						<AvatarNamespace.Root class="size-8 rounded-lg">
							<AvatarNamespace.Image src={user.avatar} alt={user.name} />
							<AvatarNamespace.Fallback class="rounded-lg">CN</AvatarNamespace.Fallback>
						</AvatarNamespace.Root>
						<div class="grid flex-1 text-left text-sm leading-tight">
							<span class="truncate font-medium">{user.name}</span>
							<span class="truncate text-xs">{user.email}</span>
						</div>
					</div>
				</DropdownMenuNamespace.Label>
				<DropdownMenuNamespace.Separator />
				<DropdownMenuNamespace.Group>
					<DropdownMenuNamespace.Item>
						<SparklesIcon />
						Upgrade to Pro
					</DropdownMenuNamespace.Item>
				</DropdownMenuNamespace.Group>
				<DropdownMenuNamespace.Separator />
				<DropdownMenuNamespace.Group>
					<DropdownMenuNamespace.Item>
						<BadgeCheckIcon />
						Account
					</DropdownMenuNamespace.Item>
					<DropdownMenuNamespace.Item>
						<CreditCardIcon />
						Billing
					</DropdownMenuNamespace.Item>
					<DropdownMenuNamespace.Item>
						<BellIcon />
						Notifications
					</DropdownMenuNamespace.Item>
				</DropdownMenuNamespace.Group>
				<DropdownMenuNamespace.Separator />
				<DropdownMenuNamespace.Item>
					<LogOutIcon />
					Log out
				</DropdownMenuNamespace.Item>
			</DropdownMenuNamespace.Content>
		</DropdownMenuNamespace.Root>
	</Sidebar.MenuItem>
</Sidebar.Menu>
