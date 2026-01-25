<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from './index.ts';
	import {
		Card,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader,
		CardTitle
	} from '../card/index.ts';
	import { Button } from '../button/index.ts';
	import { Input } from '../input/index.ts';
	import { Label } from '../label/index.ts';
	const { Story } = defineMeta({
		title: 'Components/Navigation/Tabs',
		component: Tabs,
		tags: ['autodocs'],
		argTypes: {
			value: {
				control: 'text',
				description: 'The currently active tab value',
				table: {
					category: 'State',
					defaultValue: { summary: '' }
				}
			},
			class: {
				control: 'text',
				description: 'Additional CSS classes to apply',
				table: {
					category: 'Appearance'
				}
			}
		},
		args: {
			value: 'account'
		}
	});
</script>

<!-- Default -->
<Story name="Default">
	{#snippet template(args)}
		<Tabs value={args.value} class="w-[400px]">
			<TabsList>
				<TabsTrigger value="account">Account</TabsTrigger>
				<TabsTrigger value="password">Password</TabsTrigger>
			</TabsList>
			<TabsContent value="account">
				<p class="text-sm text-muted-foreground">
					Make changes to your account here. Click save when you're done.
				</p>
			</TabsContent>
			<TabsContent value="password">
				<p class="text-sm text-muted-foreground">
					Change your password here. After saving, you'll be logged out.
				</p>
			</TabsContent>
		</Tabs>
	{/snippet}
</Story>

<!-- With Cards -->
<Story name="With Cards">
	{#snippet template(args)}
		<Tabs value={args.value} class="w-[400px]">
			<TabsList class="grid w-full grid-cols-2">
				<TabsTrigger value="account">Account</TabsTrigger>
				<TabsTrigger value="password">Password</TabsTrigger>
			</TabsList>
			<TabsContent value="account">
				<Card>
					<CardHeader>
						<CardTitle>Account</CardTitle>
						<CardDescription>
							Make changes to your account here. Click save when you're done.
						</CardDescription>
					</CardHeader>
					<CardContent class="space-y-2">
						<div class="space-y-1">
							<Label for="name">Name</Label>
							<Input id="name" value="Pedro Duarte" />
						</div>
						<div class="space-y-1">
							<Label for="username">Username</Label>
							<Input id="username" value="@peduarte" />
						</div>
					</CardContent>
					<CardFooter>
						<Button>Save changes</Button>
					</CardFooter>
				</Card>
			</TabsContent>
			<TabsContent value="password">
				<Card>
					<CardHeader>
						<CardTitle>Password</CardTitle>
						<CardDescription>
							Change your password here. After saving, you'll be logged out.
						</CardDescription>
					</CardHeader>
					<CardContent class="space-y-2">
						<div class="space-y-1">
							<Label for="current">Current password</Label>
							<Input id="current" type="password" />
						</div>
						<div class="space-y-1">
							<Label for="new">New password</Label>
							<Input id="new" type="password" />
						</div>
					</CardContent>
					<CardFooter>
						<Button>Save password</Button>
					</CardFooter>
				</Card>
			</TabsContent>
		</Tabs>
	{/snippet}
</Story>

<!-- Multiple Tabs -->
<Story name="Multiple Tabs" args={{ value: 'overview' }}>
	{#snippet template(args)}
		<Tabs value={args.value} class="w-[500px]">
			<TabsList>
				<TabsTrigger value="overview">Overview</TabsTrigger>
				<TabsTrigger value="analytics">Analytics</TabsTrigger>
				<TabsTrigger value="reports">Reports</TabsTrigger>
				<TabsTrigger value="notifications">Notifications</TabsTrigger>
			</TabsList>
			<TabsContent value="overview" class="p-4">
				<h3 class="text-lg font-medium">Overview</h3>
				<p class="mt-2 text-sm text-muted-foreground">
					Get a high-level summary of your account activity and recent changes.
				</p>
			</TabsContent>
			<TabsContent value="analytics" class="p-4">
				<h3 class="text-lg font-medium">Analytics</h3>
				<p class="mt-2 text-sm text-muted-foreground">
					View detailed analytics and performance metrics for your account.
				</p>
			</TabsContent>
			<TabsContent value="reports" class="p-4">
				<h3 class="text-lg font-medium">Reports</h3>
				<p class="mt-2 text-sm text-muted-foreground">
					Generate and download custom reports based on your data.
				</p>
			</TabsContent>
			<TabsContent value="notifications" class="p-4">
				<h3 class="text-lg font-medium">Notifications</h3>
				<p class="mt-2 text-sm text-muted-foreground">
					Manage your notification preferences and alert settings.
				</p>
			</TabsContent>
		</Tabs>
	{/snippet}
</Story>

<!-- With Icons -->
<Story name="With Icons" args={{ value: 'music' }}>
	{#snippet template(args)}
		<Tabs value={args.value} class="w-[400px]">
			<TabsList>
				<TabsTrigger value="music">
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
						><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle
							cx="18"
							cy="16"
							r="3"
						/></svg
					>
					Music
				</TabsTrigger>
				<TabsTrigger value="podcasts">
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
						><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path
							d="M19 10v2a7 7 0 0 1-14 0v-2"
						/><line x1="12" x2="12" y1="19" y2="22" /></svg
					>
					Podcasts
				</TabsTrigger>
				<TabsTrigger value="live">
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
						><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle
							cx="12"
							cy="12"
							r="3"
						/></svg
					>
					Live
				</TabsTrigger>
			</TabsList>
			<TabsContent value="music" class="p-4">
				<p class="text-sm text-muted-foreground">Browse and play your favorite music.</p>
			</TabsContent>
			<TabsContent value="podcasts" class="p-4">
				<p class="text-sm text-muted-foreground">Discover new podcasts and episodes.</p>
			</TabsContent>
			<TabsContent value="live" class="p-4">
				<p class="text-sm text-muted-foreground">Watch live streams and events.</p>
			</TabsContent>
		</Tabs>
	{/snippet}
</Story>

<!-- Disabled Tab -->
<Story name="With Disabled Tab" args={{ value: 'active' }}>
	{#snippet template(args)}
		<Tabs value={args.value} class="w-[400px]">
			<TabsList>
				<TabsTrigger value="active">Active</TabsTrigger>
				<TabsTrigger value="disabled" disabled>Disabled</TabsTrigger>
				<TabsTrigger value="another">Another</TabsTrigger>
			</TabsList>
			<TabsContent value="active" class="p-4">
				<p class="text-sm text-muted-foreground">This tab is active and clickable.</p>
			</TabsContent>
			<TabsContent value="disabled" class="p-4">
				<p class="text-sm text-muted-foreground">You shouldn't see this content.</p>
			</TabsContent>
			<TabsContent value="another" class="p-4">
				<p class="text-sm text-muted-foreground">Another active tab content.</p>
			</TabsContent>
		</Tabs>
	{/snippet}
</Story>

<!-- Full Width -->
<Story name="Full Width" args={{ value: 'tab1' }}>
	{#snippet template(args)}
		<Tabs value={args.value} class="w-full max-w-[600px]">
			<TabsList class="w-full">
				<TabsTrigger value="tab1" class="flex-1">Tab One</TabsTrigger>
				<TabsTrigger value="tab2" class="flex-1">Tab Two</TabsTrigger>
				<TabsTrigger value="tab3" class="flex-1">Tab Three</TabsTrigger>
			</TabsList>
			<TabsContent value="tab1" class="mt-2 rounded-lg border p-4">
				<p class="text-sm">Content for the first tab spanning the full width.</p>
			</TabsContent>
			<TabsContent value="tab2" class="mt-2 rounded-lg border p-4">
				<p class="text-sm">Content for the second tab spanning the full width.</p>
			</TabsContent>
			<TabsContent value="tab3" class="mt-2 rounded-lg border p-4">
				<p class="text-sm">Content for the third tab spanning the full width.</p>
			</TabsContent>
		</Tabs>
	{/snippet}
</Story>

<!-- Playground -->
<Story name="Playground">
	{#snippet template(args)}
		<Tabs value={args.value} class="w-[400px]">
			<TabsList>
				<TabsTrigger value="account">Account</TabsTrigger>
				<TabsTrigger value="password">Password</TabsTrigger>
				<TabsTrigger value="settings">Settings</TabsTrigger>
			</TabsList>
			<TabsContent value="account" class="p-4">
				<p class="text-sm text-muted-foreground">Account settings content.</p>
			</TabsContent>
			<TabsContent value="password" class="p-4">
				<p class="text-sm text-muted-foreground">Password settings content.</p>
			</TabsContent>
			<TabsContent value="settings" class="p-4">
				<p class="text-sm text-muted-foreground">General settings content.</p>
			</TabsContent>
		</Tabs>
	{/snippet}
</Story>
