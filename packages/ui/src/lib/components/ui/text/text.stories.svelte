<script module lang="ts">
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import { Text, Heading, Highlight, Code } from "./index.ts";

	const { Story } = defineMeta({
		title: "Components/Typography/Text",
		component: Text,
		tags: ["autodocs"],
		argTypes: {
			size: {
				control: { type: "select" },
				options: ["default", "xs", "sm", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl"],
				description: "The size of the text",
				table: {
					category: "Appearance",
					defaultValue: { summary: "default" },
				},
			},
			weight: {
				control: { type: "select" },
				options: ["default", "bold"],
				description: "The font weight of the text",
				table: {
					category: "Appearance",
					defaultValue: { summary: "default" },
				},
			},
			intensity: {
				control: { type: "select" },
				options: ["muted", "default", "solid"],
				description: "The color intensity of the text",
				table: {
					category: "Appearance",
					defaultValue: { summary: "default" },
				},
			},
			as: {
				control: { type: "select" },
				options: ["p", "span", "div", "label"],
				description: "The HTML element to render",
				table: {
					category: "Behavior",
					defaultValue: { summary: "p" },
				},
			},
		},
		args: {
			size: "default",
			weight: "default",
			intensity: "default",
			as: "p",
		},
	});
</script>

<!-- Default Text -->
<Story name="Default">
	{#snippet template(args)}
		<Text {...args}>The quick brown fox jumps over the lazy dog.</Text>
	{/snippet}
</Story>

<!-- All Sizes -->
<Story name="All Sizes" asChild>
	<div class="space-y-4">
		<Text size="xs">Extra Small (xs) - The quick brown fox jumps over the lazy dog.</Text>
		<Text size="sm">Small (sm) - The quick brown fox jumps over the lazy dog.</Text>
		<Text size="default">Default - The quick brown fox jumps over the lazy dog.</Text>
		<Text size="lg">Large (lg) - The quick brown fox jumps over the lazy dog.</Text>
		<Text size="xl">Extra Large (xl) - The quick brown fox jumps over the lazy dog.</Text>
		<Text size="2xl">2XL - The quick brown fox jumps over the lazy dog.</Text>
		<Text size="3xl">3XL - The quick brown fox</Text>
		<Text size="4xl">4XL - The quick brown fox</Text>
	</div>
</Story>

<!-- All Intensities -->
<Story name="All Intensities" asChild>
	<div class="space-y-4">
		<Text intensity="muted">Muted intensity - The quick brown fox jumps over the lazy dog.</Text>
		<Text intensity="default">Default intensity - The quick brown fox jumps over the lazy dog.</Text
		>
		<Text intensity="solid">Solid intensity - The quick brown fox jumps over the lazy dog.</Text>
	</div>
</Story>

<!-- Weight Variants -->
<Story name="Weight Variants" asChild>
	<div class="space-y-4">
		<Text weight="default">Default weight - The quick brown fox jumps over the lazy dog.</Text>
		<Text weight="bold">Bold weight - The quick brown fox jumps over the lazy dog.</Text>
	</div>
</Story>

<!-- Headings -->
<Story name="Headings" asChild>
	<div class="space-y-4">
		<Heading level={1}>Heading Level 1</Heading>
		<Heading level={2}>Heading Level 2</Heading>
		<Heading level={3}>Heading Level 3</Heading>
		<Heading level={4}>Heading Level 4</Heading>
		<Heading level={5}>Heading Level 5</Heading>
		<Heading level={6}>Heading Level 6</Heading>
	</div>
</Story>

<!-- Highlight -->
<Story name="Highlight" asChild>
	<div class="space-y-4">
		<Text>
			This is a paragraph with <Highlight>highlighted text</Highlight> inside it.
		</Text>
		<Text>
			You can use highlights to <Highlight>emphasize important information</Highlight> in your content.
		</Text>
		<Text size="lg">
			<Highlight>Highlights also work with different text sizes.</Highlight>
		</Text>
	</div>
</Story>

<!-- Code -->
<Story name="Code" asChild>
	<div class="space-y-4">
		<Text>
			Use the <Code>npm install</Code> command to install packages.
		</Text>
		<Text>
			The function <Code>calculateTotal()</Code> returns the sum of all items.
		</Text>
		<Text>
			Set the environment variable <Code>NODE_ENV=production</Code> for production builds.
		</Text>
	</div>
</Story>

<!-- Combined Typography -->
<Story name="Combined Typography">
	{#snippet template()}
		<article class="max-w-2xl space-y-4">
			<Heading level={1}>Getting Started</Heading>
			<Text intensity="muted">Learn how to set up your development environment.</Text>

			<Heading level={2}>Installation</Heading>
			<Text>
				First, install the package using <Code>npm install @ujl/ui</Code> or <Code
					>pnpm add @ujl/ui</Code
				>.
			</Text>

			<Heading level={3}>Prerequisites</Heading>
			<Text>
				Make sure you have <Highlight>Node.js 18+</Highlight> installed on your system. You can check
				your version by running <Code>node --version</Code>.
			</Text>

			<Heading level={3}>Configuration</Heading>
			<Text>
				Create a configuration file named <Code>ujl.config.js</Code> in your project root. This file controls
				how components are generated and styled.
			</Text>

			<Text size="sm" intensity="muted">
				Note: All configuration options are optional. Default values will be used if not specified.
			</Text>
		</article>
	{/snippet}
</Story>

<!-- Blog Post Example -->
<Story name="Blog Post Example">
	{#snippet template()}
		<article class="max-w-2xl space-y-4">
			<Heading level={1}>The Future of Web Development</Heading>
			<Text size="sm" intensity="muted">Published on January 26, 2026 by John Doe</Text>

			<Text>
				Web development has evolved significantly over the past decade. From simple static HTML
				pages to complex <Highlight>single-page applications</Highlight>, the landscape continues to
				change at a rapid pace.
			</Text>

			<Heading level={2}>Modern Frameworks</Heading>
			<Text>
				Today's developers have access to powerful frameworks like <Highlight>Svelte</Highlight>,
				React, and Vue. These tools make it easier than ever to build interactive user interfaces.
			</Text>

			<Text>
				For example, creating a component in Svelte is as simple as writing a <Code>.svelte</Code> file
				with your HTML, CSS, and JavaScript combined.
			</Text>

			<Heading level={2}>What's Next?</Heading>
			<Text>
				The future promises even more exciting developments, including better tooling, improved
				performance, and new paradigms for building web applications.
			</Text>

			<Text intensity="muted" size="sm">
				This article reflects the author's opinions as of the publication date.
			</Text>
		</article>
	{/snippet}
</Story>

<!-- Playground -->
<Story name="Playground">
	{#snippet template(args)}
		<Text {...args}>
			Customize this text using the controls. The quick brown fox jumps over the lazy dog.
		</Text>
	{/snippet}
</Story>
