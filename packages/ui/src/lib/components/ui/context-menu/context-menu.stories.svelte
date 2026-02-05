<script module lang="ts">
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import {
		ContextMenu,
		ContextMenuTrigger,
		ContextMenuContent,
		ContextMenuItem,
		ContextMenuSeparator,
		ContextMenuSub,
		ContextMenuSubTrigger,
		ContextMenuSubContent,
		ContextMenuCheckboxItem,
		ContextMenuRadioGroup,
		ContextMenuRadioItem,
		ContextMenuLabel,
		ContextMenuShortcut,
	} from "./index.ts";

	const { Story } = defineMeta({
		title: "Components/Complex/ContextMenu",
		component: ContextMenu,
		tags: ["autodocs"],
		argTypes: {},
		args: {
			open: false,
		},
	});
</script>

<!-- Default -->
<Story name="Default">
	{#snippet template(args)}
		<ContextMenu {...args}>
			<ContextMenuTrigger
				class="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm"
			>
				Right click here
			</ContextMenuTrigger>
			<ContextMenuContent class="w-64">
				<ContextMenuItem>
					Back
					<ContextMenuShortcut>Alt+Left</ContextMenuShortcut>
				</ContextMenuItem>
				<ContextMenuItem disabled>
					Forward
					<ContextMenuShortcut>Alt+Right</ContextMenuShortcut>
				</ContextMenuItem>
				<ContextMenuItem>
					Reload
					<ContextMenuShortcut>Ctrl+R</ContextMenuShortcut>
				</ContextMenuItem>
				<ContextMenuSeparator />
				<ContextMenuItem>
					Save As...
					<ContextMenuShortcut>Ctrl+S</ContextMenuShortcut>
				</ContextMenuItem>
				<ContextMenuItem>Print...</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	{/snippet}
</Story>

<!-- With Submenus -->
<Story name="With Submenus">
	{#snippet template(args)}
		<ContextMenu {...args}>
			<ContextMenuTrigger
				class="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm"
			>
				Right click here
			</ContextMenuTrigger>
			<ContextMenuContent class="w-64">
				<ContextMenuItem>New Tab</ContextMenuItem>
				<ContextMenuItem>New Window</ContextMenuItem>
				<ContextMenuSeparator />
				<ContextMenuSub>
					<ContextMenuSubTrigger>More Tools</ContextMenuSubTrigger>
					<ContextMenuSubContent class="w-48">
						<ContextMenuItem>Save Page As...</ContextMenuItem>
						<ContextMenuItem>Create Shortcut...</ContextMenuItem>
						<ContextMenuItem>Name Window...</ContextMenuItem>
						<ContextMenuSeparator />
						<ContextMenuItem>Developer Tools</ContextMenuItem>
					</ContextMenuSubContent>
				</ContextMenuSub>
				<ContextMenuSub>
					<ContextMenuSubTrigger>Share</ContextMenuSubTrigger>
					<ContextMenuSubContent class="w-48">
						<ContextMenuItem>Email</ContextMenuItem>
						<ContextMenuItem>Message</ContextMenuItem>
						<ContextMenuItem>Copy Link</ContextMenuItem>
					</ContextMenuSubContent>
				</ContextMenuSub>
				<ContextMenuSeparator />
				<ContextMenuItem>Print...</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	{/snippet}
</Story>

<!-- With Checkboxes -->
<Story name="With Checkboxes">
	{#snippet template(args)}
		<ContextMenu {...args}>
			<ContextMenuTrigger
				class="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm"
			>
				Right click here
			</ContextMenuTrigger>
			<ContextMenuContent class="w-64">
				<ContextMenuLabel>Appearance</ContextMenuLabel>
				<ContextMenuSeparator />
				<ContextMenuCheckboxItem checked>Show Bookmarks Bar</ContextMenuCheckboxItem>
				<ContextMenuCheckboxItem>Show Full URLs</ContextMenuCheckboxItem>
				<ContextMenuCheckboxItem checked>Show Status Bar</ContextMenuCheckboxItem>
				<ContextMenuSeparator />
				<ContextMenuCheckboxItem>Enable Dark Mode</ContextMenuCheckboxItem>
			</ContextMenuContent>
		</ContextMenu>
	{/snippet}
</Story>

<!-- With Radio Items -->
<Story name="With Radio Items">
	{#snippet template(args)}
		<ContextMenu {...args}>
			<ContextMenuTrigger
				class="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm"
			>
				Right click here
			</ContextMenuTrigger>
			<ContextMenuContent class="w-64">
				<ContextMenuLabel>View</ContextMenuLabel>
				<ContextMenuSeparator />
				<ContextMenuRadioGroup value="medium">
					<ContextMenuRadioItem value="small">Small Icons</ContextMenuRadioItem>
					<ContextMenuRadioItem value="medium">Medium Icons</ContextMenuRadioItem>
					<ContextMenuRadioItem value="large">Large Icons</ContextMenuRadioItem>
				</ContextMenuRadioGroup>
				<ContextMenuSeparator />
				<ContextMenuRadioGroup value="name">
					<ContextMenuLabel>Sort By</ContextMenuLabel>
					<ContextMenuRadioItem value="name">Name</ContextMenuRadioItem>
					<ContextMenuRadioItem value="date">Date Modified</ContextMenuRadioItem>
					<ContextMenuRadioItem value="size">Size</ContextMenuRadioItem>
				</ContextMenuRadioGroup>
			</ContextMenuContent>
		</ContextMenu>
	{/snippet}
</Story>

<!-- With Icons -->
<Story name="With Icons">
	{#snippet template(args)}
		<ContextMenu {...args}>
			<ContextMenuTrigger
				class="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm"
			>
				Right click here
			</ContextMenuTrigger>
			<ContextMenuContent class="w-64">
				<ContextMenuItem>
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
						<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
						<polyline points="7 10 12 15 17 10" />
						<line x1="12" x2="12" y1="15" y2="3" />
					</svg>
					Download
					<ContextMenuShortcut>Ctrl+D</ContextMenuShortcut>
				</ContextMenuItem>
				<ContextMenuItem>
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
						<rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
						<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
					</svg>
					Copy
					<ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
				</ContextMenuItem>
				<ContextMenuItem>
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
						<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
						<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
					</svg>
					Edit
					<ContextMenuShortcut>Ctrl+E</ContextMenuShortcut>
				</ContextMenuItem>
				<ContextMenuSeparator />
				<ContextMenuItem class="text-destructive">
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
						<path d="M3 6h18" />
						<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
						<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
						<line x1="10" x2="10" y1="11" y2="17" />
						<line x1="14" x2="14" y1="11" y2="17" />
					</svg>
					Delete
					<ContextMenuShortcut>Del</ContextMenuShortcut>
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	{/snippet}
</Story>

<!-- File Explorer Example -->
<Story name="File Explorer Example">
	{#snippet template(args)}
		<ContextMenu {...args}>
			<ContextMenuTrigger
				class="flex h-[200px] w-[300px] flex-col items-center justify-center gap-2 rounded-md border border-dashed text-sm"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="48"
					height="48"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="text-muted-foreground"
				>
					<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
					<path d="M14 2v4a2 2 0 0 0 2 2h4" />
				</svg>
				<span class="text-muted-foreground">document.pdf</span>
				<span class="text-xs text-muted-foreground">Right click for options</span>
			</ContextMenuTrigger>
			<ContextMenuContent class="w-64">
				<ContextMenuItem>
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
						<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
						<polyline points="15 3 21 3 21 9" />
						<line x1="10" x2="21" y1="14" y2="3" />
					</svg>
					Open
				</ContextMenuItem>
				<ContextMenuItem>
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
				</ContextMenuItem>
				<ContextMenuSub>
					<ContextMenuSubTrigger>
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
							<path d="M12 3v12" />
							<path d="m8 11 4 4 4-4" />
							<path d="M8 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-4" />
						</svg>
						Move to
					</ContextMenuSubTrigger>
					<ContextMenuSubContent class="w-48">
						<ContextMenuItem>Documents</ContextMenuItem>
						<ContextMenuItem>Downloads</ContextMenuItem>
						<ContextMenuItem>Desktop</ContextMenuItem>
					</ContextMenuSubContent>
				</ContextMenuSub>
				<ContextMenuSeparator />
				<ContextMenuItem>
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
							d="m18 5-2.414-2.414A2 2 0 0 0 14.172 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2"
						/>
						<path
							d="M21.378 12.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"
						/>
					</svg>
					Rename
					<ContextMenuShortcut>F2</ContextMenuShortcut>
				</ContextMenuItem>
				<ContextMenuSeparator />
				<ContextMenuItem class="text-destructive">
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
						<path d="M3 6h18" />
						<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
						<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
					</svg>
					Move to Trash
					<ContextMenuShortcut>Del</ContextMenuShortcut>
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	{/snippet}
</Story>

<!-- Playground -->
<Story name="Playground">
	{#snippet template(args)}
		<ContextMenu {...args}>
			<ContextMenuTrigger
				class="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm"
			>
				Right click here
			</ContextMenuTrigger>
			<ContextMenuContent class="w-64">
				<ContextMenuItem>Cut</ContextMenuItem>
				<ContextMenuItem>Copy</ContextMenuItem>
				<ContextMenuItem>Paste</ContextMenuItem>
				<ContextMenuSeparator />
				<ContextMenuItem>Select All</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	{/snippet}
</Story>
