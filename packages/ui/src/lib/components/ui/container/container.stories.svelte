<script module lang="ts">
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import { Container } from "./index.ts";
	import { Card, CardHeader, CardTitle, CardContent } from "../card/index.ts";

	const { Story } = defineMeta({
		title: "Components/Layout/Container",
		component: Container,
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
			class: "",
		},
	});
</script>

<!-- Default -->
<Story name="Default" args={{ class: "bg-background py-8" }}>
	{#snippet template(args)}
		<div class="w-full bg-muted/30">
			<Container class={args.class}>
				<p>
					This content is inside a container. The container has a max-width and is centered on the
					page. Resize the window to see how it behaves.
				</p>
			</Container>
		</div>
	{/snippet}
</Story>

<!-- With Content -->
<Story name="With Content" args={{ class: "space-y-4 py-8" }}>
	{#snippet template(args)}
		<div class="w-full bg-muted/30">
			<Container class={args.class}>
				<h1 class="text-2xl font-bold">Welcome to the App</h1>
				<p class="text-muted-foreground">
					This is a typical page layout using the Container component. The container ensures your
					content stays readable on wide screens by limiting the maximum width.
				</p>
				<div class="grid gap-4 md:grid-cols-3">
					<Card>
						<CardHeader>
							<CardTitle>Feature 1</CardTitle>
						</CardHeader>
						<CardContent>Description of feature 1</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle>Feature 2</CardTitle>
						</CardHeader>
						<CardContent>Description of feature 2</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle>Feature 3</CardTitle>
						</CardHeader>
						<CardContent>Description of feature 3</CardContent>
					</Card>
				</div>
			</Container>
		</div>
	{/snippet}
</Story>

<!-- With Padding Variants -->
<Story name="With Padding Variants" args={{ class: "bg-background py-8" }}>
	{#snippet template(args)}
		<div class="w-full space-y-4 bg-muted/30">
			<Container class="bg-background py-4">
				<p class="text-sm">Small padding (py-4)</p>
			</Container>
			<Container class={args.class}>
				<p class="text-sm">Medium padding (py-8)</p>
			</Container>
			<Container class="bg-background py-16">
				<p class="text-sm">Large padding (py-16)</p>
			</Container>
		</div>
	{/snippet}
</Story>

<!-- Max Width Override -->
<Story name="Max Width Override" args={{ class: "bg-background py-4" }}>
	{#snippet template(args)}
		<div class="w-full space-y-4 bg-muted/30">
			<Container class="max-w-md bg-background py-4">
				<p class="text-center text-sm">max-w-md</p>
			</Container>
			<Container class="max-w-xl bg-background py-4">
				<p class="text-center text-sm">max-w-xl</p>
			</Container>
			<Container class="max-w-3xl bg-background py-4">
				<p class="text-center text-sm">max-w-3xl</p>
			</Container>
			<Container class="max-w-5xl bg-background py-4">
				<p class="text-center text-sm">max-w-5xl</p>
			</Container>
			<Container class={args.class}>
				<p class="text-center text-sm">Default container width</p>
			</Container>
		</div>
	{/snippet}
</Story>

<!-- Hero Section -->
<Story name="Hero Section" args={{ class: "py-24 text-center" }}>
	{#snippet template(args)}
		<div class="w-full bg-gradient-to-b from-primary/10 to-background">
			<Container class={args.class}>
				<h1 class="text-4xl font-bold tracking-tight sm:text-6xl">Build Something Amazing</h1>
				<p class="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
					A beautiful, responsive container component that keeps your content centered and readable
					on any screen size.
				</p>
			</Container>
		</div>
	{/snippet}
</Story>

<!-- Article Layout -->
<Story name="Article Layout" args={{ class: "max-w-prose bg-background py-8" }}>
	{#snippet template(args)}
		<div class="w-full bg-muted/30">
			<Container class={args.class}>
				<article class="prose">
					<h1 class="text-2xl font-bold">Article Title</h1>
					<p class="mt-4 text-muted-foreground">
						Using max-w-prose is ideal for article content. It limits the line length to around 65
						characters, which is optimal for readability. This makes it perfect for blog posts,
						documentation, and other long-form content.
					</p>
					<p class="mt-4 text-muted-foreground">
						The container component handles the centering and horizontal padding automatically, so
						you can focus on your content without worrying about layout issues.
					</p>
				</article>
			</Container>
		</div>
	{/snippet}
</Story>

<!-- Playground -->
<Story name="Playground">
	{#snippet template(args)}
		<div class="w-full bg-muted/30">
			<Container class={args.class || "bg-background py-8"}>
				<p>Customize the container using CSS classes.</p>
			</Container>
		</div>
	{/snippet}
</Story>
