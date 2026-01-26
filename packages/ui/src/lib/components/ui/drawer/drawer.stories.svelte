<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import {
		Drawer,
		DrawerContent,
		DrawerHeader,
		DrawerFooter,
		DrawerTitle,
		DrawerDescription,
		DrawerTriggerButton,
		DrawerCloseButton
	} from './index.ts';
	import { Button } from '../button/index.ts';
	import { Input } from '../input/index.ts';
	import { Label } from '../label/index.ts';

	const { Story } = defineMeta({
		title: 'Components/Overlays/Drawer',
		component: Drawer,
		tags: ['autodocs'],
		argTypes: {
			direction: {
				control: { type: 'select' },
				options: ['bottom', 'top', 'left', 'right'],
				description: 'The direction from which the drawer slides in',
				table: {
					category: 'Appearance',
					defaultValue: { summary: 'bottom' }
				}
			},
			shouldScaleBackground: {
				control: 'boolean',
				description: 'Whether the background should scale when the drawer opens',
				table: {
					category: 'Behavior',
					defaultValue: { summary: 'true' }
				}
			},
			snapPoints: {
				control: 'object',
				description: 'Array of snap points (0-1) where the drawer can rest',
				table: {
					category: 'Behavior',
					defaultValue: { summary: 'undefined' }
				}
			}
		},
		args: {
			direction: 'bottom',
			shouldScaleBackground: true,
			snapPoints: undefined
		}
	});
</script>

