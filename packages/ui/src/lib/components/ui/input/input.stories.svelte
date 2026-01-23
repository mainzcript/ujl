<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Input } from './index.js';
	import { Label } from '../label/index.js';

	const { Story } = defineMeta({
		title: 'Components/Base/Input',
		component: Input,
		tags: ['autodocs'],
		argTypes: {
			type: {
				control: { type: 'select' },
				options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search', 'date', 'file'],
				description: 'The type of input',
				table: {
					category: 'Behavior',
					defaultValue: { summary: 'text' }
				}
			},
			placeholder: {
				control: 'text',
				description: 'Placeholder text',
				table: { category: 'Content' }
			},
			disabled: {
				control: 'boolean',
				description: 'Whether the input is disabled',
				table: {
					category: 'State',
					defaultValue: { summary: 'false' }
				}
			},
			required: {
				control: 'boolean',
				description: 'Whether the input is required',
				table: { category: 'Validation' }
			}
		},
		args: {
			type: 'text',
			placeholder: 'Enter text...',
			disabled: false
		}
	});
</script>

<!-- Default -->
<Story name="Default">
	{#snippet template(args)}
		<div class="max-w-sm">
			<Input {...args} />
		</div>
	{/snippet}
</Story>

<!-- All Types -->
<Story name="All Types" asChild>
	<div class="flex max-w-sm flex-col gap-4">
		<div class="space-y-1">
			<Label>Text</Label>
			<Input type="text" placeholder="Text input" />
		</div>
		<div class="space-y-1">
			<Label>Email</Label>
			<Input type="email" placeholder="email@example.com" />
		</div>
		<div class="space-y-1">
			<Label>Password</Label>
			<Input type="password" placeholder="Enter password" />
		</div>
		<div class="space-y-1">
			<Label>Number</Label>
			<Input type="number" placeholder="0" />
		</div>
		<div class="space-y-1">
			<Label>Search</Label>
			<Input type="search" placeholder="Search..." />
		</div>
		<div class="space-y-1">
			<Label>Date</Label>
			<Input type="date" />
		</div>
	</div>
</Story>

<!-- With Label -->
<Story name="With Label" asChild>
	<div class="max-w-sm space-y-1">
		<Label for="email">Email Address</Label>
		<Input id="email" type="email" placeholder="you@example.com" />
	</div>
</Story>

<!-- States -->
<Story name="States" asChild>
	<div class="flex max-w-sm flex-col gap-4">
		<div class="space-y-1">
			<Label>Normal</Label>
			<Input placeholder="Normal input" />
		</div>
		<div class="space-y-1">
			<Label>Disabled</Label>
			<Input placeholder="Disabled input" disabled />
		</div>
		<div class="space-y-1">
			<Label>Invalid</Label>
			<Input placeholder="Invalid input" aria-invalid="true" />
		</div>
		<div class="space-y-1">
			<Label>Read Only</Label>
			<Input value="Read only value" readonly />
		</div>
	</div>
</Story>

<!-- File Input -->
<Story name="File Input" asChild>
	<div class="max-w-sm space-y-1">
		<Label for="file">Upload File</Label>
		<Input id="file" type="file" />
	</div>
</Story>

<!-- Playground -->
<Story name="Playground">
	{#snippet template(args)}
		<div class="max-w-sm">
			<Input {...args} />
		</div>
	{/snippet}
</Story>
