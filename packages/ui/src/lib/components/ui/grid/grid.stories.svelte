<script module lang="ts">
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import { Grid, GridItem } from "./index.ts";
	import { Card, CardHeader, CardTitle, CardContent } from "../card/index.ts";

	const { Story } = defineMeta({
		title: "Components/Layout/Grid",
		component: Grid,
		tags: ["autodocs"],
		argTypes: {
			as: {
				control: { type: "select" },
				options: ["div", "section", "article", "main"],
				description: "The HTML element to render",
				table: {
					category: "Behavior",
					defaultValue: { summary: "div" },
				},
			},
			class: {
				control: "text",
				description: "Additional CSS classes to apply",
				table: {
					category: "Appearance",
				},
			},
		},
		args: {
			as: "div",
		},
	});
</script>

<!-- Default -->
<Story name="Default" args={{ as: "div" }}>
	{#snippet template(args)}
		<Grid as={args.as} class="w-full">
			<GridItem class="col-span-12 rounded bg-muted p-4 text-center">Full Width (12 cols)</GridItem>
		</Grid>
	{/snippet}
</Story>

<!-- Two Columns -->
<Story name="Two Columns" args={{ as: "div" }}>
	{#snippet template(args)}
		<Grid as={args.as} class="w-full">
			<GridItem class="col-span-6 rounded bg-muted p-4 text-center">6 cols</GridItem>
			<GridItem class="col-span-6 rounded bg-muted p-4 text-center">6 cols</GridItem>
		</Grid>
	{/snippet}
</Story>

<!-- Three Columns -->
<Story name="Three Columns" args={{ as: "div" }}>
	{#snippet template(args)}
		<Grid as={args.as} class="w-full">
			<GridItem class="col-span-4 rounded bg-muted p-4 text-center">4 cols</GridItem>
			<GridItem class="col-span-4 rounded bg-muted p-4 text-center">4 cols</GridItem>
			<GridItem class="col-span-4 rounded bg-muted p-4 text-center">4 cols</GridItem>
		</Grid>
	{/snippet}
</Story>

<!-- Four Columns -->
<Story name="Four Columns" args={{ as: "div" }}>
	{#snippet template(args)}
		<Grid as={args.as} class="w-full">
			<GridItem class="col-span-3 rounded bg-muted p-4 text-center">3 cols</GridItem>
			<GridItem class="col-span-3 rounded bg-muted p-4 text-center">3 cols</GridItem>
			<GridItem class="col-span-3 rounded bg-muted p-4 text-center">3 cols</GridItem>
			<GridItem class="col-span-3 rounded bg-muted p-4 text-center">3 cols</GridItem>
		</Grid>
	{/snippet}
</Story>

<!-- Asymmetric Layout -->
<Story name="Asymmetric Layout" args={{ as: "div" }}>
	{#snippet template(args)}
		<Grid as={args.as} class="w-full">
			<GridItem class="col-span-8 rounded bg-muted p-4 text-center">Main Content (8 cols)</GridItem>
			<GridItem class="col-span-4 rounded bg-muted p-4 text-center">Sidebar (4 cols)</GridItem>
		</Grid>
	{/snippet}
</Story>

<!-- Complex Layout -->
<Story name="Complex Layout" args={{ as: "div" }}>
	{#snippet template(args)}
		<Grid as={args.as} class="w-full">
			<GridItem class="col-span-12 rounded bg-primary/20 p-4 text-center">Header (12 cols)</GridItem
			>
			<GridItem class="col-span-3 rounded bg-secondary/20 p-4 text-center">Nav (3 cols)</GridItem>
			<GridItem class="col-span-6 rounded bg-accent/20 p-4 text-center">Main (6 cols)</GridItem>
			<GridItem class="col-span-3 rounded bg-info/20 p-4 text-center">Aside (3 cols)</GridItem>
			<GridItem class="col-span-12 rounded bg-muted p-4 text-center">Footer (12 cols)</GridItem>
		</Grid>
	{/snippet}
</Story>

<!-- With Cards -->
<Story name="With Cards" args={{ as: "div" }}>
	{#snippet template(args)}
		<Grid as={args.as} class="w-full">
			<GridItem class="col-span-4">
				<Card>
					<CardHeader>
						<CardTitle>Card 1</CardTitle>
					</CardHeader>
					<CardContent>Content for card 1</CardContent>
				</Card>
			</GridItem>
			<GridItem class="col-span-4">
				<Card>
					<CardHeader>
						<CardTitle>Card 2</CardTitle>
					</CardHeader>
					<CardContent>Content for card 2</CardContent>
				</Card>
			</GridItem>
			<GridItem class="col-span-4">
				<Card>
					<CardHeader>
						<CardTitle>Card 3</CardTitle>
					</CardHeader>
					<CardContent>Content for card 3</CardContent>
				</Card>
			</GridItem>
		</Grid>
	{/snippet}
</Story>

<!-- Responsive Pattern -->
<Story name="Responsive Pattern" args={{ as: "div" }}>
	{#snippet template(args)}
		<Grid as={args.as} class="w-full">
			<GridItem
				class="col-span-12 rounded bg-muted p-4 text-center @md/ujl-grid:col-span-6 @lg/ujl-grid:col-span-4"
			>
				Responsive Item 1
			</GridItem>
			<GridItem
				class="col-span-12 rounded bg-muted p-4 text-center @md/ujl-grid:col-span-6 @lg/ujl-grid:col-span-4"
			>
				Responsive Item 2
			</GridItem>
			<GridItem
				class="col-span-12 rounded bg-muted p-4 text-center @md/ujl-grid:col-span-6 @lg/ujl-grid:col-span-4"
			>
				Responsive Item 3
			</GridItem>
			<GridItem
				class="col-span-12 rounded bg-muted p-4 text-center @md/ujl-grid:col-span-6 @lg/ujl-grid:col-span-4"
			>
				Responsive Item 4
			</GridItem>
			<GridItem
				class="col-span-12 rounded bg-muted p-4 text-center @md/ujl-grid:col-span-6 @lg/ujl-grid:col-span-4"
			>
				Responsive Item 5
			</GridItem>
			<GridItem
				class="col-span-12 rounded bg-muted p-4 text-center @md/ujl-grid:col-span-6 @lg/ujl-grid:col-span-4"
			>
				Responsive Item 6
			</GridItem>
		</Grid>
	{/snippet}
</Story>

<!-- Nested Grids -->
<Story name="Nested Grids" args={{ as: "div" }}>
	{#snippet template(args)}
		<Grid as={args.as} class="w-full">
			<GridItem class="col-span-6 rounded border p-4">
				<p class="mb-2 font-medium">Left Section</p>
				<Grid>
					<GridItem class="col-span-6 rounded bg-muted p-2 text-center text-sm">A</GridItem>
					<GridItem class="col-span-6 rounded bg-muted p-2 text-center text-sm">B</GridItem>
				</Grid>
			</GridItem>
			<GridItem class="col-span-6 rounded border p-4">
				<p class="mb-2 font-medium">Right Section</p>
				<Grid>
					<GridItem class="col-span-4 rounded bg-muted p-2 text-center text-sm">C</GridItem>
					<GridItem class="col-span-4 rounded bg-muted p-2 text-center text-sm">D</GridItem>
					<GridItem class="col-span-4 rounded bg-muted p-2 text-center text-sm">E</GridItem>
				</Grid>
			</GridItem>
		</Grid>
	{/snippet}
</Story>

<!-- Playground -->
<Story name="Playground">
	{#snippet template(args)}
		<Grid as={args.as} class="w-full">
			<GridItem class="col-span-12 rounded bg-muted p-4 text-center">
				Customize the grid layout using CSS classes
			</GridItem>
		</Grid>
	{/snippet}
</Story>
