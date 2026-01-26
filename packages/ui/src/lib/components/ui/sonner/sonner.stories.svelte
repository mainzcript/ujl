<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Toaster } from './index.ts';
	import { Button } from '../button/index.ts';
	import { toast } from 'svelte-sonner';

	const { Story } = defineMeta({
		title: 'Components/Feedback/Sonner',
		component: Toaster,
		tags: ['autodocs'],
		argTypes: {
			position: {
				control: { type: 'select' },
				options: [
					'top-left',
					'top-center',
					'top-right',
					'bottom-left',
					'bottom-center',
					'bottom-right'
				],
				description: 'Position of the toasts',
				table: {
					category: 'Appearance',
					defaultValue: { summary: 'bottom-right' }
				}
			},
			expand: {
				control: 'boolean',
				description: 'Expand toasts by default',
				table: {
					category: 'Behavior',
					defaultValue: { summary: 'false' }
				}
			},
			richColors: {
				control: 'boolean',
				description: 'Use rich colors for different toast types',
				table: {
					category: 'Appearance',
					defaultValue: { summary: 'false' }
				}
			},
			closeButton: {
				control: 'boolean',
				description: 'Show close button on toasts',
				table: {
					category: 'Behavior',
					defaultValue: { summary: 'false' }
				}
			}
		},
		args: {
			position: 'bottom-right',
			expand: false,
			richColors: false,
			closeButton: false
		}
	});
</script>

