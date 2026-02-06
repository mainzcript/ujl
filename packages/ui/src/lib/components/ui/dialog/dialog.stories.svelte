<script module lang="ts">
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import {
		Dialog,
		DialogContent,
		DialogHeader,
		DialogBody,
		DialogFooter,
		DialogTitle,
		DialogDescription,
		DialogTrigger,
		DialogTriggerButton,
		DialogCloseButton,
	} from "./index.ts";
	import { Button } from "../button/index.ts";
	import { Input } from "../input/index.ts";
	import { Label } from "../label/index.ts";

	const { Story } = defineMeta({
		title: "Components/Overlays/Dialog",
		component: Dialog,
		tags: ["autodocs"],
		argTypes: {
			open: {
				control: "boolean",
				description: "Whether the dialog is open",
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
		<Dialog open={args.open}>
			<DialogTriggerButton variant="outline">Open Dialog</DialogTriggerButton>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Dialog Title</DialogTitle>
					<DialogDescription>
						This is a description of the dialog. It provides context about the content.
					</DialogDescription>
				</DialogHeader>
				<DialogBody>
					<p class="text-sm text-muted-foreground">
						This is the main content area of the dialog. You can put any content here.
					</p>
				</DialogBody>
				<DialogFooter>
					<DialogCloseButton variant="outline">Cancel</DialogCloseButton>
					<DialogCloseButton>Continue</DialogCloseButton>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	{/snippet}
</Story>

<!-- Alert Dialog -->
<Story name="Alert Dialog">
	{#snippet template()}
		<Dialog>
			<DialogTriggerButton variant="destructive">Delete Account</DialogTriggerButton>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Are you absolutely sure?</DialogTitle>
					<DialogDescription>
						This action cannot be undone. This will permanently delete your account and remove your
						data from our servers.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<DialogCloseButton variant="outline">Cancel</DialogCloseButton>
					<DialogCloseButton variant="destructive">Delete Account</DialogCloseButton>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	{/snippet}
</Story>

<!-- Form Dialog -->
<Story name="Form Dialog">
	{#snippet template(args)}
		<Dialog open={args.open}>
			<DialogTriggerButton>Edit Profile</DialogTriggerButton>
			<DialogContent class="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Edit Profile</DialogTitle>
					<DialogDescription>
						Make changes to your profile here. Click save when you're done.
					</DialogDescription>
				</DialogHeader>
				<DialogBody class="grid gap-4 py-4">
					<div class="grid grid-cols-4 items-center gap-4">
						<Label class="text-right">Name</Label>
						<Input value="John Doe" class="col-span-3" />
					</div>
					<div class="grid grid-cols-4 items-center gap-4">
						<Label class="text-right">Username</Label>
						<Input value="@johndoe" class="col-span-3" />
					</div>
					<div class="grid grid-cols-4 items-center gap-4">
						<Label class="text-right">Email</Label>
						<Input type="email" value="john@example.com" class="col-span-3" />
					</div>
				</DialogBody>
				<DialogFooter>
					<DialogCloseButton variant="outline">Cancel</DialogCloseButton>
					<DialogCloseButton>Save Changes</DialogCloseButton>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	{/snippet}
</Story>

<!-- Long Content (Scrollable) -->
<Story name="Long Content">
	{#snippet template(args)}
		<Dialog open={args.open}>
			<DialogTriggerButton variant="outline">Terms of Service</DialogTriggerButton>
			<DialogContent class="max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Terms of Service</DialogTitle>
					<DialogDescription>Please read and accept our terms of service.</DialogDescription>
				</DialogHeader>
				<DialogBody class="space-y-4">
					<h4 class="font-medium">1. Introduction</h4>
					<p class="text-sm text-muted-foreground">
						Welcome to our platform. By using our services, you agree to be bound by these Terms of
						Service and our Privacy Policy. Please read them carefully before using our services.
					</p>
					<h4 class="font-medium">2. User Accounts</h4>
					<p class="text-sm text-muted-foreground">
						When you create an account with us, you must provide accurate, complete, and current
						information. Failure to do so constitutes a breach of the Terms, which may result in
						immediate termination of your account.
					</p>
					<h4 class="font-medium">3. Privacy</h4>
					<p class="text-sm text-muted-foreground">
						Your privacy is important to us. Our Privacy Policy explains how we collect, use, and
						protect your personal information. By using our services, you consent to our collection
						and use of data as described in our Privacy Policy.
					</p>
					<h4 class="font-medium">4. Intellectual Property</h4>
					<p class="text-sm text-muted-foreground">
						The platform and its original content, features, and functionality are owned by us and
						are protected by international copyright, trademark, patent, trade secret, and other
						intellectual property laws.
					</p>
					<h4 class="font-medium">5. Limitation of Liability</h4>
					<p class="text-sm text-muted-foreground">
						In no event shall we be liable for any indirect, incidental, special, consequential, or
						punitive damages, including without limitation, loss of profits, data, use, goodwill, or
						other intangible losses.
					</p>
					<h4 class="font-medium">6. Changes to Terms</h4>
					<p class="text-sm text-muted-foreground">
						We reserve the right, at our sole discretion, to modify or replace these Terms at any
						time. We will provide notice of any significant changes by posting the new Terms on this
						page.
					</p>
				</DialogBody>
				<DialogFooter>
					<DialogCloseButton variant="outline">Decline</DialogCloseButton>
					<DialogCloseButton>Accept</DialogCloseButton>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	{/snippet}
</Story>

<!-- Without Close Button -->
<Story name="Without Close Button">
	{#snippet template(args)}
		<Dialog open={args.open}>
			<DialogTriggerButton variant="outline">Open Clean Dialog</DialogTriggerButton>
			<DialogContent showCloseButton={false}>
				<DialogHeader>
					<DialogTitle>Clean Dialog</DialogTitle>
					<DialogDescription>
						This dialog doesn't have an X button in the corner. Use the buttons below to close it.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<DialogCloseButton variant="outline">Close</DialogCloseButton>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	{/snippet}
</Story>

<!-- Custom Trigger -->
<Story name="Custom Trigger">
	{#snippet template(args)}
		<Dialog open={args.open}>
			<DialogTrigger>
				<span
					class="cursor-pointer text-sm text-primary underline underline-offset-4 hover:text-primary/80"
				>
					Click here to open dialog
				</span>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Custom Trigger</DialogTitle>
					<DialogDescription>
						You can use any element as a trigger for the dialog, not just buttons.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<DialogCloseButton>Got it</DialogCloseButton>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	{/snippet}
</Story>

<!-- Login Dialog -->
<Story name="Login Dialog">
	{#snippet template(args)}
		<Dialog open={args.open}>
			<DialogTriggerButton>Sign In</DialogTriggerButton>
			<DialogContent class="sm:max-w-[400px]">
				<DialogHeader>
					<DialogTitle>Welcome back</DialogTitle>
					<DialogDescription>Sign in to your account to continue.</DialogDescription>
				</DialogHeader>
				<DialogBody class="grid gap-4 py-4">
					<div class="grid gap-2">
						<Label>Email</Label>
						<Input type="email" placeholder="name@example.com" />
					</div>
					<div class="grid gap-2">
						<Label>Password</Label>
						<Input type="password" placeholder="Enter your password" />
					</div>
					<div class="flex items-center justify-between">
						<label class="flex items-center gap-2 text-sm">
							<input type="checkbox" class="rounded" />
							Remember me
						</label>
						<span class="cursor-pointer text-sm text-primary hover:underline">
							Forgot password?
						</span>
					</div>
				</DialogBody>
				<DialogFooter class="flex-col gap-2 sm:flex-col">
					<Button class="w-full">Sign In</Button>
					<p class="text-center text-sm text-muted-foreground">
						Don't have an account?
						<span class="cursor-pointer text-primary hover:underline">Sign up</span>
					</p>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	{/snippet}
</Story>

<!-- Playground -->
<Story name="Playground">
	{#snippet template(args)}
		<Dialog open={args.open}>
			<DialogTriggerButton variant="outline">Open Playground Dialog</DialogTriggerButton>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Playground Dialog</DialogTitle>
					<DialogDescription>Use the controls to modify the dialog's behavior.</DialogDescription>
				</DialogHeader>
				<DialogBody>
					<p class="text-sm text-muted-foreground">
						Toggle the controls on the right to see how the dialog responds to different settings.
					</p>
				</DialogBody>
				<DialogFooter>
					<DialogCloseButton variant="outline">Cancel</DialogCloseButton>
					<DialogCloseButton>Confirm</DialogCloseButton>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	{/snippet}
</Story>
