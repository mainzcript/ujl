<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Alert, AlertDescription, AlertTitle } from './index.ts';

	const { Story } = defineMeta({
		title: 'Components/Feedback/Alert',
		component: Alert,
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
					'info'
				],
				description: 'The visual style variant of the alert',
				table: {
					category: 'Appearance',
					defaultValue: { summary: 'default' }
				}
			},
			class: {
				control: 'text',
				description: 'Additional CSS classes to apply',
				table: {
					category: 'Appearance'
				}
			}
		},
		args: {
			variant: 'default'
		}
	});
</script>

<!-- Default -->
<Story name="Default">
	{#snippet template(args)}
		<Alert variant={args.variant} class="max-w-[450px]">
			<AlertTitle>Heads up!</AlertTitle>
			<AlertDescription>You can add components to your app using the cli.</AlertDescription>
		</Alert>
	{/snippet}
</Story>

<!-- All Variants -->
<Story name="All Variants" asChild>
	<div class="flex max-w-[500px] flex-col gap-4">
		<Alert variant="default">
			<AlertTitle>Default</AlertTitle>
			<AlertDescription>This is a default alert message.</AlertDescription>
		</Alert>
		<Alert variant="ambient">
			<AlertTitle>Ambient</AlertTitle>
			<AlertDescription>This is an ambient alert message.</AlertDescription>
		</Alert>
		<Alert variant="primary">
			<AlertTitle>Primary</AlertTitle>
			<AlertDescription>This is a primary alert message.</AlertDescription>
		</Alert>
		<Alert variant="secondary">
			<AlertTitle>Secondary</AlertTitle>
			<AlertDescription>This is a secondary alert message.</AlertDescription>
		</Alert>
		<Alert variant="accent">
			<AlertTitle>Accent</AlertTitle>
			<AlertDescription>This is an accent alert message.</AlertDescription>
		</Alert>
		<Alert variant="success">
			<AlertTitle>Success</AlertTitle>
			<AlertDescription>This is a success alert message.</AlertDescription>
		</Alert>
		<Alert variant="warning">
			<AlertTitle>Warning</AlertTitle>
			<AlertDescription>This is a warning alert message.</AlertDescription>
		</Alert>
		<Alert variant="destructive">
			<AlertTitle>Destructive</AlertTitle>
			<AlertDescription>This is a destructive alert message.</AlertDescription>
		</Alert>
		<Alert variant="info">
			<AlertTitle>Info</AlertTitle>
			<AlertDescription>This is an info alert message.</AlertDescription>
		</Alert>
	</div>
</Story>

<!-- With Icons -->
<Story name="With Icons" asChild>
	<div class="flex max-w-[500px] flex-col gap-4">
		<Alert variant="success">
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
				<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
				<polyline points="22 4 12 14.01 9 11.01" />
			</svg>
			<AlertTitle>Success!</AlertTitle>
			<AlertDescription>Your changes have been saved successfully.</AlertDescription>
		</Alert>
		<Alert variant="warning">
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
				<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
				<path d="M12 9v4" />
				<path d="M12 17h.01" />
			</svg>
			<AlertTitle>Warning</AlertTitle>
			<AlertDescription>Your session is about to expire in 5 minutes.</AlertDescription>
		</Alert>
		<Alert variant="destructive">
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
				<circle cx="12" cy="12" r="10" />
				<line x1="12" x2="12" y1="8" y2="12" />
				<line x1="12" x2="12.01" y1="16" y2="16" />
			</svg>
			<AlertTitle>Error</AlertTitle>
			<AlertDescription>There was a problem processing your request.</AlertDescription>
		</Alert>
		<Alert variant="info">
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
				<circle cx="12" cy="12" r="10" />
				<path d="M12 16v-4" />
				<path d="M12 8h.01" />
			</svg>
			<AlertTitle>Information</AlertTitle>
			<AlertDescription>A new software update is available for download.</AlertDescription>
		</Alert>
	</div>
</Story>

<!-- Description Only -->
<Story name="Description Only" args={{ variant: 'info' }}>
	{#snippet template(args)}
		<div class="flex max-w-[500px] flex-col gap-4">
			<Alert variant={args.variant}>
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
					<circle cx="12" cy="12" r="10" />
					<path d="M12 16v-4" />
					<path d="M12 8h.01" />
				</svg>
				<AlertDescription>This alert only has a description without a title.</AlertDescription>
			</Alert>
		</div>
	{/snippet}
</Story>

<!-- With Action -->
<Story name="With Action" args={{ variant: 'warning' }}>
	{#snippet template(args)}
		<div class="flex max-w-[500px] flex-col gap-4">
			<Alert {...args}>
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
					<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
					<path d="M12 9v4" />
					<path d="M12 17h.01" />
				</svg>
				<AlertTitle>Update Available</AlertTitle>
				<AlertDescription>
					<p>A new version of the application is available.</p>
					<div class="mt-3 flex gap-2">
						<button class="text-sm font-medium underline underline-offset-4">Update Now</button>
						<button class="text-sm font-medium opacity-70">Later</button>
					</div>
				</AlertDescription>
			</Alert>
		</div>
	{/snippet}
</Story>

<!-- Rich Content -->
<Story name="Rich Content" args={{ variant: 'info' }}>
	{#snippet template(args)}
		<div class="flex max-w-[500px] flex-col gap-4">
			<Alert {...args}>
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
					<path d="M12 2v4" />
					<path d="m16.2 7.8 2.9-2.9" />
					<path d="M18 12h4" />
					<path d="m16.2 16.2 2.9 2.9" />
					<path d="M12 18v4" />
					<path d="m4.9 19.1 2.9-2.9" />
					<path d="M2 12h4" />
					<path d="m4.9 4.9 2.9 2.9" />
				</svg>
				<AlertTitle>Scheduled Maintenance</AlertTitle>
				<AlertDescription>
					<p>We will be performing scheduled maintenance on:</p>
					<ul class="mt-2 list-disc space-y-1 pl-4">
						<li>Database servers - 2:00 AM to 4:00 AM UTC</li>
						<li>API endpoints - 3:00 AM to 3:30 AM UTC</li>
						<li>File storage - 3:30 AM to 4:00 AM UTC</li>
					</ul>
					<p class="mt-2">Please save your work before this time.</p>
				</AlertDescription>
			</Alert>
		</div>
	{/snippet}
</Story>

<!-- Notification Style -->
<Story name="Notification Style" args={{ variant: 'primary' }}>
	{#snippet template(args)}
		<div class="flex max-w-[500px] flex-col gap-4">
			<Alert {...args} class="flex items-start gap-4">
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
					<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
					<path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
				</svg>
				<AlertTitle>New Notification</AlertTitle>
				<AlertDescription>You have 3 unread messages in your inbox.</AlertDescription>
			</Alert>
		</div>
	{/snippet}
</Story>

<!-- Playground -->
<Story name="Playground">
	{#snippet template(args)}
		<Alert variant={args.variant} class="max-w-[450px]">
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
				<circle cx="12" cy="12" r="10" />
				<path d="M12 16v-4" />
				<path d="M12 8h.01" />
			</svg>
			<AlertTitle>Alert Title</AlertTitle>
			<AlertDescription>
				This is the alert description. Change the variant in the controls to see different styles.
			</AlertDescription>
		</Alert>
	{/snippet}
</Story>
