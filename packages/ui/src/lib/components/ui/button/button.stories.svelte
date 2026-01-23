<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Button } from './index.js';

	const { Story } = defineMeta({
		title: 'Components/Base/Button',
		component: Button,
		tags: ['autodocs'],
		argTypes: {
			variant: {
				control: { type: 'select' },
				options: [
					'default',
					'ambient',
					'primary',
					'secondary',
					'accent',
					'success',
					'warning',
					'destructive',
					'info',
					'muted',
					'outline',
					'ghost'
				],
				description: 'The visual style variant of the button',
				table: {
					category: 'Appearance',
					defaultValue: { summary: 'default' }
				}
			},
			size: {
				control: { type: 'select' },
				options: ['default', 'sm', 'lg', 'icon'],
				description: 'The size of the button',
				table: {
					category: 'Appearance',
					defaultValue: { summary: 'default' }
				}
			},
			disabled: {
				control: 'boolean',
				description: 'Whether the button is disabled',
				table: {
					category: 'State',
					defaultValue: { summary: 'false' }
				}
			},
			as: {
				control: { type: 'select' },
				options: ['button', 'a', 'div', 'span'],
				description: 'The element type to render',
				table: {
					category: 'Behavior',
					defaultValue: { summary: 'button' }
				}
			},
			href: {
				control: 'text',
				description: 'URL for link buttons (automatically sets as="a")',
				table: {
					category: 'Behavior'
				}
			}
		},
		args: {
			variant: 'default',
			size: 'default',
			disabled: false
		}
	});
</script>

<!-- Default -->
<Story name="Default">Button</Story>

<!-- All Variants -->
<Story name="All Variants" asChild>
	<div class="flex flex-wrap gap-4">
		<Button variant="default">Default</Button>
		<Button variant="ambient">Ambient</Button>
		<Button variant="primary">Primary</Button>
		<Button variant="secondary">Secondary</Button>
		<Button variant="accent">Accent</Button>
		<Button variant="success">Success</Button>
		<Button variant="warning">Warning</Button>
		<Button variant="destructive">Destructive</Button>
		<Button variant="info">Info</Button>
		<Button variant="muted">Muted</Button>
		<Button variant="outline">Outline</Button>
		<Button variant="ghost">Ghost</Button>
	</div>
</Story>

<!-- All Sizes -->
<Story name="All Sizes" asChild>
	<div class="flex items-center gap-4">
		<Button size="sm">Small</Button>
		<Button size="default">Default</Button>
		<Button size="lg">Large</Button>
		<Button size="icon">
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
				<path d="M5 12h14" />
				<path d="m12 5 7 7-7 7" />
			</svg>
		</Button>
	</div>
</Story>

<!-- Disabled State -->
<Story name="Disabled" asChild>
	<div class="flex flex-wrap gap-4">
		<Button disabled>Disabled Default</Button>
		<Button variant="primary" disabled>Disabled Primary</Button>
		<Button variant="outline" disabled>Disabled Outline</Button>
		<Button variant="ghost" disabled>Disabled Ghost</Button>
	</div>
</Story>

<!-- As Link -->
<Story name="As Link" asChild>
	<div class="flex gap-4">
		<Button href="https://example.com">Link Button</Button>
		<Button variant="outline" href="https://example.com">Outline Link</Button>
	</div>
</Story>

<!-- With Icons -->
<Story name="With Icons" asChild>
	<div class="flex gap-4">
		<Button>
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
				<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
				<polyline points="7 10 12 15 17 10" />
				<line x1="12" x2="12" y1="15" y2="3" />
			</svg>
			Download
		</Button>
		<Button variant="outline">
			Settings
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
				<path
					d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
				/>
				<circle cx="12" cy="12" r="3" />
			</svg>
		</Button>
	</div>
</Story>

<!-- Playground -->
<Story name="Playground">Button</Story>
