<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Textarea } from './index.js';
	import { Label } from '../label/index.js';

	const { Story } = defineMeta({
		title: 'Components/Base/Textarea',
		component: Textarea,
		tags: ['autodocs'],
		argTypes: {
			placeholder: {
				control: 'text',
				description: 'Placeholder text',
				table: { category: 'Content' }
			},
			disabled: {
				control: 'boolean',
				description: 'Whether the textarea is disabled',
				table: {
					category: 'State',
					defaultValue: { summary: 'false' }
				}
			},
			rows: {
				control: 'number',
				description: 'Number of visible rows',
				table: { category: 'Appearance' }
			}
		},
		args: {
			placeholder: 'Enter text...',
			disabled: false
		}
	});
</script>

<!-- Default -->
<Story name="Default"></Story>

<!-- With Label -->
<Story name="With Label" asChild>
	<div class="max-w-md space-y-1">
		<Label for="message">Your Message</Label>
		<Textarea id="message" placeholder="Write your message here..." />
	</div>
</Story>

<!-- States -->
<Story name="States" asChild>
	<div class="flex max-w-md flex-col gap-4">
		<div class="space-y-1">
			<Label>Normal</Label>
			<Textarea placeholder="Normal textarea" />
		</div>
		<div class="space-y-1">
			<Label>Disabled</Label>
			<Textarea placeholder="Disabled textarea" disabled />
		</div>
		<div class="space-y-1">
			<Label>Invalid</Label>
			<Textarea placeholder="Invalid textarea" aria-invalid="true" />
		</div>
		<div class="space-y-1">
			<Label>Read Only</Label>
			<Textarea value="This content is read only and cannot be edited." readonly />
		</div>
	</div>
</Story>

<!-- With Character Count -->
<Story name="With Character Count" asChild>
	{@const maxLength = 280}
	<div class="max-w-md space-y-1">
		<Label for="bio">Bio</Label>
		<Textarea id="bio" placeholder="Tell us about yourself..." maxlength={maxLength} />
		<p class="text-right text-sm text-muted-foreground">Max {maxLength} characters</p>
	</div>
</Story>

<!-- Playground -->
<Story name="Playground"></Story>
