<script module lang="ts">
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import { ResizablePaneGroup, ResizablePane, ResizableHandle } from "./index.ts";

	const { Story } = defineMeta({
		title: "Components/Layout/Resizable",
		component: ResizablePaneGroup,
		tags: ["autodocs"],
		argTypes: {
			direction: {
				control: { type: "select" },
				options: ["horizontal", "vertical"],
				description: "The direction of the resizable panes",
				table: {
					category: "Behavior",
					defaultValue: { summary: "horizontal" },
				},
			},
		},
		args: {
			direction: "horizontal",
		},
	});
</script>

<!-- Default -->
<Story name="Default" args={{ direction: "horizontal" }}>
	{#snippet template(args)}
		<ResizablePaneGroup {...args} class="min-h-[200px] max-w-md rounded-lg border">
			<ResizablePane defaultSize={50}>
				<div class="flex h-full items-center justify-center p-6">
					<span class="font-semibold">Panel One</span>
				</div>
			</ResizablePane>
			<ResizableHandle />
			<ResizablePane defaultSize={50}>
				<div class="flex h-full items-center justify-center p-6">
					<span class="font-semibold">Panel Two</span>
				</div>
			</ResizablePane>
		</ResizablePaneGroup>
	{/snippet}
</Story>

<!-- With Handle -->
<Story name="With Handle" args={{ direction: "horizontal" }}>
	{#snippet template(args)}
		<ResizablePaneGroup {...args} class="min-h-[200px] max-w-md rounded-lg border">
			<ResizablePane defaultSize={50}>
				<div class="flex h-full items-center justify-center p-6">
					<span class="font-semibold">Panel One</span>
				</div>
			</ResizablePane>
			<ResizableHandle withHandle />
			<ResizablePane defaultSize={50}>
				<div class="flex h-full items-center justify-center p-6">
					<span class="font-semibold">Panel Two</span>
				</div>
			</ResizablePane>
		</ResizablePaneGroup>
	{/snippet}
</Story>

<!-- Vertical -->
<Story name="Vertical" args={{ direction: "vertical" }}>
	{#snippet template(args)}
		<ResizablePaneGroup {...args} class="min-h-[300px] max-w-md rounded-lg border">
			<ResizablePane defaultSize={30}>
				<div class="flex h-full items-center justify-center p-6">
					<span class="font-semibold">Header</span>
				</div>
			</ResizablePane>
			<ResizableHandle withHandle />
			<ResizablePane defaultSize={70}>
				<div class="flex h-full items-center justify-center p-6">
					<span class="font-semibold">Content</span>
				</div>
			</ResizablePane>
		</ResizablePaneGroup>
	{/snippet}
</Story>

<!-- Three Panes -->
<Story name="Three Panes" args={{ direction: "horizontal" }}>
	{#snippet template(args)}
		<ResizablePaneGroup {...args} class="min-h-[200px] max-w-2xl rounded-lg border">
			<ResizablePane defaultSize={25}>
				<div class="flex h-full items-center justify-center p-6">
					<span class="font-semibold">Sidebar</span>
				</div>
			</ResizablePane>
			<ResizableHandle withHandle />
			<ResizablePane defaultSize={50}>
				<div class="flex h-full items-center justify-center p-6">
					<span class="font-semibold">Main Content</span>
				</div>
			</ResizablePane>
			<ResizableHandle withHandle />
			<ResizablePane defaultSize={25}>
				<div class="flex h-full items-center justify-center p-6">
					<span class="font-semibold">Details</span>
				</div>
			</ResizablePane>
		</ResizablePaneGroup>
	{/snippet}
</Story>

<!-- Nested Layout -->
<Story name="Nested Layout" args={{ direction: "horizontal" }}>
	{#snippet template(args)}
		<ResizablePaneGroup {...args} class="min-h-[400px] max-w-2xl rounded-lg border">
			<ResizablePane defaultSize={25}>
				<div class="flex h-full items-center justify-center p-6">
					<span class="font-semibold">Sidebar</span>
				</div>
			</ResizablePane>
			<ResizableHandle withHandle />
			<ResizablePane defaultSize={75}>
				<ResizablePaneGroup direction="vertical">
					<ResizablePane defaultSize={70}>
						<div class="flex h-full items-center justify-center p-6">
							<span class="font-semibold">Main Content</span>
						</div>
					</ResizablePane>
					<ResizableHandle withHandle />
					<ResizablePane defaultSize={30}>
						<div class="flex h-full items-center justify-center p-6">
							<span class="font-semibold">Console</span>
						</div>
					</ResizablePane>
				</ResizablePaneGroup>
			</ResizablePane>
		</ResizablePaneGroup>
	{/snippet}
</Story>

<!-- With Min/Max Size -->
<Story name="With Min Max Size" args={{ direction: "horizontal" }}>
	{#snippet template(args)}
		<ResizablePaneGroup {...args} class="min-h-[200px] max-w-md rounded-lg border">
			<ResizablePane defaultSize={50} minSize={20} maxSize={80}>
				<div class="flex h-full flex-col items-center justify-center p-6">
					<span class="font-semibold">Panel One</span>
					<span class="text-xs text-muted-foreground">min: 20%, max: 80%</span>
				</div>
			</ResizablePane>
			<ResizableHandle withHandle />
			<ResizablePane defaultSize={50}>
				<div class="flex h-full items-center justify-center p-6">
					<span class="font-semibold">Panel Two</span>
				</div>
			</ResizablePane>
		</ResizablePaneGroup>
	{/snippet}
</Story>

<!-- Collapsible Sidebar -->
<Story name="Collapsible Sidebar" args={{ direction: "horizontal" }}>
	{#snippet template(args)}
		<ResizablePaneGroup {...args} class="min-h-[300px] max-w-2xl rounded-lg border">
			<ResizablePane defaultSize={20} minSize={10} collapsible collapsedSize={5}>
				<div class="flex h-full items-center justify-center p-4">
					<span class="text-sm font-semibold">Sidebar</span>
				</div>
			</ResizablePane>
			<ResizableHandle withHandle />
			<ResizablePane defaultSize={80}>
				<div class="flex h-full items-center justify-center p-6">
					<span class="font-semibold">Main Content</span>
				</div>
			</ResizablePane>
		</ResizablePaneGroup>
	{/snippet}
</Story>

<!-- IDE Layout -->
<Story name="IDE Layout" asChild>
	<ResizablePaneGroup direction="horizontal" class="min-h-[400px] rounded-lg border">
		<ResizablePane defaultSize={15} minSize={10}>
			<div class="h-full bg-muted/50 p-4">
				<p class="text-sm font-semibold">Explorer</p>
				<div class="mt-4 space-y-1 text-sm">
					<div class="cursor-pointer rounded px-2 py-1 hover:bg-muted">src/</div>
					<div class="cursor-pointer rounded px-2 py-1 pl-4 hover:bg-muted">components/</div>
					<div class="cursor-pointer rounded px-2 py-1 pl-6 hover:bg-muted">Button.svelte</div>
					<div class="cursor-pointer rounded px-2 py-1 pl-6 hover:bg-muted">Card.svelte</div>
					<div class="cursor-pointer rounded px-2 py-1 pl-4 hover:bg-muted">lib/</div>
					<div class="cursor-pointer rounded px-2 py-1 hover:bg-muted">package.json</div>
				</div>
			</div>
		</ResizablePane>
		<ResizableHandle />
		<ResizablePane defaultSize={60}>
			<ResizablePaneGroup direction="vertical">
				<ResizablePane defaultSize={75}>
					<div class="h-full p-4">
						<p class="mb-2 text-sm font-semibold">Editor</p>
						<p class="text-xs text-muted-foreground">Code editor content...</p>
					</div>
				</ResizablePane>
				<ResizableHandle />
				<ResizablePane defaultSize={25}>
					<div class="h-full bg-muted/30 p-4">
						<p class="text-sm font-semibold">Terminal</p>
						<div class="mt-2 font-mono text-xs text-muted-foreground">
							<p>$ npm run dev</p>
							<p class="text-green-600">Ready on http://localhost:5173</p>
						</div>
					</div>
				</ResizablePane>
			</ResizablePaneGroup>
		</ResizablePane>
		<ResizableHandle />
		<ResizablePane defaultSize={25} minSize={15}>
			<div class="h-full p-4">
				<p class="text-sm font-semibold">Preview</p>
				<div class="mt-4 flex items-center justify-center rounded border p-8">
					<button class="rounded bg-primary px-4 py-2 text-primary-foreground">Count: 0</button>
				</div>
			</div>
		</ResizablePane>
	</ResizablePaneGroup>
</Story>

<!-- Email Client Layout -->
<Story name="Email Client Layout" asChild>
	<ResizablePaneGroup direction="horizontal" class="min-h-[400px] rounded-lg border">
		<ResizablePane defaultSize={20} minSize={15}>
			<div class="h-full border-r p-4">
				<p class="mb-4 text-sm font-semibold">Folders</p>
				<div class="space-y-1 text-sm">
					<div class="cursor-pointer rounded bg-muted px-2 py-1">Inbox (12)</div>
					<div class="cursor-pointer rounded px-2 py-1 hover:bg-muted">Starred</div>
					<div class="cursor-pointer rounded px-2 py-1 hover:bg-muted">Sent</div>
					<div class="cursor-pointer rounded px-2 py-1 hover:bg-muted">Drafts (3)</div>
					<div class="cursor-pointer rounded px-2 py-1 hover:bg-muted">Trash</div>
				</div>
			</div>
		</ResizablePane>
		<ResizableHandle />
		<ResizablePane defaultSize={35}>
			<div class="h-full border-r p-4">
				<p class="mb-4 text-sm font-semibold">Messages</p>
				<div class="space-y-2">
					{#each [...Array(5).keys()] as i (i)}
						<div class="cursor-pointer rounded border p-2 hover:bg-muted">
							<p class="text-sm font-medium">Sender {i + 1}</p>
							<p class="text-xs text-muted-foreground">Subject line for email {i + 1}...</p>
						</div>
					{/each}
				</div>
			</div>
		</ResizablePane>
		<ResizableHandle />
		<ResizablePane defaultSize={45}>
			<div class="h-full p-4">
				<p class="text-sm font-semibold">Email Preview</p>
				<div class="mt-4">
					<p class="text-lg font-medium">Subject: Meeting Tomorrow</p>
					<p class="text-sm text-muted-foreground">From: sender@example.com</p>
					<p class="mt-4 text-sm">
						Hi there, just a reminder about our meeting tomorrow at 10am. Please let me know if you
						have any questions.
					</p>
				</div>
			</div>
		</ResizablePane>
	</ResizablePaneGroup>
</Story>

<!-- Playground -->
<Story name="Playground">
	{#snippet template(args)}
		<ResizablePaneGroup {...args} class="min-h-[200px] max-w-md rounded-lg border">
			<ResizablePane defaultSize={50}>
				<div class="flex h-full items-center justify-center p-6">
					<span class="font-semibold">Panel One</span>
				</div>
			</ResizablePane>
			<ResizableHandle withHandle />
			<ResizablePane defaultSize={50}>
				<div class="flex h-full items-center justify-center p-6">
					<span class="font-semibold">Panel Two</span>
				</div>
			</ResizablePane>
		</ResizablePaneGroup>
	{/snippet}
</Story>
