<script module lang="ts">
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import { ToggleGroup, ToggleGroupItem } from "./index.ts";
	import { Label } from "../label/index.ts";

	const { Story } = defineMeta({
		title: "Components/Forms/ToggleGroup",
		component: ToggleGroup,
		tags: ["autodocs"],
		argTypes: {
			variant: {
				control: { type: "select" },
				options: ["default", "outline"],
				description: "The visual style variant",
				table: {
					category: "Appearance",
					defaultValue: { summary: "default" },
				},
			},
			size: {
				control: { type: "select" },
				options: ["default", "sm", "lg"],
				description: "The size of the toggle items",
				table: {
					category: "Appearance",
					defaultValue: { summary: "default" },
				},
			},
			type: {
				control: { type: "select" },
				options: ["single", "multiple"],
				description: "Selection type: single or multiple",
				table: {
					category: "Behavior",
					defaultValue: { summary: "single" },
				},
			},
		},
		args: {
			variant: "default",
			size: "default",
			type: "single",
		},
	});
</script>

<!-- Default -->
<Story name="Default">
	{#snippet template(args)}
		<ToggleGroup {...args}>
			<ToggleGroupItem value="left">
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
					<line x1="21" x2="3" y1="6" y2="6" />
					<line x1="15" x2="3" y1="12" y2="12" />
					<line x1="17" x2="3" y1="18" y2="18" />
				</svg>
			</ToggleGroupItem>
			<ToggleGroupItem value="center">
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
					<line x1="21" x2="3" y1="6" y2="6" />
					<line x1="18" x2="6" y1="12" y2="12" />
					<line x1="21" x2="3" y1="18" y2="18" />
				</svg>
			</ToggleGroupItem>
			<ToggleGroupItem value="right">
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
					<line x1="21" x2="3" y1="6" y2="6" />
					<line x1="21" x2="9" y1="12" y2="12" />
					<line x1="21" x2="7" y1="18" y2="18" />
				</svg>
			</ToggleGroupItem>
		</ToggleGroup>
	{/snippet}
</Story>

<!-- Outline Variant -->
<Story name="Outline Variant" args={{ variant: "outline" }}>
	{#snippet template(args)}
		<ToggleGroup {...args}>
			<ToggleGroupItem value="bold">
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
					<path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8" />
				</svg>
			</ToggleGroupItem>
			<ToggleGroupItem value="italic">
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
					<line x1="19" x2="10" y1="4" y2="4" />
					<line x1="14" x2="5" y1="20" y2="20" />
					<line x1="15" x2="9" y1="4" y2="20" />
				</svg>
			</ToggleGroupItem>
			<ToggleGroupItem value="underline">
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
					<path d="M6 4v6a6 6 0 0 0 12 0V4" />
					<line x1="4" x2="20" y1="20" y2="20" />
				</svg>
			</ToggleGroupItem>
		</ToggleGroup>
	{/snippet}
</Story>

<!-- Multiple Selection -->
<Story name="Multiple Selection" args={{ type: "multiple", variant: "outline" }}>
	{#snippet template(args)}
		<ToggleGroup {...args}>
			<ToggleGroupItem value="bold">
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
					<path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8" />
				</svg>
			</ToggleGroupItem>
			<ToggleGroupItem value="italic">
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
					<line x1="19" x2="10" y1="4" y2="4" />
					<line x1="14" x2="5" y1="20" y2="20" />
					<line x1="15" x2="9" y1="4" y2="20" />
				</svg>
			</ToggleGroupItem>
			<ToggleGroupItem value="underline">
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
					<path d="M6 4v6a6 6 0 0 0 12 0V4" />
					<line x1="4" x2="20" y1="20" y2="20" />
				</svg>
			</ToggleGroupItem>
			<ToggleGroupItem value="strikethrough">
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
					<path d="M16 4H9a3 3 0 0 0-2.83 4" />
					<path d="M14 12a4 4 0 0 1 0 8H6" />
					<line x1="4" x2="20" y1="12" y2="12" />
				</svg>
			</ToggleGroupItem>
		</ToggleGroup>
	{/snippet}
</Story>

<!-- Size Variants -->
<Story name="Size Variants" asChild>
	<div class="flex flex-col gap-4">
		<div class="space-y-1">
			<Label class="text-xs text-muted-foreground">Small</Label>
			<ToggleGroup type="single" size="sm">
				<ToggleGroupItem value="a">A</ToggleGroupItem>
				<ToggleGroupItem value="b">B</ToggleGroupItem>
				<ToggleGroupItem value="c">C</ToggleGroupItem>
			</ToggleGroup>
		</div>
		<div class="space-y-1">
			<Label class="text-xs text-muted-foreground">Default</Label>
			<ToggleGroup type="single" size="default">
				<ToggleGroupItem value="a">A</ToggleGroupItem>
				<ToggleGroupItem value="b">B</ToggleGroupItem>
				<ToggleGroupItem value="c">C</ToggleGroupItem>
			</ToggleGroup>
		</div>
		<div class="space-y-1">
			<Label class="text-xs text-muted-foreground">Large</Label>
			<ToggleGroup type="single" size="lg">
				<ToggleGroupItem value="a">A</ToggleGroupItem>
				<ToggleGroupItem value="b">B</ToggleGroupItem>
				<ToggleGroupItem value="c">C</ToggleGroupItem>
			</ToggleGroup>
		</div>
	</div>
</Story>

<!-- With Text Labels -->
<Story name="With Text Labels" args={{ variant: "outline", type: "single" }}>
	{#snippet template(args)}
		<ToggleGroup {...args}>
			<ToggleGroupItem value="daily">Daily</ToggleGroupItem>
			<ToggleGroupItem value="weekly">Weekly</ToggleGroupItem>
			<ToggleGroupItem value="monthly">Monthly</ToggleGroupItem>
		</ToggleGroup>
	{/snippet}
</Story>

<!-- View Toggle -->
<Story name="View Toggle" args={{ variant: "outline", type: "single", value: "grid" }}>
	{#snippet template(args)}
		<ToggleGroup {...args}>
			<ToggleGroupItem value="list">
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
					<line x1="8" x2="21" y1="6" y2="6" />
					<line x1="8" x2="21" y1="12" y2="12" />
					<line x1="8" x2="21" y1="18" y2="18" />
					<line x1="3" x2="3.01" y1="6" y2="6" />
					<line x1="3" x2="3.01" y1="12" y2="12" />
					<line x1="3" x2="3.01" y1="18" y2="18" />
				</svg>
				<span class="sr-only">List view</span>
			</ToggleGroupItem>
			<ToggleGroupItem value="grid">
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
					<rect width="7" height="7" x="3" y="3" rx="1" />
					<rect width="7" height="7" x="14" y="3" rx="1" />
					<rect width="7" height="7" x="14" y="14" rx="1" />
					<rect width="7" height="7" x="3" y="14" rx="1" />
				</svg>
				<span class="sr-only">Grid view</span>
			</ToggleGroupItem>
			<ToggleGroupItem value="kanban">
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
					<rect width="6" height="14" x="4" y="5" rx="2" />
					<rect width="6" height="10" x="14" y="7" rx="2" />
				</svg>
				<span class="sr-only">Kanban view</span>
			</ToggleGroupItem>
		</ToggleGroup>
	{/snippet}
</Story>

<!-- Disabled Items -->
<Story name="Disabled Items" args={{ type: "single", variant: "outline" }}>
	{#snippet template(args)}
		<ToggleGroup {...args}>
			<ToggleGroupItem value="option1">Option 1</ToggleGroupItem>
			<ToggleGroupItem value="option2" disabled>Option 2</ToggleGroupItem>
			<ToggleGroupItem value="option3">Option 3</ToggleGroupItem>
		</ToggleGroup>
	{/snippet}
</Story>

<!-- Pricing Toggle -->
<Story name="Pricing Toggle" args={{ variant: "outline", type: "single", value: "monthly" }}>
	{#snippet template(args)}
		<div class="flex flex-col items-center gap-4">
			<ToggleGroup {...args}>
				<ToggleGroupItem value="monthly" class="px-4">Monthly</ToggleGroupItem>
				<ToggleGroupItem value="yearly" class="px-4">
					Yearly
					<span class="ml-1 text-xs text-green-600">-20%</span>
				</ToggleGroupItem>
			</ToggleGroup>
			<p class="text-sm text-muted-foreground">Save 20% with yearly billing</p>
		</div>
	{/snippet}
</Story>

<!-- Playground -->
<Story name="Playground">
	{#snippet template(args)}
		<ToggleGroup {...args}>
			<ToggleGroupItem value="1">One</ToggleGroupItem>
			<ToggleGroupItem value="2">Two</ToggleGroupItem>
			<ToggleGroupItem value="3">Three</ToggleGroupItem>
		</ToggleGroup>
	{/snippet}
</Story>
