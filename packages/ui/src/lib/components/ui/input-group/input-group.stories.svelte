<script module lang="ts">
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import {
		InputGroup,
		InputGroupAddon,
		InputGroupButton,
		InputGroupInput,
		InputGroupText,
		InputGroupTextarea,
	} from "./index.ts";
	import { Label } from "../label/index.ts";
	import { Kbd } from "../kbd/index.ts";

	const { Story } = defineMeta({
		title: "Components/Forms/InputGroup",
		component: InputGroup,
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
		<InputGroup class="w-full max-w-sm">
			<InputGroupInput placeholder="Enter text..." />
		</InputGroup>
	{/snippet}
</Story>

<!-- With Text Addon (Start) -->
<Story name="With Text Addon Start">
	{#snippet template()}
		<InputGroup class="w-full max-w-sm">
			<InputGroupAddon align="inline-start">
				<InputGroupText>https://</InputGroupText>
			</InputGroupAddon>
			<InputGroupInput placeholder="example.com" />
		</InputGroup>
	{/snippet}
</Story>

<!-- With Text Addon (End) -->
<Story name="With Text Addon End">
	{#snippet template()}
		<InputGroup class="w-full max-w-sm">
			<InputGroupInput placeholder="Enter amount" />
			<InputGroupAddon align="inline-end">
				<InputGroupText>USD</InputGroupText>
			</InputGroupAddon>
		</InputGroup>
	{/snippet}
</Story>

<!-- With Both Addons -->
<Story name="With Both Addons">
	{#snippet template()}
		<InputGroup class="w-full max-w-sm">
			<InputGroupAddon align="inline-start">
				<InputGroupText>$</InputGroupText>
			</InputGroupAddon>
			<InputGroupInput placeholder="0.00" type="number" />
			<InputGroupAddon align="inline-end">
				<InputGroupText>.00</InputGroupText>
			</InputGroupAddon>
		</InputGroup>
	{/snippet}
</Story>

<!-- With Icon Button -->
<Story name="With Icon Button">
	{#snippet template()}
		<InputGroup class="w-full max-w-sm">
			<InputGroupInput placeholder="Search..." />
			<InputGroupAddon align="inline-end">
				<InputGroupButton size="icon-xs">
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
						<circle cx="11" cy="11" r="8" />
						<path d="m21 21-4.3-4.3" />
					</svg>
				</InputGroupButton>
			</InputGroupAddon>
		</InputGroup>
	{/snippet}
</Story>

<!-- With Button -->
<Story name="With Button">
	{#snippet template()}
		<InputGroup class="w-full max-w-sm">
			<InputGroupInput placeholder="Enter email..." type="email" />
			<InputGroupAddon align="inline-end">
				<InputGroupButton variant="primary">Subscribe</InputGroupButton>
			</InputGroupAddon>
		</InputGroup>
	{/snippet}
</Story>

<!-- With Keyboard Shortcut -->
<Story name="With Keyboard Shortcut">
	{#snippet template()}
		<InputGroup class="w-full max-w-sm">
			<InputGroupAddon align="inline-start">
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
					<circle cx="11" cy="11" r="8" />
					<path d="m21 21-4.3-4.3" />
				</svg>
			</InputGroupAddon>
			<InputGroupInput placeholder="Search..." />
			<InputGroupAddon align="inline-end">
				<Kbd>Ctrl</Kbd>
				<Kbd>K</Kbd>
			</InputGroupAddon>
		</InputGroup>
	{/snippet}
</Story>

<!-- With Icon Start -->
<Story name="With Icon Start">
	{#snippet template()}
		<InputGroup class="w-full max-w-sm">
			<InputGroupAddon align="inline-start">
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
					<rect width="20" height="16" x="2" y="4" rx="2" />
					<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
				</svg>
			</InputGroupAddon>
			<InputGroupInput placeholder="Email address" type="email" />
		</InputGroup>
	{/snippet}
</Story>

<!-- Password Input -->
<Story name="Password Input">
	{#snippet template()}
		<InputGroup class="w-full max-w-sm">
			<InputGroupAddon align="inline-start">
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
					<rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
					<path d="M7 11V7a5 5 0 0 1 10 0v4" />
				</svg>
			</InputGroupAddon>
			<InputGroupInput placeholder="Password" type="password" />
			<InputGroupAddon align="inline-end">
				<InputGroupButton size="icon-xs">
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
						<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
						<circle cx="12" cy="12" r="3" />
					</svg>
				</InputGroupButton>
			</InputGroupAddon>
		</InputGroup>
	{/snippet}
</Story>

<!-- With Textarea -->
<Story name="With Textarea">
	{#snippet template()}
		<InputGroup class="w-full max-w-sm">
			<InputGroupAddon align="block-start">
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
					<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
				</svg>
				<InputGroupText>Message</InputGroupText>
			</InputGroupAddon>
			<InputGroupTextarea placeholder="Enter your message..." rows={4} />
		</InputGroup>
	{/snippet}
</Story>

<!-- Block Alignment -->
<Story name="Block Alignment">
	{#snippet template()}
		<div class="flex w-full max-w-sm flex-col gap-4">
			<InputGroup>
				<InputGroupAddon align="block-start">
					<InputGroupText>Block Start Addon</InputGroupText>
				</InputGroupAddon>
				<InputGroupInput placeholder="Enter text..." />
			</InputGroup>
			<InputGroup>
				<InputGroupInput placeholder="Enter text..." />
				<InputGroupAddon align="block-end">
					<InputGroupText>Block End Addon</InputGroupText>
				</InputGroupAddon>
			</InputGroup>
		</div>
	{/snippet}
</Story>

<!-- Form Example -->
<Story name="Form Example">
	{#snippet template()}
		<form class="w-full max-w-sm space-y-4">
			<div class="space-y-2">
				<Label for="website">Website</Label>
				<InputGroup>
					<InputGroupAddon align="inline-start">
						<InputGroupText>https://</InputGroupText>
					</InputGroupAddon>
					<InputGroupInput id="website" placeholder="www.example.com" />
				</InputGroup>
			</div>
			<div class="space-y-2">
				<Label for="price">Price</Label>
				<InputGroup>
					<InputGroupAddon align="inline-start">
						<InputGroupText>$</InputGroupText>
					</InputGroupAddon>
					<InputGroupInput id="price" placeholder="0.00" type="number" />
					<InputGroupAddon align="inline-end">
						<InputGroupText>USD</InputGroupText>
					</InputGroupAddon>
				</InputGroup>
			</div>
			<div class="space-y-2">
				<Label for="email">Email Newsletter</Label>
				<InputGroup>
					<InputGroupAddon align="inline-start">
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
							<rect width="20" height="16" x="2" y="4" rx="2" />
							<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
						</svg>
					</InputGroupAddon>
					<InputGroupInput id="email" placeholder="you@example.com" type="email" />
					<InputGroupAddon align="inline-end">
						<InputGroupButton variant="primary">Subscribe</InputGroupButton>
					</InputGroupAddon>
				</InputGroup>
			</div>
		</form>
	{/snippet}
</Story>

<!-- Playground -->
<Story name="Playground">
	{#snippet template()}
		<InputGroup class="w-full max-w-sm">
			<InputGroupAddon align="inline-start">
				<InputGroupText>@</InputGroupText>
			</InputGroupAddon>
			<InputGroupInput placeholder="username" />
		</InputGroup>
	{/snippet}
</Story>
