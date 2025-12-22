<script lang="ts">
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		Text,
		Grid,
		GridItem,
		Button,
		Dialog,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogDescription,
		DialogBody,
		DialogFooter,
		DialogTriggerButton,
		DialogCloseButton,
		Drawer,
		DrawerContent,
		DrawerHeader,
		DrawerTitle,
		DrawerDescription,
		DrawerFooter,
		DrawerTriggerButton,
		DrawerCloseButton,
		Popover,
		PopoverContent,
		PopoverClose,
		PopoverTriggerButton,
		HoverCard,
		HoverCardTrigger,
		HoverCardContent,
		Tooltip,
		TooltipTrigger,
		TooltipContent,
		TooltipProvider,
		DropdownMenu,
		DropdownMenuTrigger,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuLabel,
		DropdownMenuSeparator,
		DropdownMenuGroup,
		DropdownMenuShortcut,
		DropdownMenuSub,
		DropdownMenuSubTrigger,
		DropdownMenuSubContent,
		Sheet,
		SheetContent,
		SheetHeader,
		SheetBody,
		SheetTitle,
		SheetDescription,
		SheetFooter,
		SheetTriggerButton,
		SheetCloseButton,
		ContextMenu,
		ContextMenuTrigger,
		ContextMenuContent,
		ContextMenuItem,
		ContextMenuLabel,
		ContextMenuSeparator,
		ContextMenuGroup,
		ContextMenuShortcut,
		ContextMenuCheckboxItem,
		ContextMenuRadioGroup,
		ContextMenuRadioItem,
		ContextMenuSub,
		ContextMenuSubTrigger,
		ContextMenuSubContent,
		CommandDialog,
		CommandEmpty,
		CommandGroup,
		CommandItem,
		CommandInput,
		CommandList,
		CommandSeparator,
		CommandShortcut,
		Kbd
	} from '$lib/index.js';
	import CalculatorIcon from '@lucide/svelte/icons/calculator';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import CreditCardIcon from '@lucide/svelte/icons/credit-card';
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import SmileIcon from '@lucide/svelte/icons/smile';
	import UserIcon from '@lucide/svelte/icons/user';

	let commandDialogOpen = $state(false);

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			commandDialogOpen = !commandDialogOpen;
		}
	}
</script>

<svelte:document onkeydown={handleKeydown} />

