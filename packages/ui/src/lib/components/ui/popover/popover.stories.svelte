<script module lang="ts">
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import {
		Popover,
		PopoverContent,
		PopoverTrigger,
		PopoverClose,
		PopoverTriggerButton,
	} from "./index.ts";
	import { Button } from "../button/index.ts";
	import { Input } from "../input/index.ts";
	import { Label } from "../label/index.ts";

	const { Story } = defineMeta({
		title: "Components/Overlays/Popover",
		component: Popover,
		tags: ["autodocs"],
		argTypes: {
			open: {
				control: "boolean",
				description: "Whether the popover is open",
				table: {
					category: "State",
					defaultValue: { summary: "false" },
				},
			},
		},
		args: {
			open: false,
		},
	});
</script>

<!-- Default -->
<Story name="Default">
	{#snippet template(args)}
		<Popover {...args}>
			<PopoverTriggerButton variant="outline">Open Popover</PopoverTriggerButton>
			<PopoverContent>
				<div class="grid gap-4">
					<div class="space-y-2">
						<h4 class="leading-none font-medium">Dimensions</h4>
						<p class="text-sm text-muted-foreground">Set the dimensions for the layer.</p>
					</div>
					<div class="grid gap-2">
						<div class="grid grid-cols-3 items-center gap-4">
							<Label>Width</Label>
							<Input value="100%" class="col-span-2 h-8" />
						</div>
						<div class="grid grid-cols-3 items-center gap-4">
							<Label>Max. width</Label>
							<Input value="300px" class="col-span-2 h-8" />
						</div>
						<div class="grid grid-cols-3 items-center gap-4">
							<Label>Height</Label>
							<Input value="25px" class="col-span-2 h-8" />
						</div>
						<div class="grid grid-cols-3 items-center gap-4">
							<Label>Max. height</Label>
							<Input value="none" class="col-span-2 h-8" />
						</div>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	{/snippet}
</Story>

<!-- Positions -->
<Story name="Positions" asChild>
	<div class="flex flex-wrap items-center justify-center gap-8 p-8">
		<Popover>
			<PopoverTriggerButton variant="outline">Top</PopoverTriggerButton>
			<PopoverContent side="top">
				<p class="text-sm">Popover on top</p>
			</PopoverContent>
		</Popover>

		<Popover>
			<PopoverTriggerButton variant="outline">Right</PopoverTriggerButton>
			<PopoverContent side="right">
				<p class="text-sm">Popover on right</p>
			</PopoverContent>
		</Popover>

		<Popover>
			<PopoverTriggerButton variant="outline">Bottom</PopoverTriggerButton>
			<PopoverContent side="bottom">
				<p class="text-sm">Popover on bottom</p>
			</PopoverContent>
		</Popover>

		<Popover>
			<PopoverTriggerButton variant="outline">Left</PopoverTriggerButton>
			<PopoverContent side="left">
				<p class="text-sm">Popover on left</p>
			</PopoverContent>
		</Popover>
	</div>
</Story>

<!-- Alignments -->
<Story name="Alignments" asChild>
	<div class="flex flex-wrap items-center justify-center gap-8 p-8">
		<Popover>
			<PopoverTriggerButton variant="outline">Start</PopoverTriggerButton>
			<PopoverContent align="start" class="w-48">
				<p class="text-sm">Aligned to start</p>
			</PopoverContent>
		</Popover>

		<Popover>
			<PopoverTriggerButton variant="outline">Center</PopoverTriggerButton>
			<PopoverContent align="center" class="w-48">
				<p class="text-sm">Aligned to center</p>
			</PopoverContent>
		</Popover>

		<Popover>
			<PopoverTriggerButton variant="outline">End</PopoverTriggerButton>
			<PopoverContent align="end" class="w-48">
				<p class="text-sm">Aligned to end</p>
			</PopoverContent>
		</Popover>
	</div>
</Story>

<!-- With Form -->
<Story name="With Form">
	{#snippet template(args)}
		<Popover {...args}>
			<PopoverTriggerButton>Update Email</PopoverTriggerButton>
			<PopoverContent class="w-80">
				<div class="grid gap-4">
					<div class="space-y-2">
						<h4 class="leading-none font-medium">Email Address</h4>
						<p class="text-sm text-muted-foreground">Change your email address.</p>
					</div>
					<div class="grid gap-2">
						<Label>Current Email</Label>
						<Input disabled value="current@example.com" />
					</div>
					<div class="grid gap-2">
						<Label>New Email</Label>
						<Input type="email" placeholder="new@example.com" />
					</div>
					<div class="flex justify-end gap-2">
						<PopoverClose>
							<Button variant="outline" size="sm">Cancel</Button>
						</PopoverClose>
						<Button size="sm">Save</Button>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	{/snippet}
</Story>

<!-- User Menu -->
<Story name="User Menu">
	{#snippet template(args)}
		<Popover {...args}>
			<PopoverTrigger>
				<Button variant="ghost" class="relative h-10 w-10 rounded-full">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground"
					>
						JD
					</div>
				</Button>
			</PopoverTrigger>
			<PopoverContent class="w-56" align="end">
				<div class="grid gap-4">
					<div class="flex items-center gap-3">
						<div
							class="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground"
						>
							JD
						</div>
						<div class="flex flex-col">
							<p class="text-sm font-medium">John Doe</p>
							<p class="text-xs text-muted-foreground">john@example.com</p>
						</div>
					</div>
					<div class="grid gap-1">
						<Button variant="ghost" class="justify-start" size="sm">
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
								<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
								<circle cx="12" cy="7" r="4" />
							</svg>
							Profile
						</Button>
						<Button variant="ghost" class="justify-start" size="sm">
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
								<path
									d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
								/>
								<circle cx="12" cy="12" r="3" />
							</svg>
							Settings
						</Button>
						<Button variant="ghost" class="justify-start" size="sm">
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
								<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
								<polyline points="16 17 21 12 16 7" />
								<line x1="21" x2="9" y1="12" y2="12" />
							</svg>
							Log out
						</Button>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	{/snippet}
</Story>

<!-- Color Picker -->
<Story name="Color Picker">
	{#snippet template(args)}
		<Popover {...args}>
			<PopoverTriggerButton variant="outline" class="w-32 justify-start">
				<div class="mr-2 h-4 w-4 rounded bg-blue-500"></div>
				Blue
			</PopoverTriggerButton>
			<PopoverContent class="w-64">
				<div class="grid gap-4">
					<h4 class="leading-none font-medium">Choose a color</h4>
					<div class="grid grid-cols-6 gap-2">
						<button
							aria-label="Red"
							class="h-8 w-8 rounded bg-red-500 hover:ring-2 hover:ring-ring hover:ring-offset-2"
						></button>
						<button
							aria-label="Orange"
							class="h-8 w-8 rounded bg-orange-500 hover:ring-2 hover:ring-ring hover:ring-offset-2"
						></button>
						<button
							aria-label="Yellow"
							class="h-8 w-8 rounded bg-yellow-500 hover:ring-2 hover:ring-ring hover:ring-offset-2"
						></button>
						<button
							aria-label="Green"
							class="h-8 w-8 rounded bg-green-500 hover:ring-2 hover:ring-ring hover:ring-offset-2"
						></button>
						<button
							aria-label="Blue"
							class="h-8 w-8 rounded bg-blue-500 ring-2 ring-ring ring-offset-2"
						></button>
						<button
							aria-label="Purple"
							class="h-8 w-8 rounded bg-purple-500 hover:ring-2 hover:ring-ring hover:ring-offset-2"
						></button>
						<button
							aria-label="Pink"
							class="h-8 w-8 rounded bg-pink-500 hover:ring-2 hover:ring-ring hover:ring-offset-2"
						></button>
						<button
							aria-label="Gray"
							class="h-8 w-8 rounded bg-gray-500 hover:ring-2 hover:ring-ring hover:ring-offset-2"
						></button>
						<button
							aria-label="Slate"
							class="h-8 w-8 rounded bg-slate-800 hover:ring-2 hover:ring-ring hover:ring-offset-2"
						></button>
						<button
							aria-label="White"
							class="h-8 w-8 rounded border bg-white hover:ring-2 hover:ring-ring hover:ring-offset-2"
						></button>
						<button
							aria-label="Teal"
							class="h-8 w-8 rounded bg-teal-500 hover:ring-2 hover:ring-ring hover:ring-offset-2"
						></button>
						<button
							aria-label="Indigo"
							class="h-8 w-8 rounded bg-indigo-500 hover:ring-2 hover:ring-ring hover:ring-offset-2"
						></button>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	{/snippet}
</Story>

<!-- Notifications -->
<Story name="Notifications">
	{#snippet template(args)}
		<Popover {...args}>
			<PopoverTrigger>
				<Button variant="outline" size="icon" class="relative">
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
						<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
						<path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
					</svg>
					<span
						class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground"
					>
						3
					</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent class="w-80" align="end">
				<div class="grid gap-4">
					<div class="flex items-center justify-between">
						<h4 class="leading-none font-medium">Notifications</h4>
						<Button variant="ghost" size="sm">Mark all read</Button>
					</div>
					<div class="grid gap-2">
						<div class="flex gap-3 rounded-lg p-2 hover:bg-muted">
							<div class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="14"
									height="14"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									class="text-blue-600"
								>
									<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
									<circle cx="12" cy="7" r="4" />
								</svg>
							</div>
							<div class="flex-1">
								<p class="text-sm font-medium">New follower</p>
								<p class="text-xs text-muted-foreground">Jane Smith started following you</p>
							</div>
						</div>
						<div class="flex gap-3 rounded-lg p-2 hover:bg-muted">
							<div class="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="14"
									height="14"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									class="text-green-600"
								>
									<polyline points="20 6 9 17 4 12" />
								</svg>
							</div>
							<div class="flex-1">
								<p class="text-sm font-medium">Task completed</p>
								<p class="text-xs text-muted-foreground">Project review was completed</p>
							</div>
						</div>
						<div class="flex gap-3 rounded-lg p-2 hover:bg-muted">
							<div class="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="14"
									height="14"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									class="text-yellow-600"
								>
									<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
								</svg>
							</div>
							<div class="flex-1">
								<p class="text-sm font-medium">New message</p>
								<p class="text-xs text-muted-foreground">You have 2 unread messages</p>
							</div>
						</div>
					</div>
					<Button variant="outline" size="sm" class="w-full">View all notifications</Button>
				</div>
			</PopoverContent>
		</Popover>
	{/snippet}
</Story>

<!-- Custom Trigger -->
<Story name="Custom Trigger">
	{#snippet template(args)}
		<Popover {...args}>
			<PopoverTrigger>
				<span
					class="cursor-pointer text-sm text-primary underline decoration-dotted underline-offset-4"
				>
					What is this?
				</span>
			</PopoverTrigger>
			<PopoverContent class="w-64">
				<p class="text-sm">
					This is a popover with a custom trigger element. You can use any element as a trigger.
				</p>
			</PopoverContent>
		</Popover>
	{/snippet}
</Story>

<!-- Playground -->
<Story name="Playground">
	{#snippet template(args)}
		<div class="flex items-center justify-center p-20">
			<Popover {...args}>
				<PopoverTriggerButton variant="outline">Open Playground Popover</PopoverTriggerButton>
				<PopoverContent>
					<div class="grid gap-4">
						<div class="space-y-2">
							<h4 class="leading-none font-medium">Playground</h4>
							<p class="text-sm text-muted-foreground">
								Toggle the open control to see the controlled state. Check the "Positions" and
								"Alignments" stories for positioning options.
							</p>
						</div>
					</div>
				</PopoverContent>
			</Popover>
		</div>
	{/snippet}
</Story>