<!-- Default -->
<Story name="Default">
	{#snippet template(args)}
		<Drawer {...args}>
			<DrawerTriggerButton variant="outline">Open Drawer</DrawerTriggerButton>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>Drawer Title</DrawerTitle>
					<DrawerDescription>
						This is a drawer component that slides up from the bottom of the screen.
					</DrawerDescription>
				</DrawerHeader>
				<div class="p-4">
					<p class="text-sm text-muted-foreground">
						Drawers are commonly used for mobile-friendly interactions and can contain any content.
					</p>
				</div>
				<DrawerFooter>
					<DrawerCloseButton>Submit</DrawerCloseButton>
					<DrawerCloseButton variant="outline">Cancel</DrawerCloseButton>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	{/snippet}
</Story>

<!-- From Top -->
<Story name="From Top" args={{ direction: 'top' }}>
	{#snippet template(args)}
		<Drawer {...args}>
			<DrawerTriggerButton variant="outline">Open from Top</DrawerTriggerButton>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>Top Drawer</DrawerTitle>
					<DrawerDescription>This drawer slides down from the top of the screen.</DrawerDescription>
				</DrawerHeader>
				<div class="p-4">
					<p class="text-sm text-muted-foreground">
						Top drawers are useful for notifications, alerts, or quick actions that need immediate
						attention.
					</p>
				</div>
				<DrawerFooter>
					<DrawerCloseButton>Dismiss</DrawerCloseButton>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	{/snippet}
</Story>

<!-- From Left -->
<Story name="From Left" args={{ direction: 'left' }}>
	{#snippet template(args)}
		<Drawer {...args}>
			<DrawerTriggerButton variant="outline">Open from Left</DrawerTriggerButton>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>Navigation Menu</DrawerTitle>
					<DrawerDescription>Quick access to all sections.</DrawerDescription>
				</DrawerHeader>
				<nav class="grid gap-2 p-4">
					<Button variant="ghost" class="justify-start">Dashboard</Button>
					<Button variant="ghost" class="justify-start">Profile</Button>
					<Button variant="ghost" class="justify-start">Settings</Button>
					<Button variant="ghost" class="justify-start">Help</Button>
				</nav>
				<DrawerFooter>
					<DrawerCloseButton variant="outline">Close Menu</DrawerCloseButton>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	{/snippet}
</Story>

<!-- From Right -->
<Story name="From Right" args={{ direction: 'right' }}>
	{#snippet template(args)}
		<Drawer {...args}>
			<DrawerTriggerButton variant="outline">Open from Right</DrawerTriggerButton>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>Shopping Cart</DrawerTitle>
					<DrawerDescription>3 items in your cart</DrawerDescription>
				</DrawerHeader>
				<div class="flex-1 overflow-y-auto p-4">
					<div class="space-y-4">
						<div class="flex items-center gap-4">
							<div class="h-16 w-16 rounded bg-muted"></div>
							<div class="flex-1">
								<p class="font-medium">Product Name</p>
								<p class="text-sm text-muted-foreground">$29.99</p>
							</div>
						</div>
						<div class="flex items-center gap-4">
							<div class="h-16 w-16 rounded bg-muted"></div>
							<div class="flex-1">
								<p class="font-medium">Another Product</p>
								<p class="text-sm text-muted-foreground">$49.99</p>
							</div>
						</div>
						<div class="flex items-center gap-4">
							<div class="h-16 w-16 rounded bg-muted"></div>
							<div class="flex-1">
								<p class="font-medium">Third Product</p>
								<p class="text-sm text-muted-foreground">$19.99</p>
							</div>
						</div>
					</div>
				</div>
				<DrawerFooter>
					<div class="flex items-center justify-between pb-2">
						<span class="text-sm text-muted-foreground">Subtotal</span>
						<span class="font-medium">$99.97</span>
					</div>
					<DrawerCloseButton>Checkout</DrawerCloseButton>
					<DrawerCloseButton variant="outline">Continue Shopping</DrawerCloseButton>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	{/snippet}
</Story>

<!-- All Directions -->
<Story name="All Directions" asChild>
	<div class="flex flex-wrap gap-4">
		<Drawer direction="bottom">
			<DrawerTriggerButton variant="outline">Bottom</DrawerTriggerButton>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>Bottom Drawer</DrawerTitle>
					<DrawerDescription>Slides up from the bottom.</DrawerDescription>
				</DrawerHeader>
				<DrawerFooter>
					<DrawerCloseButton>Close</DrawerCloseButton>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>

		<Drawer direction="top">
			<DrawerTriggerButton variant="outline">Top</DrawerTriggerButton>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>Top Drawer</DrawerTitle>
					<DrawerDescription>Slides down from the top.</DrawerDescription>
				</DrawerHeader>
				<DrawerFooter>
					<DrawerCloseButton>Close</DrawerCloseButton>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>

		<Drawer direction="left">
			<DrawerTriggerButton variant="outline">Left</DrawerTriggerButton>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>Left Drawer</DrawerTitle>
					<DrawerDescription>Slides in from the left.</DrawerDescription>
				</DrawerHeader>
				<DrawerFooter>
					<DrawerCloseButton>Close</DrawerCloseButton>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>

		<Drawer direction="right">
			<DrawerTriggerButton variant="outline">Right</DrawerTriggerButton>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>Right Drawer</DrawerTitle>
					<DrawerDescription>Slides in from the right.</DrawerDescription>
				</DrawerHeader>
				<DrawerFooter>
					<DrawerCloseButton>Close</DrawerCloseButton>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	</div>
</Story>

<!-- With Snap Points -->
<Story name="With Snap Points" args={{ snapPoints: [0.5, 1] }}>
	{#snippet template(args)}
		<Drawer {...args}>
			<DrawerTriggerButton variant="outline">Open with Snap Points</DrawerTriggerButton>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>Snap Points</DrawerTitle>
					<DrawerDescription>
						This drawer has snap points at 50% and 100%. Drag to snap between them.
					</DrawerDescription>
				</DrawerHeader>
				<div class="p-4">
					<p class="text-sm text-muted-foreground">
						Snap points allow the drawer to rest at specific heights. This is useful for showing
						partial content initially and allowing users to expand for more.
					</p>
					<div class="mt-4 space-y-4">
						<div class="rounded-lg border p-4">
							<h4 class="font-medium">Section 1</h4>
							<p class="text-sm text-muted-foreground">Some content here</p>
						</div>
						<div class="rounded-lg border p-4">
							<h4 class="font-medium">Section 2</h4>
							<p class="text-sm text-muted-foreground">More content here</p>
						</div>
						<div class="rounded-lg border p-4">
							<h4 class="font-medium">Section 3</h4>
							<p class="text-sm text-muted-foreground">Even more content</p>
						</div>
					</div>
				</div>
				<DrawerFooter>
					<DrawerCloseButton>Done</DrawerCloseButton>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	{/snippet}
</Story>

<!-- Form Drawer -->
<Story name="Form Drawer">
	{#snippet template(args)}
		<Drawer {...args}>
			<DrawerTriggerButton>Add New Item</DrawerTriggerButton>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>Add New Item</DrawerTitle>
					<DrawerDescription>Fill out the form below to add a new item.</DrawerDescription>
				</DrawerHeader>
				<div class="space-y-4 p-4">
					<div class="grid gap-2">
						<Label>Name</Label>
						<Input placeholder="Enter item name" />
					</div>
					<div class="grid gap-2">
						<Label>Description</Label>
						<Input placeholder="Enter description" />
					</div>
					<div class="grid gap-2">
						<Label>Category</Label>
						<Input placeholder="Select category" />
					</div>
				</div>
				<DrawerFooter>
					<DrawerCloseButton>Save Item</DrawerCloseButton>
					<DrawerCloseButton variant="outline">Cancel</DrawerCloseButton>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	{/snippet}
</Story>

<!-- No Scale Background -->
<Story name="No Scale Background" args={{ shouldScaleBackground: false }}>
	{#snippet template(args)}
		<Drawer {...args}>
			<DrawerTriggerButton variant="outline">No Scale Effect</DrawerTriggerButton>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>Static Background</DrawerTitle>
					<DrawerDescription>
						The background doesn't scale when this drawer opens.
					</DrawerDescription>
				</DrawerHeader>
				<div class="p-4">
					<p class="text-sm text-muted-foreground">
						By default, vaul drawers scale the background content slightly when opened. This creates
						a depth effect. You can disable this by setting shouldScaleBackground to false.
					</p>
				</div>
				<DrawerFooter>
					<DrawerCloseButton>Close</DrawerCloseButton>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	{/snippet}
</Story>

<!-- Playground -->
<Story name="Playground">
	{#snippet template(args)}
		<Drawer {...args}>
			<DrawerTriggerButton variant="outline">Open Playground Drawer</DrawerTriggerButton>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>Playground Drawer</DrawerTitle>
					<DrawerDescription>Use the controls to modify the drawer's behavior.</DrawerDescription>
				</DrawerHeader>
				<div class="p-4">
					<p class="text-sm text-muted-foreground">
						Toggle the controls on the right panel to see how the drawer responds to different
						settings. Try changing the direction or toggling the scale background effect.
					</p>
				</div>
				<DrawerFooter>
					<DrawerCloseButton>Confirm</DrawerCloseButton>
					<DrawerCloseButton variant="outline">Cancel</DrawerCloseButton>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	{/snippet}
</Story>
