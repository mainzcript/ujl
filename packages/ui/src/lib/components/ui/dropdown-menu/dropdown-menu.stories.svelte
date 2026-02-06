<script module lang="ts">
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import {
		DropdownMenu,
		DropdownMenuTrigger,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuSeparator,
		DropdownMenuSub,
		DropdownMenuSubTrigger,
		DropdownMenuSubContent,
		DropdownMenuCheckboxItem,
		DropdownMenuRadioGroup,
		DropdownMenuRadioItem,
		DropdownMenuLabel,
		DropdownMenuShortcut,
		DropdownMenuGroup,
	} from "./index.ts";
	import { Button } from "../button/index.ts";
	import { Avatar, AvatarImage, AvatarFallback } from "../avatar/index.ts";

	const { Story } = defineMeta({
		title: "Components/Complex/DropdownMenu",
		component: DropdownMenu,
		tags: ["autodocs"],
		argTypes: {},
		args: {},
	});
</script>

<!-- Default -->
<Story name="Default">
	{#snippet template()}
		<DropdownMenu>
			<DropdownMenuTrigger>
				<Button variant="outline">Open Menu</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent class="w-56">
				<DropdownMenuLabel>My Account</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem>
					Profile
					<DropdownMenuShortcut>Ctrl+P</DropdownMenuShortcut>
				</DropdownMenuItem>
				<DropdownMenuItem>
					Settings
					<DropdownMenuShortcut>Ctrl+S</DropdownMenuShortcut>
				</DropdownMenuItem>
				<DropdownMenuItem>
					Billing
					<DropdownMenuShortcut>Ctrl+B</DropdownMenuShortcut>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem>
					Log out
					<DropdownMenuShortcut>Ctrl+Q</DropdownMenuShortcut>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	{/snippet}
</Story>

<!-- With Icons -->
<Story name="With Icons">
	{#snippet template()}
		<DropdownMenu>
			<DropdownMenuTrigger>
				<Button variant="outline">Actions</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent class="w-56">
				<DropdownMenuItem>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
						<circle cx="12" cy="7" r="4" />
					</svg>
					Profile
					<DropdownMenuShortcut>Ctrl+P</DropdownMenuShortcut>
				</DropdownMenuItem>
				<DropdownMenuItem>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<rect width="20" height="14" x="2" y="5" rx="2" />
						<line x1="2" x2="22" y1="10" y2="10" />
					</svg>
					Billing
					<DropdownMenuShortcut>Ctrl+B</DropdownMenuShortcut>
				</DropdownMenuItem>
				<DropdownMenuItem>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path
							d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
						/>
						<circle cx="12" cy="12" r="3" />
					</svg>
					Settings
					<DropdownMenuShortcut>Ctrl+,</DropdownMenuShortcut>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem class="text-destructive">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
						<polyline points="16 17 21 12 16 7" />
						<line x1="21" x2="9" y1="12" y2="12" />
					</svg>
					Log out
					<DropdownMenuShortcut>Ctrl+Q</DropdownMenuShortcut>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	{/snippet}
</Story>

<!-- With Submenus -->
<Story name="With Submenus">
	{#snippet template()}
		<DropdownMenu>
			<DropdownMenuTrigger>
				<Button variant="outline">Options</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent class="w-56">
				<DropdownMenuItem>New File</DropdownMenuItem>
				<DropdownMenuItem>New Window</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuSub>
					<DropdownMenuSubTrigger>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<circle cx="18" cy="5" r="3" />
							<circle cx="6" cy="12" r="3" />
							<circle cx="18" cy="19" r="3" />
							<line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
							<line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
						</svg>
						Share
					</DropdownMenuSubTrigger>
					<DropdownMenuSubContent class="w-48">
						<DropdownMenuItem>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<rect width="20" height="16" x="2" y="4" rx="2" />
								<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
							</svg>
							Email
						</DropdownMenuItem>
						<DropdownMenuItem>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
							</svg>
							Message
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
								<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
							</svg>
							Copy Link
						</DropdownMenuItem>
					</DropdownMenuSubContent>
				</DropdownMenuSub>
				<DropdownMenuSub>
					<DropdownMenuSubTrigger>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
							<circle cx="9" cy="7" r="4" />
							<line x1="19" x2="19" y1="8" y2="14" />
							<line x1="22" x2="16" y1="11" y2="11" />
						</svg>
						Invite Users
					</DropdownMenuSubTrigger>
					<DropdownMenuSubContent class="w-48">
						<DropdownMenuItem>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<rect width="20" height="16" x="2" y="4" rx="2" />
								<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
							</svg>
							Email Invite
						</DropdownMenuItem>
						<DropdownMenuItem>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
								<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
							</svg>
							Invite Link
						</DropdownMenuItem>
					</DropdownMenuSubContent>
				</DropdownMenuSub>
				<DropdownMenuSeparator />
				<DropdownMenuItem>Print</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	{/snippet}
</Story>

<!-- With Checkboxes -->
<Story name="With Checkboxes">
	{#snippet template()}
		<DropdownMenu>
			<DropdownMenuTrigger>
				<Button variant="outline">View Options</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent class="w-56">
				<DropdownMenuLabel>Appearance</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuCheckboxItem checked>Status Bar</DropdownMenuCheckboxItem>
				<DropdownMenuCheckboxItem checked>Activity Bar</DropdownMenuCheckboxItem>
				<DropdownMenuCheckboxItem>Panel</DropdownMenuCheckboxItem>
				<DropdownMenuSeparator />
				<DropdownMenuLabel>Features</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuCheckboxItem checked>Full Screen</DropdownMenuCheckboxItem>
				<DropdownMenuCheckboxItem>Zen Mode</DropdownMenuCheckboxItem>
			</DropdownMenuContent>
		</DropdownMenu>
	{/snippet}
</Story>

<!-- With Radio Items -->
<Story name="With Radio Items">
	{#snippet template()}
		<DropdownMenu>
			<DropdownMenuTrigger>
				<Button variant="outline">Select Theme</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent class="w-56">
				<DropdownMenuLabel>Theme</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuRadioGroup value="system">
					<DropdownMenuRadioItem value="light">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<circle cx="12" cy="12" r="4" />
							<path d="M12 2v2" />
							<path d="M12 20v2" />
							<path d="m4.93 4.93 1.41 1.41" />
							<path d="m17.66 17.66 1.41 1.41" />
							<path d="M2 12h2" />
							<path d="M20 12h2" />
							<path d="m6.34 17.66-1.41 1.41" />
							<path d="m19.07 4.93-1.41 1.41" />
						</svg>
						Light
					</DropdownMenuRadioItem>
					<DropdownMenuRadioItem value="dark">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
						</svg>
						Dark
					</DropdownMenuRadioItem>
					<DropdownMenuRadioItem value="system">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<rect width="20" height="14" x="2" y="3" rx="2" />
							<line x1="8" x2="16" y1="21" y2="21" />
							<line x1="12" x2="12" y1="17" y2="21" />
						</svg>
						System
					</DropdownMenuRadioItem>
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	{/snippet}
</Story>

<!-- User Menu Example -->
<Story name="User Menu Example">
	{#snippet template()}
		<DropdownMenu>
			<DropdownMenuTrigger>
				<Button variant="ghost" size="icon" class="rounded-full">
					<Avatar class="size-8">
						<AvatarImage src="https://github.com/shadcn.png" alt="User" />
						<AvatarFallback>JD</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent class="w-56" align="end">
				<DropdownMenuLabel class="font-normal">
					<div class="flex flex-col space-y-1">
						<p class="text-sm leading-none font-medium">John Doe</p>
						<p class="text-xs leading-none text-muted-foreground">john@example.com</p>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
							<circle cx="12" cy="7" r="4" />
						</svg>
						Profile
						<DropdownMenuShortcut>Ctrl+P</DropdownMenuShortcut>
					</DropdownMenuItem>
					<DropdownMenuItem>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<rect width="20" height="14" x="2" y="5" rx="2" />
							<line x1="2" x2="22" y1="10" y2="10" />
						</svg>
						Billing
						<DropdownMenuShortcut>Ctrl+B</DropdownMenuShortcut>
					</DropdownMenuItem>
					<DropdownMenuItem>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path
								d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
							/>
							<circle cx="12" cy="12" r="3" />
						</svg>
						Settings
						<DropdownMenuShortcut>Ctrl+,</DropdownMenuShortcut>
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<circle cx="12" cy="12" r="10" />
						<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
						<path d="M12 17h.01" />
					</svg>
					Help
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem class="text-destructive">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
						<polyline points="16 17 21 12 16 7" />
						<line x1="21" x2="9" y1="12" y2="12" />
					</svg>
					Log out
					<DropdownMenuShortcut>Ctrl+Q</DropdownMenuShortcut>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	{/snippet}
</Story>

<!-- Playground -->
<Story name="Playground">
	{#snippet template()}
		<DropdownMenu>
			<DropdownMenuTrigger>
				<Button variant="outline">Open</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent class="w-56">
				<DropdownMenuLabel>Actions</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem>Edit</DropdownMenuItem>
				<DropdownMenuItem>Duplicate</DropdownMenuItem>
				<DropdownMenuItem>Archive</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem class="text-destructive">Delete</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	{/snippet}
</Story>
