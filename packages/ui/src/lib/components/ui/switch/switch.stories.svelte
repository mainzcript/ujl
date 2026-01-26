<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Switch } from './index.ts';
	import { Label } from '../label/index.ts';

	const { Story } = defineMeta({
		title: 'Components/Base/Switch',
		component: Switch,
		tags: ['autodocs'],
		argTypes: {
			checked: {
				control: 'boolean',
				description: 'Whether the switch is checked',
				table: {
					category: 'State',
					defaultValue: { summary: 'false' }
				}
			},
			disabled: {
				control: 'boolean',
				description: 'Whether the switch is disabled',
				table: {
					category: 'State',
					defaultValue: { summary: 'false' }
				}
			},
			required: {
				control: 'boolean',
				description: 'Whether the switch is required',
				table: { category: 'Validation' }
			}
		},
		args: {
			checked: false,
			disabled: false
		}
	});
</script>

<!-- Default -->
<Story name="Default"></Story>

<!-- With Label -->
<Story name="With Label">
	{#snippet template(args)}
		<div class="flex items-center gap-2">
			<Switch id="airplane-mode" {...args} />
			<Label for="airplane-mode">Airplane Mode</Label>
		</div>
	{/snippet}
</Story>

<!-- Checked States -->
<Story name="Checked States" asChild>
	<div class="flex flex-col gap-4">
		<div class="flex items-center gap-2">
			<Switch id="unchecked" checked={false} />
			<Label for="unchecked">Unchecked</Label>
		</div>
		<div class="flex items-center gap-2">
			<Switch id="checked" checked={true} />
			<Label for="checked">Checked</Label>
		</div>
	</div>
</Story>

<!-- Disabled States -->
<Story name="Disabled States" asChild>
	<div class="flex flex-col gap-4">
		<div class="flex items-center gap-2">
			<Switch id="disabled-unchecked" disabled />
			<Label for="disabled-unchecked" class="opacity-50">Disabled Unchecked</Label>
		</div>
		<div class="flex items-center gap-2">
			<Switch id="disabled-checked" disabled checked={true} />
			<Label for="disabled-checked" class="opacity-50">Disabled Checked</Label>
		</div>
	</div>
</Story>

<!-- Settings Example -->
<Story name="Settings Example" asChild>
	<div class="max-w-sm space-y-4">
		<div class="flex items-center justify-between">
			<div class="space-y-0.5">
				<Label for="notifications">Notifications</Label>
				<p class="text-sm text-muted-foreground">Receive notifications about updates.</p>
			</div>
			<Switch id="notifications" />
		</div>
		<div class="flex items-center justify-between">
			<div class="space-y-0.5">
				<Label for="marketing">Marketing emails</Label>
				<p class="text-sm text-muted-foreground">Receive emails about new features.</p>
			</div>
			<Switch id="marketing" />
		</div>
		<div class="flex items-center justify-between">
			<div class="space-y-0.5">
				<Label for="security">Security alerts</Label>
				<p class="text-sm text-muted-foreground">Get notified about security issues.</p>
			</div>
			<Switch id="security" checked={true} />
		</div>
	</div>
</Story>

<!-- Form Example -->
<Story name="Form Example" asChild>
	<form class="max-w-sm space-y-4 rounded-lg border p-4">
		<h3 class="font-medium">Privacy Settings</h3>
		<div class="space-y-3">
			<div class="flex items-center justify-between">
				<Label for="profile-visible">Make profile visible</Label>
				<Switch id="profile-visible" checked={true} />
			</div>
			<div class="flex items-center justify-between">
				<Label for="show-email">Show email address</Label>
				<Switch id="show-email" />
			</div>
			<div class="flex items-center justify-between">
				<Label for="allow-indexing">Allow search engines</Label>
				<Switch id="allow-indexing" />
			</div>
		</div>
	</form>
</Story>

<!-- Playground -->
<Story name="Playground">
	{#snippet template(args)}
		<div class="flex items-center gap-2">
			<Switch id="playground" {...args} />
			<Label for="playground">Toggle me</Label>
		</div>
	{/snippet}
</Story>
