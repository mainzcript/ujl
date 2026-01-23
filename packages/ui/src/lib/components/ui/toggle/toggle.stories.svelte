<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Toggle } from './index.js';

	const { Story } = defineMeta({
		title: 'Components/Base/Toggle',
		component: Toggle,
		tags: ['autodocs'],
		argTypes: {
			variant: {
				control: { type: 'select' },
				options: ['default', 'outline'],
				description: 'The visual style variant',
				table: {
					category: 'Appearance',
					defaultValue: { summary: 'default' }
				}
			},
			size: {
				control: { type: 'select' },
				options: ['default', 'sm', 'lg'],
				description: 'The size of the toggle',
				table: {
					category: 'Appearance',
					defaultValue: { summary: 'default' }
				}
			},
			pressed: {
				control: 'boolean',
				description: 'Whether the toggle is pressed',
				table: {
					category: 'State',
					defaultValue: { summary: 'false' }
				}
			},
			disabled: {
				control: 'boolean',
				description: 'Whether the toggle is disabled',
				table: {
					category: 'State',
					defaultValue: { summary: 'false' }
				}
			}
		},
		args: {
			variant: 'default',
			size: 'default',
			pressed: false,
			disabled: false
		}
	});
</script>

<!-- Default -->
<Story name="Default" asChild>
	<Toggle aria-label="Toggle bold">
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
			<path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
			<path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
		</svg>
	</Toggle>
</Story>

<!-- All Variants -->
<Story name="All Variants" asChild>
	<div class="flex gap-4">
		<Toggle variant="default" aria-label="Default variant">
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
				<path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
				<path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
			</svg>
		</Toggle>
		<Toggle variant="outline" aria-label="Outline variant">
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
				<path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
				<path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
			</svg>
		</Toggle>
	</div>
</Story>

<!-- All Sizes -->
<Story name="All Sizes" asChild>
	<div class="flex items-center gap-4">
		<Toggle size="sm" aria-label="Small toggle">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="14"
				height="14"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
				<path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
			</svg>
		</Toggle>
		<Toggle size="default" aria-label="Default toggle">
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
				<path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
				<path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
			</svg>
		</Toggle>
		<Toggle size="lg" aria-label="Large toggle">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="18"
				height="18"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
				<path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
			</svg>
		</Toggle>
	</div>
</Story>

<!-- With Text -->
<Story name="With Text" asChild>
	<div class="flex gap-2">
		<Toggle aria-label="Toggle bold">
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
				<path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
				<path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
			</svg>
			Bold
		</Toggle>
		<Toggle aria-label="Toggle italic">
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
				<line x1="19" x2="10" y1="4" y2="4" />
				<line x1="14" x2="5" y1="20" y2="20" />
				<line x1="15" x2="9" y1="4" y2="20" />
			</svg>
			Italic
		</Toggle>
		<Toggle aria-label="Toggle underline">
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
				<path d="M6 4v6a6 6 0 0 0 12 0V4" />
				<line x1="4" x2="20" y1="20" y2="20" />
			</svg>
			Underline
		</Toggle>
	</div>
</Story>

<!-- Disabled -->
<Story name="Disabled" asChild>
	<div class="flex gap-4">
		<Toggle disabled aria-label="Disabled unpressed">
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
				<path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
				<path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
			</svg>
		</Toggle>
		<Toggle disabled pressed={true} aria-label="Disabled pressed">
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
				<path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
				<path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
			</svg>
		</Toggle>
	</div>
</Story>

<!-- Text Editor Toolbar -->
<Story name="Text Editor Toolbar" asChild>
	<div class="flex w-fit gap-1 rounded-lg border p-1">
		<Toggle size="sm" aria-label="Bold" pressed={true}>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="14"
				height="14"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /><path
					d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"
				/></svg
			>
		</Toggle>
		<Toggle size="sm" aria-label="Italic">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="14"
				height="14"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				><line x1="19" x2="10" y1="4" y2="4" /><line x1="14" x2="5" y1="20" y2="20" /><line
					x1="15"
					x2="9"
					y1="4"
					y2="20"
				/></svg
			>
		</Toggle>
		<Toggle size="sm" aria-label="Underline">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="14"
				height="14"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				><path d="M6 4v6a6 6 0 0 0 12 0V4" /><line x1="4" x2="20" y1="20" y2="20" /></svg
			>
		</Toggle>
		<Toggle size="sm" aria-label="Strikethrough">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="14"
				height="14"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				><path d="M16 4H9a3 3 0 0 0-2.83 4" /><path d="M14 12a4 4 0 0 1 0 8H6" /><line
					x1="4"
					x2="20"
					y1="12"
					y2="12"
				/></svg
			>
		</Toggle>
	</div>
</Story>

<!-- Playground -->
<Story name="Playground" asChild>
	<Toggle aria-label="Toggle bold">
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
			<path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
			<path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
		</svg>
	</Toggle>
</Story>
