<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import {
		Collapsible,
		CollapsibleTrigger,
		CollapsibleContent,
		CollapsibleTriggerButton
	} from './index.ts';

	const { Story } = defineMeta({
		title: 'Components/Layout/Collapsible',
		component: Collapsible,
		tags: ['autodocs'],
		argTypes: {
			open: {
				control: 'boolean',
				description: 'Whether the collapsible is open',
				table: {
					category: 'State',
					defaultValue: { summary: 'false' }
				}
			}
		},
		args: {
			open: false
		}
	});
</script>

<!-- Default -->
<Story name="Default">
	{#snippet template(args)}
		<Collapsible open={args.open} class="w-[350px] space-y-2">
			<div class="flex items-center justify-between space-x-4 px-4">
				<h4 class="text-sm font-semibold">@johndoe starred 3 repositories</h4>
				<CollapsibleTriggerButton variant="ghost" size="sm">
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
						<path d="m7 15 5 5 5-5" />
						<path d="m7 9 5-5 5 5" />
					</svg>
					<span class="sr-only">Toggle</span>
				</CollapsibleTriggerButton>
			</div>
			<div class="rounded-md border px-4 py-2 font-mono text-sm shadow-sm">@sveltejs/kit</div>
			<CollapsibleContent class="space-y-2">
				<div class="rounded-md border px-4 py-2 font-mono text-sm shadow-sm">
					@sveltejs/adapter-auto
				</div>
				<div class="rounded-md border px-4 py-2 font-mono text-sm shadow-sm">
					@sveltejs/vite-plugin-svelte
				</div>
			</CollapsibleContent>
		</Collapsible>
	{/snippet}
</Story>

<!-- Initially Open -->
<Story name="Initially Open">
	{#snippet template()}
		<Collapsible open={true} class="w-[350px] space-y-2">
			<div class="flex items-center justify-between space-x-4 px-4">
				<h4 class="text-sm font-semibold">Recent files</h4>
				<CollapsibleTriggerButton variant="ghost" size="sm">
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
						<path d="m7 15 5 5 5-5" />
						<path d="m7 9 5-5 5 5" />
					</svg>
					<span class="sr-only">Toggle</span>
				</CollapsibleTriggerButton>
			</div>
			<CollapsibleContent class="space-y-2">
				<div class="rounded-md border px-4 py-2 text-sm shadow-sm">
					<span class="font-medium">document.pdf</span>
					<span class="text-muted-foreground"> - 2 hours ago</span>
				</div>
				<div class="rounded-md border px-4 py-2 text-sm shadow-sm">
					<span class="font-medium">image.png</span>
					<span class="text-muted-foreground"> - Yesterday</span>
				</div>
				<div class="rounded-md border px-4 py-2 text-sm shadow-sm">
					<span class="font-medium">report.xlsx</span>
					<span class="text-muted-foreground"> - 3 days ago</span>
				</div>
			</CollapsibleContent>
		</Collapsible>
	{/snippet}
</Story>

<!-- Custom Trigger -->
<Story name="Custom Trigger">
	{#snippet template()}
		<Collapsible class="w-[350px] space-y-2">
			<CollapsibleTrigger class="w-full">
				<div
					class="flex w-full cursor-pointer items-center justify-between rounded-md border px-4 py-3 hover:bg-muted/50"
				>
					<div class="flex items-center gap-3">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="text-muted-foreground"
						>
							<path
								d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
							/>
							<circle cx="12" cy="12" r="3" />
						</svg>
						<span class="font-medium">Advanced Settings</span>
					</div>
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
						class="text-muted-foreground"
					>
						<path d="m6 9 6 6 6-6" />
					</svg>
				</div>
			</CollapsibleTrigger>
			<CollapsibleContent>
				<div class="space-y-3 rounded-md border p-4">
					<div class="flex items-center justify-between">
						<span class="text-sm">Enable debug mode</span>
						<input type="checkbox" class="rounded" />
					</div>
					<div class="flex items-center justify-between">
						<span class="text-sm">Show developer tools</span>
						<input type="checkbox" class="rounded" />
					</div>
					<div class="flex items-center justify-between">
						<span class="text-sm">Enable experimental features</span>
						<input type="checkbox" class="rounded" />
					</div>
				</div>
			</CollapsibleContent>
		</Collapsible>
	{/snippet}
</Story>

<!-- Nested Collapsibles -->
<Story name="Nested Collapsibles">
	{#snippet template()}
		<Collapsible class="w-[350px] space-y-2">
			<div class="flex items-center justify-between rounded-md border px-4 py-2">
				<h4 class="text-sm font-semibold">Categories</h4>
				<CollapsibleTriggerButton variant="ghost" size="sm">
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
						<path d="m6 9 6 6 6-6" />
					</svg>
				</CollapsibleTriggerButton>
			</div>
			<CollapsibleContent class="space-y-2 pl-4">
				<Collapsible class="space-y-2">
					<div class="flex items-center justify-between rounded-md border px-4 py-2">
						<span class="text-sm">Electronics</span>
						<CollapsibleTriggerButton variant="ghost" size="sm">
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
								<path d="m6 9 6 6 6-6" />
							</svg>
						</CollapsibleTriggerButton>
					</div>
					<CollapsibleContent class="space-y-1 pl-4">
						<div class="rounded-md border px-4 py-2 text-sm">Phones</div>
						<div class="rounded-md border px-4 py-2 text-sm">Laptops</div>
						<div class="rounded-md border px-4 py-2 text-sm">Tablets</div>
					</CollapsibleContent>
				</Collapsible>
				<Collapsible class="space-y-2">
					<div class="flex items-center justify-between rounded-md border px-4 py-2">
						<span class="text-sm">Clothing</span>
						<CollapsibleTriggerButton variant="ghost" size="sm">
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
								<path d="m6 9 6 6 6-6" />
							</svg>
						</CollapsibleTriggerButton>
					</div>
					<CollapsibleContent class="space-y-1 pl-4">
						<div class="rounded-md border px-4 py-2 text-sm">Men</div>
						<div class="rounded-md border px-4 py-2 text-sm">Women</div>
						<div class="rounded-md border px-4 py-2 text-sm">Kids</div>
					</CollapsibleContent>
				</Collapsible>
			</CollapsibleContent>
		</Collapsible>
	{/snippet}
</Story>

<!-- FAQ Style -->
<Story name="FAQ Style">
	{#snippet template()}
		<div class="w-full max-w-md space-y-2">
			<Collapsible class="rounded-lg border">
				<CollapsibleTrigger class="w-full">
					<div class="flex w-full items-center justify-between px-4 py-3 hover:bg-muted/50">
						<span class="text-left font-medium">What is your return policy?</span>
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
							class="shrink-0 text-muted-foreground"
						>
							<path d="m6 9 6 6 6-6" />
						</svg>
					</div>
				</CollapsibleTrigger>
				<CollapsibleContent>
					<div class="px-4 pb-3 text-sm text-muted-foreground">
						We offer a 30-day return policy for all unused items in their original packaging. Simply
						contact our support team to initiate a return.
					</div>
				</CollapsibleContent>
			</Collapsible>
			<Collapsible class="rounded-lg border">
				<CollapsibleTrigger class="w-full">
					<div class="flex w-full items-center justify-between px-4 py-3 hover:bg-muted/50">
						<span class="text-left font-medium">How long does shipping take?</span>
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
							class="shrink-0 text-muted-foreground"
						>
							<path d="m6 9 6 6 6-6" />
						</svg>
					</div>
				</CollapsibleTrigger>
				<CollapsibleContent>
					<div class="px-4 pb-3 text-sm text-muted-foreground">
						Standard shipping takes 5-7 business days. Express shipping is available for 2-3
						business day delivery at an additional cost.
					</div>
				</CollapsibleContent>
			</Collapsible>
			<Collapsible class="rounded-lg border">
				<CollapsibleTrigger class="w-full">
					<div class="flex w-full items-center justify-between px-4 py-3 hover:bg-muted/50">
						<span class="text-left font-medium">Do you offer international shipping?</span>
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
							class="shrink-0 text-muted-foreground"
						>
							<path d="m6 9 6 6 6-6" />
						</svg>
					</div>
				</CollapsibleTrigger>
				<CollapsibleContent>
					<div class="px-4 pb-3 text-sm text-muted-foreground">
						Yes, we ship to over 100 countries worldwide. International shipping rates and delivery
						times vary by location.
					</div>
				</CollapsibleContent>
			</Collapsible>
		</div>
	{/snippet}
</Story>

<!-- Playground -->
<Story name="Playground">
	{#snippet template(args)}
		<Collapsible open={args.open} class="w-[350px] space-y-2">
			<div class="flex items-center justify-between px-4">
				<h4 class="text-sm font-semibold">Collapsible Section</h4>
				<CollapsibleTriggerButton variant="ghost" size="sm">
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
						<path d="m6 9 6 6 6-6" />
					</svg>
				</CollapsibleTriggerButton>
			</div>
			<CollapsibleContent>
				<div class="rounded-md border px-4 py-3 text-sm">
					This content is collapsible. Use the controls to toggle the open state.
				</div>
			</CollapsibleContent>
		</Collapsible>
	{/snippet}
</Story>
