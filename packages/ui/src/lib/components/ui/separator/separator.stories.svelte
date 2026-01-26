<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Separator } from './index.ts';

	const { Story } = defineMeta({
		title: 'Components/Base/Separator',
		component: Separator,
		tags: ['autodocs'],
		argTypes: {
			orientation: {
				control: { type: 'select' },
				options: ['horizontal', 'vertical'],
				description: 'The orientation of the separator',
				table: {
					category: 'Appearance',
					defaultValue: { summary: 'horizontal' }
				}
			},
			decorative: {
				control: 'boolean',
				description: 'Whether the separator is purely decorative',
				table: {
					category: 'Accessibility',
					defaultValue: { summary: 'true' }
				}
			}
		},
		args: {
			orientation: 'horizontal'
		}
	});
</script>

<!-- Default (Horizontal) -->
<Story name="Default">
	{#snippet template(args)}
		<div class={args.orientation === 'vertical' ? 'flex h-20 items-center' : 'w-full max-w-md'}>
			<Separator {...args} />
		</div>
	{/snippet}
</Story>

<!-- Horizontal -->
<Story name="Horizontal" asChild>
	<div class="max-w-md space-y-4">
		<div>
			<h4 class="text-sm font-medium">Section 1</h4>
			<p class="text-sm text-muted-foreground">Content for section 1</p>
		</div>
		<Separator />
		<div>
			<h4 class="text-sm font-medium">Section 2</h4>
			<p class="text-sm text-muted-foreground">Content for section 2</p>
		</div>
		<Separator />
		<div>
			<h4 class="text-sm font-medium">Section 3</h4>
			<p class="text-sm text-muted-foreground">Content for section 3</p>
		</div>
	</div>
</Story>

<!-- Vertical -->
<Story name="Vertical" asChild>
	<div class="flex h-5 items-center space-x-4 text-sm">
		<span>Home</span>
		<Separator orientation="vertical" />
		<span>About</span>
		<Separator orientation="vertical" />
		<span>Services</span>
		<Separator orientation="vertical" />
		<span>Contact</span>
	</div>
</Story>

<!-- With Text -->
<Story name="With Text" asChild>
	<div class="max-w-md">
		<div class="space-y-1">
			<h4 class="text-sm leading-none font-medium">Radix Primitives</h4>
			<p class="text-sm text-muted-foreground">An open-source UI component library.</p>
		</div>
		<Separator class="my-4" />
		<div class="flex h-5 items-center space-x-4 text-sm">
			<div>Blog</div>
			<Separator orientation="vertical" />
			<div>Docs</div>
			<Separator orientation="vertical" />
			<div>Source</div>
		</div>
	</div>
</Story>

<!-- In List -->
<Story name="In List" asChild>
	<div class="max-w-sm">
		<ul class="divide-y divide-transparent">
			<li class="py-2">
				<div class="font-medium">Item 1</div>
				<div class="text-sm text-muted-foreground">Description for item 1</div>
			</li>
			<Separator />
			<li class="py-2">
				<div class="font-medium">Item 2</div>
				<div class="text-sm text-muted-foreground">Description for item 2</div>
			</li>
			<Separator />
			<li class="py-2">
				<div class="font-medium">Item 3</div>
				<div class="text-sm text-muted-foreground">Description for item 3</div>
			</li>
		</ul>
	</div>
</Story>

<!-- Playground -->
<Story name="Playground">
	{#snippet template(args)}
		<div class={args.orientation === 'vertical' ? 'flex h-20 items-center' : 'w-full max-w-md'}>
			<Separator {...args} />
		</div>
	{/snippet}
</Story>
