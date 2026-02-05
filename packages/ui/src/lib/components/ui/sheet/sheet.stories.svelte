<script module lang="ts">
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import {
		Sheet,
		SheetContent,
		SheetHeader,
		SheetBody,
		SheetFooter,
		SheetTitle,
		SheetDescription,
		SheetTrigger,
		SheetTriggerButton,
		SheetCloseButton,
	} from "./index.ts";
	import { Button } from "../button/index.ts";
	import { Input } from "../input/index.ts";
	import { Label } from "../label/index.ts";
	import { Separator } from "../separator/index.ts";
	const { Story } = defineMeta({
		title: "Components/Overlays/Sheet",
		component: Sheet,
		tags: ["autodocs"],
		argTypes: {
			open: {
				control: "boolean",
				description: "Whether the sheet is open",
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
		<Sheet {...args}>
			<SheetTriggerButton variant="outline">Open Sheet</SheetTriggerButton>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>Sheet Title</SheetTitle>
					<SheetDescription>
						This is a sheet component. It slides in from the right by default.
					</SheetDescription>
				</SheetHeader>
				<SheetBody>
					<p class="text-sm text-muted-foreground">
						Sheets are useful for displaying additional content without navigating away from the
						current page. They're commonly used for settings panels, navigation menus, or detailed
						views.
					</p>
				</SheetBody>
				<SheetFooter>
					<SheetCloseButton variant="outline">Cancel</SheetCloseButton>
					<SheetCloseButton>Save</SheetCloseButton>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	{/snippet}
</Story>

<!-- From Left -->
<Story name="From Left">
	{#snippet template(args)}
		<Sheet {...args}>
			<SheetTriggerButton variant="outline">Open from Left</SheetTriggerButton>
			<SheetContent side="left">
				<SheetHeader>
					<SheetTitle>Navigation</SheetTitle>
					<SheetDescription>Browse through the application sections.</SheetDescription>
				</SheetHeader>
				<SheetBody>
					<nav class="grid gap-2">
						<Button variant="ghost" class="justify-start">
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
								<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
								<polyline points="9 22 9 12 15 12 15 22" />
							</svg>
							Home
						</Button>
						<Button variant="ghost" class="justify-start">
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
								<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
								<circle cx="9" cy="7" r="4" />
								<path d="M22 21v-2a4 4 0 0 0-3-3.87" />
								<path d="M16 3.13a4 4 0 0 1 0 7.75" />
							</svg>
							Team
						</Button>
						<Button variant="ghost" class="justify-start">
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
								<rect width="20" height="14" x="2" y="5" rx="2" />
								<line x1="2" x2="22" y1="10" y2="10" />
							</svg>
							Projects
						</Button>
						<Button variant="ghost" class="justify-start">
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
					</nav>
				</SheetBody>
			</SheetContent>
		</Sheet>
	{/snippet}
</Story>

<!-- From Top -->
<Story name="From Top">
	{#snippet template(args)}
		<Sheet {...args}>
			<SheetTriggerButton variant="outline">Open from Top</SheetTriggerButton>
			<SheetContent side="top">
				<SheetHeader>
					<SheetTitle>Notification Settings</SheetTitle>
					<SheetDescription>Manage how you receive notifications.</SheetDescription>
				</SheetHeader>
				<SheetBody>
					<div class="space-y-4">
						<div class="flex items-center justify-between">
							<div>
								<p class="font-medium">Email Notifications</p>
								<p class="text-sm text-muted-foreground">Receive updates via email</p>
							</div>
							<input type="checkbox" checked class="h-4 w-4" />
						</div>
						<div class="flex items-center justify-between">
							<div>
								<p class="font-medium">Push Notifications</p>
								<p class="text-sm text-muted-foreground">Receive push notifications</p>
							</div>
							<input type="checkbox" class="h-4 w-4" />
						</div>
					</div>
				</SheetBody>
				<SheetFooter>
					<SheetCloseButton>Save Preferences</SheetCloseButton>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	{/snippet}
</Story>

<!-- From Bottom -->
<Story name="From Bottom">
	{#snippet template(args)}
		<Sheet {...args}>
			<SheetTriggerButton variant="outline">Open from Bottom</SheetTriggerButton>
			<SheetContent side="bottom">
				<SheetHeader>
					<SheetTitle>Quick Actions</SheetTitle>
					<SheetDescription>Choose an action to perform.</SheetDescription>
				</SheetHeader>
				<SheetBody>
					<div class="grid grid-cols-3 gap-4">
						<Button variant="outline" class="flex h-20 flex-col gap-1">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path
									d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"
								/>
								<circle cx="12" cy="13" r="3" />
							</svg>
							<span class="text-xs">Camera</span>
						</Button>
						<Button variant="outline" class="flex h-20 flex-col gap-1">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
								<circle cx="9" cy="9" r="2" />
								<path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
							</svg>
							<span class="text-xs">Gallery</span>
						</Button>
						<Button variant="outline" class="flex h-20 flex-col gap-1">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
								<polyline points="14 2 14 8 20 8" />
								<line x1="12" x2="12" y1="18" y2="12" />
								<line x1="9" x2="15" y1="15" y2="15" />
							</svg>
							<span class="text-xs">Document</span>
						</Button>
					</div>
				</SheetBody>
				<SheetFooter>
					<SheetCloseButton variant="outline" class="w-full">Cancel</SheetCloseButton>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	{/snippet}
</Story>

<!-- All Sides -->
<Story name="All Sides" asChild>
	<div class="flex flex-wrap gap-4">
		<Sheet>
			<SheetTriggerButton variant="outline">Right</SheetTriggerButton>
			<SheetContent side="right">
				<SheetHeader>
					<SheetTitle>Right Sheet</SheetTitle>
					<SheetDescription>Opens from the right side.</SheetDescription>
				</SheetHeader>
				<SheetFooter>
					<SheetCloseButton>Close</SheetCloseButton>
				</SheetFooter>
			</SheetContent>
		</Sheet>

		<Sheet>
			<SheetTriggerButton variant="outline">Left</SheetTriggerButton>
			<SheetContent side="left">
				<SheetHeader>
					<SheetTitle>Left Sheet</SheetTitle>
					<SheetDescription>Opens from the left side.</SheetDescription>
				</SheetHeader>
				<SheetFooter>
					<SheetCloseButton>Close</SheetCloseButton>
				</SheetFooter>
			</SheetContent>
		</Sheet>

		<Sheet>
			<SheetTriggerButton variant="outline">Top</SheetTriggerButton>
			<SheetContent side="top">
				<SheetHeader>
					<SheetTitle>Top Sheet</SheetTitle>
					<SheetDescription>Opens from the top.</SheetDescription>
				</SheetHeader>
				<SheetFooter>
					<SheetCloseButton>Close</SheetCloseButton>
				</SheetFooter>
			</SheetContent>
		</Sheet>

		<Sheet>
			<SheetTriggerButton variant="outline">Bottom</SheetTriggerButton>
			<SheetContent side="bottom">
				<SheetHeader>
					<SheetTitle>Bottom Sheet</SheetTitle>
					<SheetDescription>Opens from the bottom.</SheetDescription>
				</SheetHeader>
				<SheetFooter>
					<SheetCloseButton>Close</SheetCloseButton>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	</div>
</Story>

<!-- Settings Panel -->
<Story name="Settings Panel">
	{#snippet template(args)}
		<Sheet {...args}>
			<SheetTriggerButton>
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
			</SheetTriggerButton>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>Settings</SheetTitle>
					<SheetDescription>Manage your account settings and preferences.</SheetDescription>
				</SheetHeader>
				<SheetBody class="space-y-6">
					<div>
						<h4 class="mb-3 text-sm font-medium">Profile</h4>
						<div class="space-y-3">
							<div class="grid gap-2">
								<Label>Display Name</Label>
								<Input value="John Doe" />
							</div>
							<div class="grid gap-2">
								<Label>Email</Label>
								<Input type="email" value="john@example.com" />
							</div>
						</div>
					</div>

					<Separator />

					<div>
						<h4 class="mb-3 text-sm font-medium">Preferences</h4>
						<div class="space-y-3">
							<div class="flex items-center justify-between">
								<div>
									<p class="text-sm font-medium">Dark Mode</p>
									<p class="text-xs text-muted-foreground">Use dark theme</p>
								</div>
								<input type="checkbox" class="h-4 w-4" />
							</div>
							<div class="flex items-center justify-between">
								<div>
									<p class="text-sm font-medium">Compact Mode</p>
									<p class="text-xs text-muted-foreground">Reduce spacing</p>
								</div>
								<input type="checkbox" class="h-4 w-4" />
							</div>
						</div>
					</div>

					<Separator />

					<div>
						<h4 class="mb-3 text-sm font-medium">Notifications</h4>
						<div class="space-y-3">
							<div class="flex items-center justify-between">
								<div>
									<p class="text-sm font-medium">Email Updates</p>
									<p class="text-xs text-muted-foreground">Receive email notifications</p>
								</div>
								<input type="checkbox" checked class="h-4 w-4" />
							</div>
						</div>
					</div>
				</SheetBody>
				<SheetFooter>
					<SheetCloseButton variant="outline">Cancel</SheetCloseButton>
					<SheetCloseButton>Save Changes</SheetCloseButton>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	{/snippet}
</Story>

<!-- With Form -->
<Story name="With Form">
	{#snippet template(args)}
		<Sheet {...args}>
			<SheetTriggerButton variant="outline">Create New Project</SheetTriggerButton>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>New Project</SheetTitle>
					<SheetDescription>Create a new project by filling out the form below.</SheetDescription>
				</SheetHeader>
				<SheetBody class="space-y-4">
					<div class="grid gap-2">
						<Label>Project Name</Label>
						<Input placeholder="My Awesome Project" />
					</div>
					<div class="grid gap-2">
						<Label>Description</Label>
						<Input placeholder="A brief description of your project" />
					</div>
					<div class="grid gap-2">
						<Label>Visibility</Label>
						<div class="space-y-2">
							<label class="flex items-center gap-2">
								<input type="radio" name="visibility" checked />
								<span class="text-sm">Public</span>
							</label>
							<label class="flex items-center gap-2">
								<input type="radio" name="visibility" />
								<span class="text-sm">Private</span>
							</label>
						</div>
					</div>
				</SheetBody>
				<SheetFooter>
					<SheetCloseButton variant="outline">Cancel</SheetCloseButton>
					<SheetCloseButton>Create Project</SheetCloseButton>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	{/snippet}
</Story>

<!-- Custom Trigger -->
<Story name="Custom Trigger">
	{#snippet template(args)}
		<Sheet {...args}>
			<SheetTrigger>
				<div
					class="flex cursor-pointer items-center gap-2 rounded-lg border p-4 transition-colors hover:bg-muted"
				>
					<div class="h-10 w-10 rounded-full bg-primary/10"></div>
					<div>
						<p class="text-sm font-medium">View Profile</p>
						<p class="text-xs text-muted-foreground">Click to see details</p>
					</div>
				</div>
			</SheetTrigger>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>User Profile</SheetTitle>
					<SheetDescription>View and manage user details.</SheetDescription>
				</SheetHeader>
				<SheetBody>
					<div class="flex flex-col items-center gap-4">
						<div class="h-20 w-20 rounded-full bg-primary/10"></div>
						<div class="text-center">
							<p class="font-medium">John Doe</p>
							<p class="text-sm text-muted-foreground">john@example.com</p>
						</div>
					</div>
				</SheetBody>
				<SheetFooter>
					<SheetCloseButton>Close</SheetCloseButton>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	{/snippet}
</Story>

<!-- Playground -->
<Story name="Playground">
	{#snippet template(args)}
		<Sheet {...args}>
			<SheetTriggerButton variant="outline">Open Playground Sheet</SheetTriggerButton>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>Playground Sheet</SheetTitle>
					<SheetDescription>Use the controls to modify the sheet's behavior.</SheetDescription>
				</SheetHeader>
				<SheetBody>
					<p class="text-sm text-muted-foreground">
						Toggle the open control to see the controlled state in action. Check the "All Sides"
						story to see sheets from different directions.
					</p>
				</SheetBody>
				<SheetFooter>
					<SheetCloseButton variant="outline">Cancel</SheetCloseButton>
					<SheetCloseButton>Confirm</SheetCloseButton>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	{/snippet}
</Story>
