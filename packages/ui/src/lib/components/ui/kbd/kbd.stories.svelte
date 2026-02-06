<script module lang="ts">
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import { Kbd, KbdGroup } from "./index.ts";
	import { Text } from "../text/index.ts";

	const { Story } = defineMeta({
		title: "Components/Typography/Kbd",
		component: Kbd,
		tags: ["autodocs"],
		argTypes: {
			class: {
				control: "text",
				description: "Additional CSS classes",
				table: {
					category: "Appearance",
				},
			},
		},
		args: {},
	});
</script>

<!-- Default -->
<Story name="Default">
	{#snippet template()}
		<Kbd>K</Kbd>
	{/snippet}
</Story>

<!-- Single Keys -->
<Story name="Single Keys" asChild>
	<div class="flex flex-wrap items-center gap-2">
		<Kbd>A</Kbd>
		<Kbd>B</Kbd>
		<Kbd>C</Kbd>
		<Kbd>1</Kbd>
		<Kbd>2</Kbd>
		<Kbd>3</Kbd>
		<Kbd>F1</Kbd>
		<Kbd>F12</Kbd>
	</div>
</Story>

<!-- Modifier Keys -->
<Story name="Modifier Keys" asChild>
	<div class="flex flex-wrap items-center gap-2">
		<Kbd>Ctrl</Kbd>
		<Kbd>Alt</Kbd>
		<Kbd>Shift</Kbd>
		<Kbd>Cmd</Kbd>
		<Kbd>Tab</Kbd>
		<Kbd>Esc</Kbd>
		<Kbd>Enter</Kbd>
		<Kbd>Space</Kbd>
	</div>
</Story>

<!-- Keyboard Shortcuts -->
<Story name="Keyboard Shortcuts" asChild>
	<div class="flex flex-col gap-4">
		<div class="flex items-center gap-2">
			<span class="w-32 text-sm text-muted-foreground">Copy</span>
			<KbdGroup>
				<Kbd>Ctrl</Kbd>
				<Kbd>C</Kbd>
			</KbdGroup>
		</div>
		<div class="flex items-center gap-2">
			<span class="w-32 text-sm text-muted-foreground">Paste</span>
			<KbdGroup>
				<Kbd>Ctrl</Kbd>
				<Kbd>V</Kbd>
			</KbdGroup>
		</div>
		<div class="flex items-center gap-2">
			<span class="w-32 text-sm text-muted-foreground">Undo</span>
			<KbdGroup>
				<Kbd>Ctrl</Kbd>
				<Kbd>Z</Kbd>
			</KbdGroup>
		</div>
		<div class="flex items-center gap-2">
			<span class="w-32 text-sm text-muted-foreground">Save</span>
			<KbdGroup>
				<Kbd>Ctrl</Kbd>
				<Kbd>S</Kbd>
			</KbdGroup>
		</div>
		<div class="flex items-center gap-2">
			<span class="w-32 text-sm text-muted-foreground">Find</span>
			<KbdGroup>
				<Kbd>Ctrl</Kbd>
				<Kbd>F</Kbd>
			</KbdGroup>
		</div>
	</div>
</Story>

<!-- Complex Shortcuts -->
<Story name="Complex Shortcuts" asChild>
	<div class="flex flex-col gap-4">
		<div class="flex items-center gap-2">
			<span class="w-40 text-sm text-muted-foreground">Select All + Copy</span>
			<KbdGroup>
				<Kbd>Ctrl</Kbd>
				<Kbd>A</Kbd>
			</KbdGroup>
			<span class="text-muted-foreground">then</span>
			<KbdGroup>
				<Kbd>Ctrl</Kbd>
				<Kbd>C</Kbd>
			</KbdGroup>
		</div>
		<div class="flex items-center gap-2">
			<span class="w-40 text-sm text-muted-foreground">Force Quit (Mac)</span>
			<KbdGroup>
				<Kbd>Cmd</Kbd>
				<Kbd>Option</Kbd>
				<Kbd>Esc</Kbd>
			</KbdGroup>
		</div>
		<div class="flex items-center gap-2">
			<span class="w-40 text-sm text-muted-foreground">Task Manager</span>
			<KbdGroup>
				<Kbd>Ctrl</Kbd>
				<Kbd>Shift</Kbd>
				<Kbd>Esc</Kbd>
			</KbdGroup>
		</div>
	</div>
</Story>

<!-- With Icons -->
<Story name="With Icons" asChild>
	<div class="flex flex-wrap items-center gap-2">
		<Kbd>
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
				<path
					d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"
				/>
			</svg>
		</Kbd>
		<Kbd>
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
				<path d="m18 15-6-6-6 6" />
			</svg>
		</Kbd>
		<Kbd>
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
				<path d="m6 9 6 6 6-6" />
			</svg>
		</Kbd>
		<Kbd>
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
				<path d="m15 18-6-6 6-6" />
			</svg>
		</Kbd>
		<Kbd>
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
				<path d="m9 18 6-6-6-6" />
			</svg>
		</Kbd>
	</div>
</Story>

<!-- In Context -->
<Story name="In Context">
	{#snippet template()}
		<div class="space-y-4">
			<Text>
				Press <KbdGroup><Kbd>Ctrl</Kbd><Kbd>K</Kbd></KbdGroup> to open the command palette.
			</Text>
			<Text>
				Use <KbdGroup><Kbd>Ctrl</Kbd><Kbd>Shift</Kbd><Kbd>P</Kbd></KbdGroup> to access the quick open
				menu.
			</Text>
			<Text>
				Hit <Kbd>Esc</Kbd> to close any open dialog.
			</Text>
			<Text size="sm" intensity="muted">
				Tip: You can also use <Kbd>Tab</Kbd> to navigate between elements.
			</Text>
		</div>
	{/snippet}
</Story>

<!-- Shortcuts Table -->
<Story name="Shortcuts Table">
	{#snippet template()}
		<div class="rounded-lg border">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b">
						<th class="p-3 text-left font-medium">Action</th>
						<th class="p-3 text-left font-medium">Windows/Linux</th>
						<th class="p-3 text-left font-medium">macOS</th>
					</tr>
				</thead>
				<tbody>
					<tr class="border-b">
						<td class="p-3">New File</td>
						<td class="p-3"><KbdGroup><Kbd>Ctrl</Kbd><Kbd>N</Kbd></KbdGroup></td>
						<td class="p-3"><KbdGroup><Kbd>Cmd</Kbd><Kbd>N</Kbd></KbdGroup></td>
					</tr>
					<tr class="border-b">
						<td class="p-3">Open File</td>
						<td class="p-3"><KbdGroup><Kbd>Ctrl</Kbd><Kbd>O</Kbd></KbdGroup></td>
						<td class="p-3"><KbdGroup><Kbd>Cmd</Kbd><Kbd>O</Kbd></KbdGroup></td>
					</tr>
					<tr class="border-b">
						<td class="p-3">Save</td>
						<td class="p-3"><KbdGroup><Kbd>Ctrl</Kbd><Kbd>S</Kbd></KbdGroup></td>
						<td class="p-3"><KbdGroup><Kbd>Cmd</Kbd><Kbd>S</Kbd></KbdGroup></td>
					</tr>
					<tr>
						<td class="p-3">Close</td>
						<td class="p-3"><KbdGroup><Kbd>Ctrl</Kbd><Kbd>W</Kbd></KbdGroup></td>
						<td class="p-3"><KbdGroup><Kbd>Cmd</Kbd><Kbd>W</Kbd></KbdGroup></td>
					</tr>
				</tbody>
			</table>
		</div>
	{/snippet}
</Story>

<!-- Playground -->
<Story name="Playground">
	{#snippet template()}
		<KbdGroup>
			<Kbd>Ctrl</Kbd>
			<Kbd>Shift</Kbd>
			<Kbd>K</Kbd>
		</KbdGroup>
	{/snippet}
</Story>
