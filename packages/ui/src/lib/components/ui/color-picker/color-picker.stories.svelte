<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { ColorPicker } from './index.ts';
	import { Label } from '../label/index.ts';

	const { Story } = defineMeta({
		title: 'Components/Forms/ColorPicker',
		component: ColorPicker,
		tags: ['autodocs'],
		argTypes: {
			value: {
				control: 'color',
				description: 'The selected color value in hex format',
				table: {
					category: 'State',
					defaultValue: { summary: '#000000' }
				}
			},
			disabled: {
				control: 'boolean',
				description: 'Whether the color picker is disabled',
				table: {
					category: 'State',
					defaultValue: { summary: 'false' }
				}
			},
			placeholder: {
				control: 'text',
				description: 'Placeholder text for the input',
				table: {
					category: 'Content'
				}
			}
		},
		args: {
			value: '#3b82f6',
			disabled: false,
			placeholder: ''
		}
	});
</script>

<!-- Default -->
<Story name="Default">
	{#snippet template(args)}
		<ColorPicker {...args} class="w-full max-w-[200px]" />
	{/snippet}
</Story>

<!-- With Label -->
<Story name="With Label">
	{#snippet template(args)}
		<div class="grid w-full max-w-sm gap-1.5">
			<Label for="brand-color">Brand Color</Label>
			<ColorPicker id="brand-color" value={args.value} class="w-full" />
		</div>
	{/snippet}
</Story>

<!-- Various Colors -->
<Story name="Various Colors" asChild>
	<div class="grid w-full max-w-md grid-cols-2 gap-4">
		<div class="space-y-1.5">
			<Label class="text-xs text-muted-foreground">Primary</Label>
			<ColorPicker value="#3b82f6" class="w-full" />
		</div>
		<div class="space-y-1.5">
			<Label class="text-xs text-muted-foreground">Success</Label>
			<ColorPicker value="#22c55e" class="w-full" />
		</div>
		<div class="space-y-1.5">
			<Label class="text-xs text-muted-foreground">Warning</Label>
			<ColorPicker value="#f59e0b" class="w-full" />
		</div>
		<div class="space-y-1.5">
			<Label class="text-xs text-muted-foreground">Destructive</Label>
			<ColorPicker value="#ef4444" class="w-full" />
		</div>
	</div>
</Story>

<!-- Disabled -->
<Story name="Disabled" args={{ value: '#6b7280', disabled: true }}>
	{#snippet template(args)}
		<ColorPicker {...args} class="w-full max-w-[200px]" />
	{/snippet}
</Story>

<!-- With Placeholder -->
<Story name="With Placeholder" args={{ value: '', placeholder: 'Enter color' }}>
	{#snippet template(args)}
		<ColorPicker {...args} class="w-full max-w-[200px]" />
	{/snippet}
</Story>

<!-- Grayscale Colors -->
<Story name="Grayscale Colors" asChild>
	<div class="flex w-full max-w-[200px] flex-col gap-3">
		<ColorPicker value="#ffffff" />
		<ColorPicker value="#f5f5f5" />
		<ColorPicker value="#a3a3a3" />
		<ColorPicker value="#525252" />
		<ColorPicker value="#171717" />
		<ColorPicker value="#000000" />
	</div>
</Story>

<!-- Theme Colors Example -->
<Story name="Theme Colors Example">
	{#snippet template()}
		<div class="w-full max-w-md space-y-4">
			<h3 class="text-lg font-medium">Theme Configuration</h3>
			<div class="grid gap-4 rounded-lg border p-4">
				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-1.5">
						<Label for="bg-color">Background</Label>
						<ColorPicker id="bg-color" value="#ffffff" class="w-full" />
					</div>
					<div class="space-y-1.5">
						<Label for="fg-color">Foreground</Label>
						<ColorPicker id="fg-color" value="#171717" class="w-full" />
					</div>
				</div>
				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-1.5">
						<Label for="primary-color">Primary</Label>
						<ColorPicker id="primary-color" value="#3b82f6" class="w-full" />
					</div>
					<div class="space-y-1.5">
						<Label for="secondary-color">Secondary</Label>
						<ColorPicker id="secondary-color" value="#6366f1" class="w-full" />
					</div>
				</div>
				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-1.5">
						<Label for="accent-color">Accent</Label>
						<ColorPicker id="accent-color" value="#8b5cf6" class="w-full" />
					</div>
					<div class="space-y-1.5">
						<Label for="muted-color">Muted</Label>
						<ColorPicker id="muted-color" value="#f5f5f5" class="w-full" />
					</div>
				</div>
			</div>
		</div>
	{/snippet}
</Story>

<!-- Form Example -->
<Story name="Form Example">
	{#snippet template()}
		<form class="w-full max-w-sm space-y-4">
			<div class="space-y-2">
				<Label for="header-bg">Header Background</Label>
				<ColorPicker id="header-bg" value="#1e293b" class="w-full" />
				<p class="text-xs text-muted-foreground">Color for the page header background</p>
			</div>
			<div class="space-y-2">
				<Label for="link-color">Link Color</Label>
				<ColorPicker id="link-color" value="#3b82f6" class="w-full" />
				<p class="text-xs text-muted-foreground">Color for all hyperlinks</p>
			</div>
			<div class="space-y-2">
				<Label for="button-color">Button Color</Label>
				<ColorPicker id="button-color" value="#22c55e" class="w-full" />
				<p class="text-xs text-muted-foreground">Primary button color</p>
			</div>
		</form>
	{/snippet}
</Story>

<!-- Playground -->
<Story name="Playground">
	{#snippet template(args)}
		<ColorPicker {...args} class="w-full max-w-[200px]" />
	{/snippet}
</Story>
