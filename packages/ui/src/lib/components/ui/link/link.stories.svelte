<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Link } from './index.js';

	const { Story } = defineMeta({
		title: 'Components/Base/Link',
		component: Link,
		tags: ['autodocs'],
		argTypes: {
			href: {
				control: 'text',
				description: 'The URL the link points to',
				table: {
					category: 'Behavior',
					defaultValue: { summary: '#' }
				}
			},
			external: {
				control: 'boolean',
				description: 'Opens link in new tab with noopener noreferrer',
				table: {
					category: 'Behavior',
					defaultValue: { summary: 'false' }
				}
			},
			underline: {
				control: 'boolean',
				description: 'Whether to show underline',
				table: { category: 'Appearance' }
			},
			active: {
				control: 'boolean',
				description: 'Force active state',
				table: { category: 'State' }
			},
			activeClass: {
				control: 'text',
				description: 'CSS class when link is active',
				table: { category: 'Appearance' }
			},
			inactiveClass: {
				control: 'text',
				description: 'CSS class when link is inactive',
				table: { category: 'Appearance' }
			}
		},
		args: {
			href: '#',
			external: false,
			currentUrl: undefined,
			underline: false,
			active: undefined
		}
	});
</script>

<!-- Default -->
<Story name="Default">Click me</Story>

<!-- With Underline -->
<Story name="With Underline" asChild>
	<div class="flex flex-col gap-2">
		<Link href="#" underline={true} active={undefined} currentUrl={undefined}>Underlined Link</Link>
		<Link href="#" underline={false} active={undefined} currentUrl={undefined}>No Underline</Link>
	</div>
</Story>

<!-- External Link -->
<Story name="External Link" asChild>
	<Link href="https://example.com" external currentUrl={undefined} active={undefined}>
		External Link
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
			class="ml-1 inline"
		>
			<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
			<polyline points="15 3 21 3 21 9" />
			<line x1="10" x2="21" y1="14" y2="3" />
		</svg>
	</Link>
</Story>

<!-- Active States -->
<Story name="Active States" asChild>
	<div class="flex gap-4">
		<Link href="#" active={true} currentUrl={undefined} activeClass="font-bold text-primary"
			>Active Link</Link
		>
		<Link href="#" active={false} currentUrl={undefined} inactiveClass="opacity-70"
			>Inactive Link</Link
		>
	</div>
</Story>

<!-- In Text -->
<Story name="In Text" asChild>
	<p class="max-w-md text-foreground">
		This is a paragraph with an <Link href="#" currentUrl={undefined} active={undefined}
			>inline link</Link
		> that flows naturally within the text. You can also have <Link
			href="#"
			external
			currentUrl={undefined}
			active={undefined}>external links</Link
		> that open in a new tab.
	</p>
</Story>

<!-- Navigation Example -->
<Story name="Navigation Example" asChild>
	<nav class="flex gap-6">
		<Link href="#" active={true} currentUrl={undefined} activeClass="font-semibold">Home</Link>
		<Link href="#" active={undefined} currentUrl={undefined}>About</Link>
		<Link href="#" active={undefined} currentUrl={undefined}>Services</Link>
		<Link href="#" active={undefined} currentUrl={undefined}>Contact</Link>
	</nav>
</Story>

<!-- Playground -->
<Story name="Playground">
	<Link active={undefined} currentUrl={undefined}>Link Text</Link>
</Story>
