<script module lang="ts">
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import {
		Command,
		CommandDialog,
		CommandInput,
		CommandList,
		CommandEmpty,
		CommandGroup,
		CommandItem,
		CommandSeparator,
		CommandShortcut,
	} from "./index.ts";
	import { Button } from "../button/index.ts";

	const { Story } = defineMeta({
		title: "Components/Complex/Command",
		component: Command,
		tags: ["autodocs"],
		argTypes: {
			value: {
				control: "text",
				description: "The currently selected value",
				table: {
					category: "State",
					defaultValue: { summary: "" },
				},
			},
		},
		args: {
			value: "",
		},
	});

	let open = $state(false);
</script>

<!-- Default -->
<Story name="Default">
	{#snippet template(args)}
		<Command {...args} class="w-full max-w-[400px] rounded-lg border shadow-md">
			<CommandInput placeholder="Type a command or search..." />
			<CommandList>
				<CommandEmpty>No results found.</CommandEmpty>
				<CommandGroup heading="Suggestions">
					<CommandItem>
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
							<rect width="7" height="7" x="3" y="3" rx="1" />
							<rect width="7" height="7" x="14" y="3" rx="1" />
							<rect width="7" height="7" x="14" y="14" rx="1" />
							<rect width="7" height="7" x="3" y="14" rx="1" />
						</svg>
						<span>Dashboard</span>
					</CommandItem>
					<CommandItem>
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
						<span>Settings</span>
					</CommandItem>
					<CommandItem>
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
						<span>Profile</span>
					</CommandItem>
				</CommandGroup>
			</CommandList>
		</Command>
	{/snippet}
</Story>

<!-- With Groups and Shortcuts -->
<Story name="With Groups and Shortcuts">
	{#snippet template()}
		<Command class="w-full max-w-[400px] rounded-lg border shadow-md">
			<CommandInput placeholder="Type a command or search..." />
			<CommandList>
				<CommandEmpty>No results found.</CommandEmpty>
				<CommandGroup heading="Actions">
					<CommandItem>
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
							<circle cx="11" cy="11" r="8" />
							<path d="m21 21-4.3-4.3" />
						</svg>
						<span>Search</span>
						<CommandShortcut>Ctrl+K</CommandShortcut>
					</CommandItem>
					<CommandItem>
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
							<path d="M5 12h14" />
							<path d="M12 5v14" />
						</svg>
						<span>New File</span>
						<CommandShortcut>Ctrl+N</CommandShortcut>
					</CommandItem>
					<CommandItem>
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
							<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
							<polyline points="17 21 17 13 7 13 7 21" />
							<polyline points="7 3 7 8 15 8" />
						</svg>
						<span>Save</span>
						<CommandShortcut>Ctrl+S</CommandShortcut>
					</CommandItem>
				</CommandGroup>
				<CommandSeparator />
				<CommandGroup heading="Navigation">
					<CommandItem>
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
							<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
							<polyline points="9 22 9 12 15 12 15 22" />
						</svg>
						<span>Home</span>
						<CommandShortcut>Ctrl+H</CommandShortcut>
					</CommandItem>
					<CommandItem>
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
								d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"
							/>
							<path d="M9 18c-4.51 2-5-2-7-2" />
						</svg>
						<span>Projects</span>
						<CommandShortcut>Ctrl+P</CommandShortcut>
					</CommandItem>
				</CommandGroup>
			</CommandList>
		</Command>
	{/snippet}
</Story>

<!-- Command Dialog -->
<Story name="Command Dialog">
	{#snippet template()}
		<div class="flex flex-col items-center gap-4">
			<p class="text-sm text-muted-foreground">
				Click the button below to open the command palette
			</p>
			<Button variant="outline" onclick={() => (open = true)}>
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
					class="mr-2"
				>
					<circle cx="11" cy="11" r="8" />
					<path d="m21 21-4.3-4.3" />
				</svg>
				Open Command Palette
			</Button>
			<CommandDialog bind:open>
				<CommandInput placeholder="Type a command or search..." />
				<CommandList>
					<CommandEmpty>No results found.</CommandEmpty>
					<CommandGroup heading="Suggestions">
						<CommandItem onSelect={() => (open = false)}>
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
								<polygon points="10 8 16 12 10 16 10 8" />
							</svg>
							<span>Quick Start</span>
						</CommandItem>
						<CommandItem onSelect={() => (open = false)}>
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
									d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"
								/>
							</svg>
							<span>Documentation</span>
						</CommandItem>
					</CommandGroup>
					<CommandSeparator />
					<CommandGroup heading="Actions">
						<CommandItem onSelect={() => (open = false)}>
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
							<span>Settings</span>
							<CommandShortcut>Ctrl+,</CommandShortcut>
						</CommandItem>
						<CommandItem onSelect={() => (open = false)}>
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
							<span>Profile</span>
							<CommandShortcut>Ctrl+P</CommandShortcut>
						</CommandItem>
					</CommandGroup>
				</CommandList>
			</CommandDialog>
		</div>
	{/snippet}
</Story>

<!-- Empty State -->
<Story name="Empty State">
	{#snippet template()}
		<Command class="w-full max-w-[400px] rounded-lg border shadow-md">
			<CommandInput placeholder="Search for something..." value="xyz123" />
			<CommandList>
				<CommandEmpty>
					<div class="flex flex-col items-center gap-2 py-6">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="text-muted-foreground"
						>
							<circle cx="11" cy="11" r="8" />
							<path d="m21 21-4.3-4.3" />
						</svg>
						<span class="text-sm text-muted-foreground">No results found</span>
					</div>
				</CommandEmpty>
				<CommandGroup heading="Suggestions">
					<CommandItem value="dashboard">Dashboard</CommandItem>
					<CommandItem value="settings">Settings</CommandItem>
					<CommandItem value="profile">Profile</CommandItem>
				</CommandGroup>
			</CommandList>
		</Command>
	{/snippet}
</Story>

<!-- File Explorer Style -->
<Story name="File Explorer Style">
	{#snippet template()}
		<Command class="w-full max-w-[400px] rounded-lg border shadow-md">
			<CommandInput placeholder="Search files..." />
			<CommandList>
				<CommandEmpty>No files found.</CommandEmpty>
				<CommandGroup heading="Recent Files">
					<CommandItem>
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
							class="text-blue-500"
						>
							<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
							<path d="M14 2v4a2 2 0 0 0 2 2h4" />
						</svg>
						<span>document.pdf</span>
						<span class="ml-auto text-xs text-muted-foreground">2 hours ago</span>
					</CommandItem>
					<CommandItem>
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
							class="text-green-500"
						>
							<rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
							<circle cx="9" cy="9" r="2" />
							<path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
						</svg>
						<span>photo.jpg</span>
						<span class="ml-auto text-xs text-muted-foreground">Yesterday</span>
					</CommandItem>
					<CommandItem>
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
							class="text-yellow-500"
						>
							<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
							<path d="M14 2v4a2 2 0 0 0 2 2h4" />
							<path d="M10 13a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1" />
							<path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1" />
						</svg>
						<span>config.json</span>
						<span class="ml-auto text-xs text-muted-foreground">3 days ago</span>
					</CommandItem>
				</CommandGroup>
				<CommandSeparator />
				<CommandGroup heading="Folders">
					<CommandItem>
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
							class="text-yellow-600"
						>
							<path
								d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"
							/>
						</svg>
						<span>Documents</span>
					</CommandItem>
					<CommandItem>
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
							class="text-yellow-600"
						>
							<path
								d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"
							/>
						</svg>
						<span>Downloads</span>
					</CommandItem>
				</CommandGroup>
			</CommandList>
		</Command>
	{/snippet}
</Story>

<!-- Playground -->
<Story name="Playground">
	{#snippet template(args)}
		<Command class="w-full max-w-[400px] rounded-lg border shadow-md" value={args.value}>
			<CommandInput placeholder="Type a command or search..." />
			<CommandList>
				<CommandEmpty>No results found.</CommandEmpty>
				<CommandGroup heading="Commands">
					<CommandItem value="copy">
						<span>Copy</span>
						<CommandShortcut>Ctrl+C</CommandShortcut>
					</CommandItem>
					<CommandItem value="paste">
						<span>Paste</span>
						<CommandShortcut>Ctrl+V</CommandShortcut>
					</CommandItem>
					<CommandItem value="cut">
						<span>Cut</span>
						<CommandShortcut>Ctrl+X</CommandShortcut>
					</CommandItem>
				</CommandGroup>
			</CommandList>
		</Command>
	{/snippet}
</Story>
