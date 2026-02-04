<script module lang="ts">
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "./index.ts";
	import { Button } from "../button/index.ts";

	const { Story } = defineMeta({
		title: "Components/Feedback/Tooltip",
		component: Tooltip,
		tags: ["autodocs"],
		argTypes: {
			delayDuration: {
				control: { type: "number" },
				description:
					"The duration from when the mouse enters the trigger until the tooltip opens (in ms)",
				table: {
					category: "Behavior",
					defaultValue: { summary: "700" },
				},
			},
			disableHoverableContent: {
				control: "boolean",
				description: "When true, the tooltip closes when hovering over the content",
				table: {
					category: "Behavior",
					defaultValue: { summary: "false" },
				},
			},
		},
		args: {
			delayDuration: 200,
		},
	});
</script>

<!-- Default -->
<Story name="Default">
	{#snippet template(args)}
		<TooltipProvider>
			<Tooltip delayDuration={args.delayDuration}>
				<TooltipTrigger>
					<Button variant="outline">Hover me</Button>
				</TooltipTrigger>
				<TooltipContent>
					<p>This is a tooltip</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	{/snippet}
</Story>

<!-- Different Sides -->
<Story name="Positions" asChild>
	<div class="flex flex-wrap items-center justify-center gap-8 p-8">
		<TooltipProvider>
			<Tooltip delayDuration={0}>
				<TooltipTrigger>
					<Button variant="outline">Top</Button>
				</TooltipTrigger>
				<TooltipContent side="top">
					<p>Tooltip on top</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>

		<TooltipProvider>
			<Tooltip delayDuration={0}>
				<TooltipTrigger>
					<Button variant="outline">Right</Button>
				</TooltipTrigger>
				<TooltipContent side="right">
					<p>Tooltip on right</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>

		<TooltipProvider>
			<Tooltip delayDuration={0}>
				<TooltipTrigger>
					<Button variant="outline">Bottom</Button>
				</TooltipTrigger>
				<TooltipContent side="bottom">
					<p>Tooltip on bottom</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>

		<TooltipProvider>
			<Tooltip delayDuration={0}>
				<TooltipTrigger>
					<Button variant="outline">Left</Button>
				</TooltipTrigger>
				<TooltipContent side="left">
					<p>Tooltip on left</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	</div>
</Story>

<!-- With Offset -->
<Story name="With Offset" asChild>
	<div class="flex flex-wrap items-center justify-center gap-8 p-8">
		<TooltipProvider>
			<Tooltip delayDuration={0}>
				<TooltipTrigger>
					<Button variant="outline">No Offset</Button>
				</TooltipTrigger>
				<TooltipContent sideOffset={0}>
					<p>No offset from trigger</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>

		<TooltipProvider>
			<Tooltip delayDuration={0}>
				<TooltipTrigger>
					<Button variant="outline">Small Offset</Button>
				</TooltipTrigger>
				<TooltipContent sideOffset={8}>
					<p>8px offset from trigger</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>

		<TooltipProvider>
			<Tooltip delayDuration={0}>
				<TooltipTrigger>
					<Button variant="outline">Large Offset</Button>
				</TooltipTrigger>
				<TooltipContent sideOffset={16}>
					<p>16px offset from trigger</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	</div>
</Story>

<!-- On Icon Button -->
<Story name="Icon Button" asChild>
	<div class="flex items-center gap-4">
		<TooltipProvider>
			<Tooltip delayDuration={0}>
				<TooltipTrigger>
					<Button variant="outline" size="icon">
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
							<path d="M12 5v14" />
							<path d="M5 12h14" />
						</svg>
						<span class="sr-only">Add</span>
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<p>Add new item</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>

		<TooltipProvider>
			<Tooltip delayDuration={0}>
				<TooltipTrigger>
					<Button variant="outline" size="icon">
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
							<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
							<path d="m15 5 4 4" />
						</svg>
						<span class="sr-only">Edit</span>
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<p>Edit item</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>

		<TooltipProvider>
			<Tooltip delayDuration={0}>
				<TooltipTrigger>
					<Button variant="outline" size="icon">
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
						<span class="sr-only">Delete</span>
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<p>Delete item</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>

		<TooltipProvider>
			<Tooltip delayDuration={0}>
				<TooltipTrigger>
					<Button variant="outline" size="icon">
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
						<span class="sr-only">Settings</span>
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<p>Settings</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	</div>
</Story>

<!-- With Keyboard Shortcut -->
<Story name="With Keyboard Shortcut" asChild>
	<div class="flex items-center gap-4">
		<TooltipProvider>
			<Tooltip delayDuration={0}>
				<TooltipTrigger>
					<Button variant="outline">Save</Button>
				</TooltipTrigger>
				<TooltipContent class="flex items-center gap-2">
					<p>Save changes</p>
					<kbd
						class="pointer-events-none inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium select-none"
					>
						<span class="text-xs">Ctrl</span>S
					</kbd>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>

		<TooltipProvider>
			<Tooltip delayDuration={0}>
				<TooltipTrigger>
					<Button variant="outline">Copy</Button>
				</TooltipTrigger>
				<TooltipContent class="flex items-center gap-2">
					<p>Copy to clipboard</p>
					<kbd
						class="pointer-events-none inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium select-none"
					>
						<span class="text-xs">Ctrl</span>C
					</kbd>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>

		<TooltipProvider>
			<Tooltip delayDuration={0}>
				<TooltipTrigger>
					<Button variant="outline">Undo</Button>
				</TooltipTrigger>
				<TooltipContent class="flex items-center gap-2">
					<p>Undo last action</p>
					<kbd
						class="pointer-events-none inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium select-none"
					>
						<span class="text-xs">Ctrl</span>Z
					</kbd>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	</div>
</Story>

<!-- On Text -->
<Story name="On Text" asChild>
	<p class="max-w-md text-sm">
		You can also add tooltips to
		<TooltipProvider>
			<Tooltip delayDuration={0}>
				<TooltipTrigger class="cursor-help underline decoration-dotted">inline text</TooltipTrigger>
				<TooltipContent>
					<p>This is an inline tooltip</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
		within a paragraph. This is useful for providing additional context about
		<TooltipProvider>
			<Tooltip delayDuration={0}>
				<TooltipTrigger class="cursor-help underline decoration-dotted">
					technical terms
				</TooltipTrigger>
				<TooltipContent>
					<p>Words that may need explanation</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
		or abbreviations like
		<TooltipProvider>
			<Tooltip delayDuration={0}>
				<TooltipTrigger class="cursor-help underline decoration-dotted">API</TooltipTrigger>
				<TooltipContent>
					<p>Application Programming Interface</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>.
	</p>
</Story>

<!-- Multiline Content -->
<Story name="Multiline Content" asChild>
	<TooltipProvider>
		<Tooltip delayDuration={0}>
			<TooltipTrigger>
				<Button variant="outline">More Info</Button>
			</TooltipTrigger>
			<TooltipContent class="max-w-xs">
				<p class="font-medium">Pro Tip</p>
				<p class="text-muted-foreground">
					You can use this component to display helpful hints and additional information to users.
				</p>
			</TooltipContent>
		</Tooltip>
	</TooltipProvider>
</Story>

<!-- Playground -->
<Story name="Playground">
	{#snippet template(args)}
		<TooltipProvider>
			<Tooltip delayDuration={args.delayDuration}>
				<TooltipTrigger>
					<Button variant="outline">Hover for tooltip</Button>
				</TooltipTrigger>
				<TooltipContent>
					<p>Adjust the delay duration in the controls</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	{/snippet}
</Story>
