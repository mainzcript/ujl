<script module lang="ts">
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import { AspectRatio } from "./index.ts";

	const { Story } = defineMeta({
		title: "Components/Layout/AspectRatio",
		component: AspectRatio,
		tags: ["autodocs"],
		argTypes: {
			ratio: {
				control: { type: "number" },
				description: "The aspect ratio (width / height)",
				table: {
					category: "Appearance",
					defaultValue: { summary: "1" },
				},
			},
		},
		args: {
			ratio: 16 / 9,
		},
	});
</script>

<!-- Default (16:9) -->
<Story name="Default">
	{#snippet template(args)}
		<div class="w-[450px]">
			<AspectRatio {...args}>
				<img
					src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
					alt="Gray abstract texture by Drew Beamer"
					class="h-full w-full rounded-md object-cover"
				/>
			</AspectRatio>
		</div>
	{/snippet}
</Story>

<!-- Square (1:1) -->
<Story name="Square" args={{ ratio: 1 }}>
	{#snippet template(args)}
		<div class="w-[300px]">
			<AspectRatio {...args}>
				<img
					src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
					alt="Gray abstract texture by Drew Beamer"
					class="h-full w-full rounded-md object-cover"
				/>
			</AspectRatio>
		</div>
	{/snippet}
</Story>

<!-- Portrait (3:4) -->
<Story name="Portrait" args={{ ratio: 3 / 4 }}>
	{#snippet template(args)}
		<div class="w-[250px]">
			<AspectRatio {...args}>
				<img
					src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
					alt="Gray abstract texture by Drew Beamer"
					class="h-full w-full rounded-md object-cover"
				/>
			</AspectRatio>
		</div>
	{/snippet}
</Story>

<!-- Cinematic (21:9) -->
<Story name="Cinematic" args={{ ratio: 21 / 9 }}>
	{#snippet template(args)}
		<div class="w-[500px]">
			<AspectRatio {...args}>
				<img
					src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
					alt="Gray abstract texture by Drew Beamer"
					class="h-full w-full rounded-md object-cover"
				/>
			</AspectRatio>
		</div>
	{/snippet}
</Story>

<!-- All Common Ratios -->
<Story name="All Common Ratios" asChild>
	<div class="grid grid-cols-2 gap-6">
		<div>
			<p class="mb-2 text-sm font-medium">1:1 (Square)</p>
			<AspectRatio ratio={1}>
				<div class="flex h-full w-full items-center justify-center rounded-md bg-muted">
					<span class="text-muted-foreground">1:1</span>
				</div>
			</AspectRatio>
		</div>
		<div>
			<p class="mb-2 text-sm font-medium">4:3 (Classic)</p>
			<AspectRatio ratio={4 / 3}>
				<div class="flex h-full w-full items-center justify-center rounded-md bg-muted">
					<span class="text-muted-foreground">4:3</span>
				</div>
			</AspectRatio>
		</div>
		<div>
			<p class="mb-2 text-sm font-medium">16:9 (Widescreen)</p>
			<AspectRatio ratio={16 / 9}>
				<div class="flex h-full w-full items-center justify-center rounded-md bg-muted">
					<span class="text-muted-foreground">16:9</span>
				</div>
			</AspectRatio>
		</div>
		<div>
			<p class="mb-2 text-sm font-medium">21:9 (Cinematic)</p>
			<AspectRatio ratio={21 / 9}>
				<div class="flex h-full w-full items-center justify-center rounded-md bg-muted">
					<span class="text-muted-foreground">21:9</span>
				</div>
			</AspectRatio>
		</div>
	</div>
</Story>

<!-- Video Embed -->
<Story name="Video Embed" args={{ ratio: 16 / 9 }}>
	{#snippet template(args)}
		<div class="w-[500px]">
			<AspectRatio {...args}>
				<div class="flex h-full w-full items-center justify-center rounded-md bg-black">
					<div class="text-center text-white">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="48"
							height="48"
							viewBox="0 0 24 24"
							fill="currentColor"
							class="mx-auto"
						>
							<polygon points="5 3 19 12 5 21 5 3" />
						</svg>
						<p class="mt-2 text-sm">Video Player Placeholder</p>
					</div>
				</div>
			</AspectRatio>
		</div>
	{/snippet}
</Story>

<!-- Map Container -->
<Story name="Map Container" args={{ ratio: 4 / 3 }}>
	{#snippet template(args)}
		<div class="w-[400px]">
			<AspectRatio {...args}>
				<div
					class="flex h-full w-full items-center justify-center rounded-md bg-gradient-to-br from-blue-100 to-green-100"
				>
					<div class="text-center">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="32"
							height="32"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="mx-auto text-muted-foreground"
						>
							<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
							<circle cx="12" cy="10" r="3" />
						</svg>
						<p class="mt-2 text-sm text-muted-foreground">Map Placeholder</p>
					</div>
				</div>
			</AspectRatio>
		</div>
	{/snippet}
</Story>

<!-- Card with Image -->
<Story name="Card with Image" args={{ ratio: 16 / 9 }}>
	{#snippet template(args)}
		<div class="w-[350px] overflow-hidden rounded-lg border">
			<AspectRatio {...args}>
				<img
					src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
					alt="Gray abstract texture by Drew Beamer"
					class="h-full w-full object-cover"
				/>
			</AspectRatio>
			<div class="p-4">
				<h3 class="font-semibold">Card Title</h3>
				<p class="text-sm text-muted-foreground">
					The aspect ratio ensures the image always maintains its proportions.
				</p>
			</div>
		</div>
	{/snippet}
</Story>

<!-- Playground -->
<Story name="Playground">
	{#snippet template(args)}
		<div class="w-[400px]">
			<AspectRatio {...args}>
				<div class="flex h-full w-full items-center justify-center rounded-md bg-muted">
					<span class="text-muted-foreground">Ratio: {args.ratio?.toFixed(2)}</span>
				</div>
			</AspectRatio>
		</div>
	{/snippet}
</Story>
