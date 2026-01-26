<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Label } from './index.ts';
	import { Input } from '../input/index.ts';
	import { Checkbox } from '../checkbox/index.ts';

	const { Story } = defineMeta({
		title: 'Components/Base/Label',
		component: Label,
		tags: ['autodocs'],
		argTypes: {
			for: {
				control: 'text',
				description: 'The ID of the form element this label is for',
				table: { category: 'Behavior' }
			}
		}
	});
</script>

<!-- Default -->
<Story name="Default">
	{#snippet template(args)}
		<Label {...args}>Label Text</Label>
	{/snippet}
</Story>

<!-- With Input -->
<Story name="With Input" asChild>
	<div class="max-w-sm space-y-1">
		<Label for="email">Email Address</Label>
		<Input id="email" type="email" placeholder="you@example.com" />
	</div>
</Story>

<!-- With Checkbox -->
<Story name="With Checkbox" asChild>
	<div class="flex items-center gap-2">
		<Checkbox id="terms" />
		<Label for="terms">Accept terms and conditions</Label>
	</div>
</Story>

<!-- Required Field -->
<Story name="Required Field" asChild>
	<div class="max-w-sm space-y-1">
		<Label for="required-field">
			Required Field
			<span class="text-destructive">*</span>
		</Label>
		<Input id="required-field" required />
	</div>
</Story>

<!-- With Description -->
<Story name="With Description" asChild>
	<div class="max-w-sm space-y-1">
		<Label for="username">Username</Label>
		<Input id="username" placeholder="Enter username" />
		<p class="text-sm text-muted-foreground">This will be your public display name.</p>
	</div>
</Story>

<!-- Disabled State -->
<Story name="Disabled State" asChild>
	<div class="group max-w-sm space-y-1" data-disabled="true">
		<Label for="disabled-input">Disabled Input</Label>
		<Input id="disabled-input" disabled placeholder="Disabled" />
	</div>
</Story>

<!-- Playground -->
<Story name="Playground">
	{#snippet template(args)}
		<Label {...args}>Label Text</Label>
	{/snippet}
</Story>