<Grid>
	<GridItem>
		<Card>
			<CardHeader>
				<CardTitle>Overlay Components</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="flex flex-nowrap items-center gap-2 overflow-x-auto">
					<Dialog>
						<DialogTriggerButton>Dialog</DialogTriggerButton>
						<DialogContent class="sm:max-w-[425px]">
							<DialogHeader>
								<DialogTitle>Dialog Title</DialogTitle>
								<DialogDescription>This is the Dialog Description.</DialogDescription>
							</DialogHeader>
							<DialogBody>
								<Text>The Dialog Body goes here.</Text>
							</DialogBody>
							<DialogFooter>
								<DialogCloseButton size="sm" variant="muted">Close</DialogCloseButton>
							</DialogFooter>
						</DialogContent>
					</Dialog>
					<Drawer>
						<DrawerTriggerButton>Drawer</DrawerTriggerButton>
						<DrawerContent>
							<div class="mx-auto w-full max-w-sm">
								<DrawerHeader>
									<DrawerTitle>Drawer Title</DrawerTitle>
									<DrawerDescription>This is the Drawer Description.</DrawerDescription>
								</DrawerHeader>
								<div class="p-4 pb-0">
									<Text>
										This is the content of the drawer. It slides up from the bottom and is perfect
										for mobile interfaces.
									</Text>
								</div>
								<DrawerFooter>
									<Button>Submit</Button>
									<DrawerCloseButton variant="muted">Cancel</DrawerCloseButton>
								</DrawerFooter>
							</div>
						</DrawerContent>
					</Drawer>
					<Popover>
						<PopoverTriggerButton>Popover</PopoverTriggerButton>
						<PopoverContent>
							<div class="space-y-2">
								<Text size="sm">
									This is the content of the popover. It appears over other elements.
								</Text>
								<div class="flex justify-end">
									<PopoverClose>
										<Button variant="muted" size="sm">Close</Button>
									</PopoverClose>
								</div>
							</div>
						</PopoverContent>
					</Popover>
					<DropdownMenu>
						<DropdownMenuTrigger>
							{#snippet child({ props }: { props: Record<string, unknown> })}
								<Button {...props}>Dropdown Menu</Button>
							{/snippet}
						</DropdownMenuTrigger>
						<DropdownMenuContent class="w-56" align="start">
							<DropdownMenuLabel>My Account</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuGroup>
								<DropdownMenuItem>
									Profile
									<DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
								</DropdownMenuItem>
								<DropdownMenuItem>
									Billing
									<DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
								</DropdownMenuItem>
								<DropdownMenuItem>
									Settings
									<DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
								</DropdownMenuItem>
							</DropdownMenuGroup>
							<DropdownMenuSeparator />
							<DropdownMenuSub>
								<DropdownMenuSubTrigger>Team</DropdownMenuSubTrigger>
								<DropdownMenuSubContent>
									<DropdownMenuItem>Invite users</DropdownMenuItem>
									<DropdownMenuItem>Email</DropdownMenuItem>
									<DropdownMenuItem>Message</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem>More...</DropdownMenuItem>
								</DropdownMenuSubContent>
							</DropdownMenuSub>
							<DropdownMenuItem>New Team</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem>GitHub</DropdownMenuItem>
							<DropdownMenuItem>Support</DropdownMenuItem>
							<DropdownMenuItem disabled>API</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem>
								Log out
								<DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
					<Sheet>
						<SheetTriggerButton>Sheet</SheetTriggerButton>
						<SheetContent side="right">
							<SheetHeader>
								<SheetTitle>Sheet Title</SheetTitle>
								<SheetDescription>This is the Sheet Description.</SheetDescription>
							</SheetHeader>
							<SheetBody>
								<Text>
									Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod
									tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At
									vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren,
									no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit
									amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut
									labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et
									justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus
									est Lorem ipsum dolor sit amet.
								</Text>
							</SheetBody>
							<SheetFooter>
								<SheetCloseButton variant="muted">Save changes</SheetCloseButton>
							</SheetFooter>
						</SheetContent>
					</Sheet>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger>
								<Text class="p-2 underline">Tooltip</Text>
							</TooltipTrigger>
							<TooltipContent>This is a tooltip.</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					<HoverCard>
						<HoverCardTrigger>
							<Text class="p-2 underline">@hover-card</Text>
						</HoverCardTrigger>
						<HoverCardContent>
							<div class="space-y-2">
								<Text size="sm">This is the content of the hover card.</Text>
							</div>
						</HoverCardContent>
					</HoverCard>
					<ContextMenu>
						<ContextMenuTrigger class="rounded-md border border-dashed border-foreground p-2">
							<Text size="sm">Right click here</Text>
						</ContextMenuTrigger>
						<ContextMenuContent class="w-52">
							<ContextMenuItem inset>
								Back
								<ContextMenuShortcut>⌘[</ContextMenuShortcut>
							</ContextMenuItem>
							<ContextMenuItem inset disabled>
								Forward
								<ContextMenuShortcut>⌘]</ContextMenuShortcut>
							</ContextMenuItem>
							<ContextMenuItem inset>
								Reload
								<ContextMenuShortcut>⌘R</ContextMenuShortcut>
							</ContextMenuItem>
							<ContextMenuSub>
								<ContextMenuSubTrigger inset>More Tools</ContextMenuSubTrigger>
								<ContextMenuSubContent class="w-48">
									<ContextMenuItem>
										Save Page As...
										<ContextMenuShortcut>⇧⌘S</ContextMenuShortcut>
									</ContextMenuItem>
									<ContextMenuItem>Create Shortcut...</ContextMenuItem>
									<ContextMenuItem>Name Window...</ContextMenuItem>
									<ContextMenuSeparator />
									<ContextMenuItem>Developer Tools</ContextMenuItem>
								</ContextMenuSubContent>
							</ContextMenuSub>
							<ContextMenuSeparator />
							<ContextMenuCheckboxItem>Show Bookmarks</ContextMenuCheckboxItem>
							<ContextMenuCheckboxItem>Show Full URLs</ContextMenuCheckboxItem>
							<ContextMenuSeparator />
							<ContextMenuRadioGroup>
								<ContextMenuGroup>
									<ContextMenuLabel inset>People</ContextMenuLabel>
									<ContextMenuRadioItem value="pedro">Pedro Duarte</ContextMenuRadioItem>
									<ContextMenuRadioItem value="colm">Colm Tuite</ContextMenuRadioItem>
								</ContextMenuGroup>
							</ContextMenuRadioGroup>
						</ContextMenuContent>
					</ContextMenu>
				</div>
			</CardContent>
		</Card>
	</GridItem>
	<GridItem>
		<Card>
			<CardHeader>
				<CardTitle>Command Dialog</CardTitle>
			</CardHeader>
			<CardContent class="space-y-6">
				<!-- Command Dialog Example -->
				<div class="space-y-3">
					<Text size="sm" class="font-medium">Command Dialog:</Text>
					<div class="space-y-2">
						<Button variant="outline" size="sm" onclick={() => (commandDialogOpen = true)}>
							Open Command Dialog
						</Button>
						<Text size="xs" intensity="muted">
							Press <Kbd>⌘</Kbd> + <Kbd>K</Kbd> to open
						</Text>
					</div>
				</div>
			</CardContent>
		</Card>
	</GridItem>
</Grid>
<!-- Command Dialog -->
<CommandDialog bind:open={commandDialogOpen}>
	<CommandInput placeholder="Type a command or search..." />
	<CommandList>
		<CommandEmpty>No results found.</CommandEmpty>
		<CommandGroup heading="Suggestions">
			<CommandItem>
				<CalendarIcon />
				<span>Calendar</span>
			</CommandItem>
			<CommandItem>
				<SmileIcon />
				<span>Search Emoji</span>
			</CommandItem>
			<CommandItem>
				<CalculatorIcon />
				<span>Calculator</span>
			</CommandItem>
		</CommandGroup>
		<CommandSeparator />
		<CommandGroup heading="Settings">
			<CommandItem>
				<UserIcon />
				<span>Profile</span>
				<CommandShortcut>P</CommandShortcut>
			</CommandItem>
			<CommandItem>
				<CreditCardIcon />
				<span>Billing</span>
				<CommandShortcut>B</CommandShortcut>
			</CommandItem>
			<CommandItem>
				<SettingsIcon />
				<span>Settings</span>
				<CommandShortcut>S</CommandShortcut>
			</CommandItem>
		</CommandGroup>
	</CommandList>
</CommandDialog>
