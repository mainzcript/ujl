<script module lang="ts">
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import { Badge } from "./index.ts";

	const { Story } = defineMeta({
		title: "Components/Base/Badge",
		component: Badge,
		tags: ["autodocs"],
		argTypes: {
			variant: {
				control: { type: "select" },
				options: [
					"default",
					"ambient",
					"primary",
					"secondary",
					"accent",
					"success",
					"warning",
					"destructive",
					"info",
					"outline",
				],
				description: "The visual style variant of the badge",
				table: {
					category: "Appearance",
					defaultValue: { summary: "default" },
				},
			},
			href: {
				control: "text",
				description: "URL for link badges",
				table: { category: "Behavior" },
			},
		},
		args: {
			variant: "default",
		},
	});
</script>

<!-- Default -->
<Story name="Default">
	{#snippet template(args)}
		<Badge {...args}>Badge</Badge>
	{/snippet}
</Story>

<!-- All Variants -->
<Story name="All Variants" asChild>
	<div class="flex flex-wrap gap-2">
		<Badge variant="default">Default</Badge>
		<Badge variant="ambient">Ambient</Badge>
		<Badge variant="primary">Primary</Badge>
		<Badge variant="secondary">Secondary</Badge>
		<Badge variant="accent">Accent</Badge>
		<Badge variant="success">Success</Badge>
		<Badge variant="warning">Warning</Badge>
		<Badge variant="destructive">Destructive</Badge>
		<Badge variant="info">Info</Badge>
		<Badge variant="outline">Outline</Badge>
	</div>
</Story>

<!-- With Icons -->
<Story name="With Icons" asChild>
	<div class="flex flex-wrap gap-2">
		<Badge variant="success">
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
				<path d="M20 6 9 17l-5-5" />
			</svg>
			Verified
		</Badge>
		<Badge variant="warning">
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
				<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
				<path d="M12 9v4" />
				<path d="M12 17h.01" />
			</svg>
			Warning
		</Badge>
		<Badge variant="destructive">
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
				<circle cx="12" cy="12" r="10" />
				<path d="m15 9-6 6" />
				<path d="m9 9 6 6" />
			</svg>
			Error
		</Badge>
		<Badge variant="info">
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
				<circle cx="12" cy="12" r="10" />
				<path d="M12 16v-4" />
				<path d="M12 8h.01" />
			</svg>
			Info
		</Badge>
	</div>
</Story>

<!-- As Links -->
<Story name="As Links" asChild>
	<div class="flex flex-wrap gap-2">
		<Badge href="#">Default Link</Badge>
		<Badge variant="primary" href="#">Primary Link</Badge>
		<Badge variant="outline" href="#">Outline Link</Badge>
	</div>
</Story>

<!-- Status Badges -->
<Story name="Status Badges" asChild>
	<div class="flex flex-wrap gap-2">
		<Badge variant="success">Active</Badge>
		<Badge variant="warning">Pending</Badge>
		<Badge variant="destructive">Inactive</Badge>
		<Badge variant="info">Draft</Badge>
		<Badge variant="secondary">Archived</Badge>
	</div>
</Story>

<!-- Playground -->
<Story name="Playground">
	{#snippet template(args)}
		<Badge {...args}>Badge</Badge>
	{/snippet}
</Story>
