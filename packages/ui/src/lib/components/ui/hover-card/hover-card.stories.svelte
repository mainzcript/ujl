<script module lang="ts">
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import { HoverCard, HoverCardContent, HoverCardTrigger } from "./index.ts";
	import { Button } from "../button/index.ts";

	const { Story } = defineMeta({
		title: "Components/Overlays/HoverCard",
		component: HoverCard,
		tags: ["autodocs"],
		argTypes: {
			openDelay: {
				control: { type: "number" },
				description: "The delay in milliseconds before the hover card opens",
				table: {
					category: "Behavior",
					defaultValue: { summary: "700" },
				},
			},
			closeDelay: {
				control: { type: "number" },
				description: "The delay in milliseconds before the hover card closes",
				table: {
					category: "Behavior",
					defaultValue: { summary: "300" },
				},
			},
		},
		args: {
			openDelay: 200,
			closeDelay: 300,
		},
	});
</script>

<!-- Default -->
<Story name="Default">
	{#snippet template(args)}
		<HoverCard {...args}>
			<HoverCardTrigger>
				<span
					class="cursor-pointer text-sm text-primary underline decoration-dotted underline-offset-4"
				>
					@nextjs
				</span>
			</HoverCardTrigger>
			<HoverCardContent class="w-80">
				<div class="flex justify-between space-x-4">
					<div class="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
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
								d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
							/>
						</svg>
					</div>
					<div class="flex-1 space-y-1">
						<h4 class="text-sm font-semibold">@nextjs</h4>
						<p class="text-sm text-muted-foreground">
							The React Framework – created and maintained by @vercel.
						</p>
						<div class="flex items-center pt-2">
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
								class="mr-2 text-muted-foreground"
							>
								<rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
								<line x1="16" x2="16" y1="2" y2="6" />
								<line x1="8" x2="8" y1="2" y2="6" />
								<line x1="3" x2="21" y1="10" y2="10" />
							</svg>
							<span class="text-xs text-muted-foreground">Joined December 2021</span>
						</div>
					</div>
				</div>
			</HoverCardContent>
		</HoverCard>
	{/snippet}
</Story>

<!-- User Profile -->
<Story name="User Profile">
	{#snippet template(args)}
		<div class="flex items-center gap-2">
			<span class="text-sm">Created by</span>
			<HoverCard {...args}>
				<HoverCardTrigger>
					<Button class="h-auto p-0 text-primary">John Doe</Button>
				</HoverCardTrigger>
				<HoverCardContent class="w-80">
					<div class="flex gap-4">
						<div
							class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-medium"
						>
							JD
						</div>
						<div class="flex-1 space-y-1">
							<h4 class="text-sm font-semibold">John Doe</h4>
							<p class="text-xs text-muted-foreground">@johndoe</p>
							<p class="text-sm text-muted-foreground">
								Senior Software Engineer at Example Corp. Building tools that make developers' lives
								easier.
							</p>
							<div class="flex items-center gap-4 pt-2 text-xs text-muted-foreground">
								<span><strong class="text-foreground">1,234</strong> Following</span>
								<span><strong class="text-foreground">5,678</strong> Followers</span>
							</div>
						</div>
					</div>
				</HoverCardContent>
			</HoverCard>
		</div>
	{/snippet}
</Story>

<!-- Link Preview -->
<Story name="Link Preview">
	{#snippet template(args)}
		<p class="max-w-md text-sm">
			Check out the documentation at
			<HoverCard {...args}>
				<HoverCardTrigger>
					<span
						role="link"
						tabindex="0"
						class="cursor-pointer text-primary underline underline-offset-4 hover:text-primary/80"
					>
						docs.example.com
					</span>
				</HoverCardTrigger>
				<HoverCardContent class="w-80">
					<div class="space-y-2">
						<div
							class="flex h-32 items-center justify-center rounded bg-gradient-to-br from-primary/20 to-primary/5"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="40"
								height="40"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								class="text-primary/40"
							>
								<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
							</svg>
						</div>
						<div>
							<h4 class="text-sm font-semibold">Documentation</h4>
							<p class="text-xs text-muted-foreground">docs.example.com</p>
						</div>
						<p class="text-sm text-muted-foreground">
							Comprehensive guides and API references to help you build amazing applications.
						</p>
					</div>
				</HoverCardContent>
			</HoverCard>
			for more information.
		</p>
	{/snippet}
</Story>

<!-- Product Card -->
<Story name="Product Card">
	{#snippet template(args)}
		<div class="flex items-center gap-2">
			<span class="text-sm">Available in</span>
			<HoverCard {...args}>
				<HoverCardTrigger>
					<span class="cursor-pointer font-medium text-primary underline-offset-4 hover:underline">
						Pro Plan
					</span>
				</HoverCardTrigger>
				<HoverCardContent class="w-72">
					<div class="space-y-3">
						<div class="flex items-center justify-between">
							<h4 class="text-sm font-semibold">Pro Plan</h4>
							<span class="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
								Popular
							</span>
						</div>
						<div class="flex items-baseline gap-1">
							<span class="text-2xl font-bold">$29</span>
							<span class="text-sm text-muted-foreground">/month</span>
						</div>
						<ul class="space-y-2 text-sm text-muted-foreground">
							<li class="flex items-center gap-2">
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
									class="text-green-500"
								>
									<polyline points="20 6 9 17 4 12" />
								</svg>
								Unlimited projects
							</li>
							<li class="flex items-center gap-2">
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
									class="text-green-500"
								>
									<polyline points="20 6 9 17 4 12" />
								</svg>
								Priority support
							</li>
							<li class="flex items-center gap-2">
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
									class="text-green-500"
								>
									<polyline points="20 6 9 17 4 12" />
								</svg>
								Advanced analytics
							</li>
						</ul>
						<Button size="sm" class="w-full">Upgrade to Pro</Button>
					</div>
				</HoverCardContent>
			</HoverCard>
		</div>
	{/snippet}
</Story>

<!-- Team Member -->
<Story name="Team Member">
	{#snippet template()}
		<div class="flex -space-x-2">
			<HoverCard openDelay={200}>
				<HoverCardTrigger>
					<div
						class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-red-500 text-sm font-medium text-white ring-2 ring-background"
					>
						AS
					</div>
				</HoverCardTrigger>
				<HoverCardContent class="w-64">
					<div class="flex gap-3">
						<div
							class="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-sm font-medium text-white"
						>
							AS
						</div>
						<div class="space-y-1">
							<h4 class="text-sm font-semibold">Alice Smith</h4>
							<p class="text-xs text-muted-foreground">Product Designer</p>
							<p class="text-xs text-muted-foreground">alice@example.com</p>
						</div>
					</div>
				</HoverCardContent>
			</HoverCard>

			<HoverCard openDelay={200}>
				<HoverCardTrigger>
					<div
						class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-blue-500 text-sm font-medium text-white ring-2 ring-background"
					>
						BJ
					</div>
				</HoverCardTrigger>
				<HoverCardContent class="w-64">
					<div class="flex gap-3">
						<div
							class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-sm font-medium text-white"
						>
							BJ
						</div>
						<div class="space-y-1">
							<h4 class="text-sm font-semibold">Bob Johnson</h4>
							<p class="text-xs text-muted-foreground">Frontend Developer</p>
							<p class="text-xs text-muted-foreground">bob@example.com</p>
						</div>
					</div>
				</HoverCardContent>
			</HoverCard>

			<HoverCard openDelay={200}>
				<HoverCardTrigger>
					<div
						class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-green-500 text-sm font-medium text-white ring-2 ring-background"
					>
						CW
					</div>
				</HoverCardTrigger>
				<HoverCardContent class="w-64">
					<div class="flex gap-3">
						<div
							class="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-sm font-medium text-white"
						>
							CW
						</div>
						<div class="space-y-1">
							<h4 class="text-sm font-semibold">Carol Williams</h4>
							<p class="text-xs text-muted-foreground">Backend Developer</p>
							<p class="text-xs text-muted-foreground">carol@example.com</p>
						</div>
					</div>
				</HoverCardContent>
			</HoverCard>
		</div>
	{/snippet}
</Story>

<!-- Positions -->
<Story name="Positions" asChild>
	<div class="flex flex-wrap items-center justify-center gap-12 p-12">
		<HoverCard openDelay={0}>
			<HoverCardTrigger>
				<Button variant="outline">Top</Button>
			</HoverCardTrigger>
			<HoverCardContent side="top" class="w-48">
				<p class="text-sm">Hover card on top</p>
			</HoverCardContent>
		</HoverCard>

		<HoverCard openDelay={0}>
			<HoverCardTrigger>
				<Button variant="outline">Right</Button>
			</HoverCardTrigger>
			<HoverCardContent side="right" class="w-48">
				<p class="text-sm">Hover card on right</p>
			</HoverCardContent>
		</HoverCard>

		<HoverCard openDelay={0}>
			<HoverCardTrigger>
				<Button variant="outline">Bottom</Button>
			</HoverCardTrigger>
			<HoverCardContent side="bottom" class="w-48">
				<p class="text-sm">Hover card on bottom</p>
			</HoverCardContent>
		</HoverCard>

		<HoverCard openDelay={0}>
			<HoverCardTrigger>
				<Button variant="outline">Left</Button>
			</HoverCardTrigger>
			<HoverCardContent side="left" class="w-48">
				<p class="text-sm">Hover card on left</p>
			</HoverCardContent>
		</HoverCard>
	</div>
</Story>

<!-- With Stats -->
<Story name="Repository Info">
	{#snippet template(args)}
		<p class="text-sm">
			Check out
			<HoverCard {...args}>
				<HoverCardTrigger>
					<span
						role="link"
						tabindex="0"
						class="cursor-pointer font-medium text-primary hover:underline">sveltejs/svelte</span
					>
				</HoverCardTrigger>
				<HoverCardContent class="w-80">
					<div class="space-y-3">
						<div class="flex items-start gap-3">
							<div class="flex h-10 w-10 items-center justify-center rounded bg-orange-500/10">
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
									class="text-orange-500"
								>
									<path
										d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
									/>
								</svg>
							</div>
							<div class="flex-1">
								<h4 class="text-sm font-semibold">sveltejs/svelte</h4>
								<p class="text-xs text-muted-foreground">Cybernetically enhanced web apps</p>
							</div>
						</div>
						<p class="text-sm text-muted-foreground">
							Svelte is a radical new approach to building user interfaces. Whereas traditional
							frameworks do the bulk of their work in the browser, Svelte shifts that work into a
							compile step.
						</p>
						<div class="flex items-center gap-4 text-xs text-muted-foreground">
							<span class="flex items-center gap-1">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="12"
									height="12"
									viewBox="0 0 24 24"
									fill="currentColor"
									class="text-yellow-500"
								>
									<polygon
										points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
									/>
								</svg>
								75.2k
							</span>
							<span class="flex items-center gap-1">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="12"
									height="12"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<line x1="6" x2="6" y1="3" y2="15" />
									<circle cx="18" cy="6" r="3" />
									<circle cx="6" cy="18" r="3" />
									<path d="M18 9a9 9 0 0 1-9 9" />
								</svg>
								3.8k forks
							</span>
							<span class="flex items-center gap-1">
								<span class="h-2 w-2 rounded-full bg-orange-500"></span>
								Svelte
							</span>
						</div>
					</div>
				</HoverCardContent>
			</HoverCard>
			for more details.
		</p>
	{/snippet}
</Story>

<!-- Playground -->
<Story name="Playground">
	{#snippet template(args)}
		<div class="flex items-center justify-center p-20">
			<HoverCard {...args}>
				<HoverCardTrigger>
					<Button variant="outline">Hover Me</Button>
				</HoverCardTrigger>
				<HoverCardContent class="w-64">
					<div class="space-y-2">
						<h4 class="text-sm font-semibold">Playground</h4>
						<p class="text-sm text-muted-foreground">
							Adjust openDelay and closeDelay to control timing. Check the "Positions" story for
							placement options.
						</p>
					</div>
				</HoverCardContent>
			</HoverCard>
		</div>
	{/snippet}
</Story>