<!-- Default -->
<Story name="Default">
	{#snippet template(args)}
		<div>
			<Toaster {...args} />
			<Button variant="outline" onclick={() => toast('Event has been created')}>Show Toast</Button>
		</div>
	{/snippet}
</Story>

<!-- All Types -->
<Story name="All Types" asChild>
	<div class="flex flex-wrap gap-2">
		<Toaster />
		<Button variant="default" onclick={() => toast('This is a default toast message')}>
			Default
		</Button>
		<Button variant="success" onclick={() => toast.success('Operation completed successfully!')}>
			Success
		</Button>
		<Button
			variant="destructive"
			onclick={() => toast.error('Something went wrong. Please try again.')}
		>
			Error
		</Button>
		<Button
			variant="warning"
			onclick={() => toast.warning('Please save your work before leaving.')}
		>
			Warning
		</Button>
		<Button variant="info" onclick={() => toast.info('A new version is available.')}>Info</Button>
	</div>
</Story>

<!-- With Description -->
<Story name="With Description" asChild>
	<div class="flex flex-wrap gap-2">
		<Toaster />
		<Button
			variant="default"
			onclick={() =>
				toast('Event Created', {
					description: 'Your event has been scheduled for tomorrow at 3:00 PM.'
				})}
		>
			With Description
		</Button>
		<Button
			variant="success"
			onclick={() =>
				toast.success('File Uploaded', {
					description: 'Your file "document.pdf" has been uploaded successfully.'
				})}
		>
			Success with Description
		</Button>
		<Button
			variant="destructive"
			onclick={() =>
				toast.error('Upload Failed', {
					description: 'The file size exceeds the maximum limit of 10MB.'
				})}
		>
			Error with Description
		</Button>
	</div>
</Story>

<!-- With Action -->
<Story name="With Action" asChild>
	<div class="flex flex-wrap gap-2">
		<Toaster />
		<Button
			variant="outline"
			onclick={() =>
				toast('Message sent', {
					action: {
						label: 'Undo',
						onClick: () => console.log('Undo clicked')
					}
				})}
		>
			With Action
		</Button>
		<Button
			variant="outline"
			onclick={() =>
				toast.error('Connection lost', {
					action: {
						label: 'Retry',
						onClick: () => console.log('Retry clicked')
					}
				})}
		>
			Error with Retry
		</Button>
		<Button
			variant="outline"
			onclick={() =>
				toast.success('File deleted', {
					description: 'The file has been moved to trash.',
					action: {
						label: 'Restore',
						onClick: () => console.log('Restore clicked')
					}
				})}
		>
			With Description and Action
		</Button>
	</div>
</Story>

<!-- Promise Toast -->
<Story name="Promise Toast" asChild>
	<div class="flex flex-wrap gap-2">
		<Toaster />
		<Button
			variant="success"
			onclick={() => {
				const promise = new Promise((resolve) => setTimeout(resolve, 2000));
				toast.promise(promise, {
					loading: 'Loading...',
					success: 'Data loaded successfully!',
					error: 'Failed to load data'
				});
			}}
		>
			Promise (Success)
		</Button>
		<Button
			variant="destructive"
			onclick={() => {
				const promise = new Promise((_, reject) => setTimeout(reject, 2000));
				toast.promise(promise, {
					loading: 'Uploading file...',
					success: 'File uploaded!',
					error: 'Upload failed'
				});
			}}
		>
			Promise (Error)
		</Button>
	</div>
</Story>

<!-- Custom Duration -->
<Story name="Custom Duration" asChild>
	<div class="flex flex-wrap gap-2">
		<Toaster />
		<Button variant="outline" onclick={() => toast('Quick toast', { duration: 1000 })}>
			1 Second
		</Button>
		<Button variant="outline" onclick={() => toast('Default duration toast')}>Default (4s)</Button>
		<Button variant="outline" onclick={() => toast('Long toast', { duration: 10000 })}>
			10 Seconds
		</Button>
		<Button variant="outline" onclick={() => toast('Persistent toast', { duration: Infinity })}>
			Infinite
		</Button>
	</div>
</Story>

<!-- Positions -->
<Story name="Positions" asChild>
	<div class="flex flex-col gap-4">
		<p class="text-sm text-muted-foreground">Click buttons to see toasts at different positions:</p>
		<div class="flex flex-wrap gap-2">
			<Toaster />
			<Button variant="outline" onclick={() => toast('Top Left', { position: 'top-left' })}>
				Top Left
			</Button>
			<Button variant="outline" onclick={() => toast('Top Center', { position: 'top-center' })}>
				Top Center
			</Button>
			<Button variant="outline" onclick={() => toast('Top Right', { position: 'top-right' })}>
				Top Right
			</Button>
			<Button variant="outline" onclick={() => toast('Bottom Left', { position: 'bottom-left' })}>
				Bottom Left
			</Button>
			<Button
				variant="outline"
				onclick={() => toast('Bottom Center', { position: 'bottom-center' })}
			>
				Bottom Center
			</Button>
			<Button variant="outline" onclick={() => toast('Bottom Right', { position: 'bottom-right' })}>
				Bottom Right
			</Button>
		</div>
	</div>
</Story>

<!-- Rich Colors -->
<Story name="Rich Colors" asChild>
	<div class="flex flex-wrap gap-2">
		<Toaster richColors />
		<Button variant="outline" onclick={() => toast.success('Success with rich colors!')}>
			Success
		</Button>
		<Button variant="outline" onclick={() => toast.error('Error with rich colors!')}>Error</Button>
		<Button variant="outline" onclick={() => toast.warning('Warning with rich colors!')}>
			Warning
		</Button>
		<Button variant="outline" onclick={() => toast.info('Info with rich colors!')}>Info</Button>
	</div>
</Story>

<!-- With Close Button -->
<Story name="With Close Button" asChild>
	<div class="flex flex-wrap gap-2">
		<Toaster closeButton />
		<Button
			variant="outline"
			onclick={() =>
				toast('Toast with close button', {
					description: 'Click the X to dismiss this toast.'
				})}
		>
			Show Toast
		</Button>
	</div>
</Story>

<!-- Dismissible -->
<Story name="Dismissible" asChild>
	<div class="flex flex-wrap gap-2">
		<Toaster />
		<Button
			variant="outline"
			onclick={() => {
				const toastId = toast('Click the button to dismiss', {
					duration: Infinity
				});
				setTimeout(() => {
					toast.dismiss(toastId);
				}, 3000);
			}}
		>
			Auto Dismiss After 3s
		</Button>
		<Button variant="outline" onclick={() => toast.dismiss()}>Dismiss All</Button>
	</div>
</Story>

<!-- Playground -->
<Story name="Playground">
	{#snippet template(args)}
		<div class="flex flex-col gap-4">
			<Toaster
				position={args.position}
				expand={args.expand}
				richColors={args.richColors}
				closeButton={args.closeButton}
			/>
			<div class="flex flex-wrap gap-2">
				<Button variant="default" onclick={() => toast('Default toast')}>Default</Button>
				<Button variant="success" onclick={() => toast.success('Success toast')}>Success</Button>
				<Button variant="destructive" onclick={() => toast.error('Error toast')}>Error</Button>
				<Button variant="warning" onclick={() => toast.warning('Warning toast')}>Warning</Button>
				<Button variant="info" onclick={() => toast.info('Info toast')}>Info</Button>
			</div>
			<p class="text-xs text-muted-foreground">
				Use the controls to adjust position, expand, rich colors, and close button options.
			</p>
		</div>
	{/snippet}
</Story>
