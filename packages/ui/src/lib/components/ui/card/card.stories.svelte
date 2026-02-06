<script module lang="ts">
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import {
		Card,
		CardHeader,
		CardTitle,
		CardDescription,
		CardContent,
		CardFooter,
		CardAction,
	} from "./index.ts";
	import { Button } from "../button/index.ts";
	import { Input } from "../input/index.ts";
	import { Label } from "../label/index.ts";
	import { Badge } from "../badge/index.ts";

	const { Story } = defineMeta({
		title: "Components/Layout/Card",
		component: Card,
		tags: ["autodocs"],
		argTypes: {
			class: {
				control: "text",
				description: "Additional CSS classes to apply",
				table: {
					category: "Appearance",
				},
			},
		},
		args: {
			class: "w-[350px]",
		},
	});
</script>

<!-- Default -->
<Story name="Default" args={{ class: "w-[350px]" }}>
	{#snippet template(args)}
		<Card class={args.class}>
			<CardHeader>
				<CardTitle>Card Title</CardTitle>
				<CardDescription>Card description goes here.</CardDescription>
			</CardHeader>
			<CardContent>
				<p>Card content area.</p>
			</CardContent>
		</Card>
	{/snippet}
</Story>

<!-- With Footer -->
<Story name="With Footer" args={{ class: "w-[350px]" }}>
	{#snippet template(args)}
		<Card class={args.class}>
			<CardHeader>
				<CardTitle>Account Settings</CardTitle>
				<CardDescription>Manage your account preferences.</CardDescription>
			</CardHeader>
			<CardContent>
				<p>Your account is currently active and in good standing.</p>
			</CardContent>
			<CardFooter class="flex justify-between">
				<Button variant="outline">Cancel</Button>
				<Button>Save Changes</Button>
			</CardFooter>
		</Card>
	{/snippet}
</Story>

<!-- With Action -->
<Story name="With Action" args={{ class: "w-[350px]" }}>
	{#snippet template(args)}
		<Card class={args.class}>
			<CardHeader>
				<CardTitle>Notifications</CardTitle>
				<CardDescription>You have 3 unread messages.</CardDescription>
				<CardAction>
					<Badge variant="primary">New</Badge>
				</CardAction>
			</CardHeader>
			<CardContent>
				<p>Check your inbox for the latest updates.</p>
			</CardContent>
		</Card>
	{/snippet}
</Story>

<!-- Login Form -->
<Story name="Login Form" args={{ class: "w-[350px]" }}>
	{#snippet template(args)}
		<Card class={args.class}>
			<CardHeader>
				<CardTitle>Login</CardTitle>
				<CardDescription>Enter your credentials to access your account.</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="space-y-2">
					<Label for="email">Email</Label>
					<Input id="email" type="email" placeholder="name@example.com" />
				</div>
				<div class="space-y-2">
					<Label for="password">Password</Label>
					<Input id="password" type="password" />
				</div>
			</CardContent>
			<CardFooter>
				<Button class="w-full">Sign In</Button>
			</CardFooter>
		</Card>
	{/snippet}
</Story>

<!-- Payment Method -->
<Story name="Payment Method" args={{ class: "w-[400px]" }}>
	{#snippet template(args)}
		<Card class={args.class}>
			<CardHeader>
				<CardTitle>Payment Method</CardTitle>
				<CardDescription>Add a new payment method to your account.</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="space-y-2">
					<Label for="card-name">Name on Card</Label>
					<Input id="card-name" placeholder="John Doe" />
				</div>
				<div class="space-y-2">
					<Label for="card-number">Card Number</Label>
					<Input id="card-number" placeholder="4242 4242 4242 4242" />
				</div>
				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="expiry">Expiry</Label>
						<Input id="expiry" placeholder="MM/YY" />
					</div>
					<div class="space-y-2">
						<Label for="cvc">CVC</Label>
						<Input id="cvc" placeholder="123" />
					</div>
				</div>
			</CardContent>
			<CardFooter>
				<Button class="w-full">Add Card</Button>
			</CardFooter>
		</Card>
	{/snippet}
</Story>

<!-- Stats Card -->
<Story name="Stats Card" args={{ class: "w-[200px]" }}>
	{#snippet template(args)}
		<div class="flex gap-4">
			<Card class={args.class}>
				<CardHeader>
					<CardDescription>Total Revenue</CardDescription>
					<CardTitle class="text-2xl">$45,231.89</CardTitle>
				</CardHeader>
				<CardContent>
					<p class="text-xs text-muted-foreground">+20.1% from last month</p>
				</CardContent>
			</Card>
			<Card class={args.class}>
				<CardHeader>
					<CardDescription>Subscriptions</CardDescription>
					<CardTitle class="text-2xl">+2,350</CardTitle>
				</CardHeader>
				<CardContent>
					<p class="text-xs text-muted-foreground">+180.1% from last month</p>
				</CardContent>
			</Card>
			<Card class={args.class}>
				<CardHeader>
					<CardDescription>Active Users</CardDescription>
					<CardTitle class="text-2xl">+12,234</CardTitle>
				</CardHeader>
				<CardContent>
					<p class="text-xs text-muted-foreground">+19% from last month</p>
				</CardContent>
			</Card>
		</div>
	{/snippet}
</Story>

<!-- Bordered Sections -->
<Story name="Bordered Sections" args={{ class: "w-[350px]" }}>
	{#snippet template(args)}
		<Card class={args.class}>
			<CardHeader class="border-b">
				<CardTitle>Project Details</CardTitle>
				<CardDescription>Overview of your current project.</CardDescription>
			</CardHeader>
			<CardContent class="pt-6">
				<div class="space-y-2">
					<div class="flex justify-between">
						<span class="text-muted-foreground">Status</span>
						<Badge variant="success">Active</Badge>
					</div>
					<div class="flex justify-between">
						<span class="text-muted-foreground">Team Members</span>
						<span>12</span>
					</div>
					<div class="flex justify-between">
						<span class="text-muted-foreground">Progress</span>
						<span>75%</span>
					</div>
				</div>
			</CardContent>
			<CardFooter class="border-t pt-6">
				<Button variant="outline" class="w-full">View Project</Button>
			</CardFooter>
		</Card>
	{/snippet}
</Story>

<!-- Playground -->
<Story name="Playground">
	{#snippet template(args)}
		<Card class={args.class}>
			<CardHeader>
				<CardTitle>Playground Card</CardTitle>
				<CardDescription>Experiment with the card component.</CardDescription>
			</CardHeader>
			<CardContent>
				<p>This is a playground card for testing.</p>
			</CardContent>
			<CardFooter>
				<Button>Action</Button>
			</CardFooter>
		</Card>
	{/snippet}
</Story>
