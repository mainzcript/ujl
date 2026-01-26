<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './index.ts';

	const { Story } = defineMeta({
		title: 'Components/Navigation/Accordion',
		component: Accordion,
		tags: ['autodocs'],
		argTypes: {
			type: {
				control: { type: 'select' },
				options: ['single', 'multiple'],
				description: 'Whether to allow single or multiple items to be open',
				table: {
					category: 'Behavior',
					defaultValue: { summary: 'single' }
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
			type: 'single'
		}
	});
</script>

<!-- Default -->
<Story name="Default">
	{#snippet template()}
		<Accordion type="single" class="w-full max-w-[450px]">
			<AccordionItem value="item-1">
				<AccordionTrigger>Is it accessible?</AccordionTrigger>
				<AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
			</AccordionItem>
			<AccordionItem value="item-2">
				<AccordionTrigger>Is it styled?</AccordionTrigger>
				<AccordionContent>
					Yes. It comes with default styles that match the other components' aesthetic.
				</AccordionContent>
			</AccordionItem>
			<AccordionItem value="item-3">
				<AccordionTrigger>Is it animated?</AccordionTrigger>
				<AccordionContent>
					Yes. It's animated by default, but you can disable it if you prefer.
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	{/snippet}
</Story>

<!-- Multiple -->
<Story name="Multiple">
	{#snippet template()}
		<Accordion type="multiple" class="w-full max-w-[450px]">
			<AccordionItem value="item-1">
				<AccordionTrigger>Can I open multiple items?</AccordionTrigger>
				<AccordionContent>
					Yes! When type is set to "multiple", you can have multiple items open at the same time.
				</AccordionContent>
			</AccordionItem>
			<AccordionItem value="item-2">
				<AccordionTrigger>Will they stay open?</AccordionTrigger>
				<AccordionContent>
					Yes. Each item operates independently, so opening one doesn't close the others.
				</AccordionContent>
			</AccordionItem>
			<AccordionItem value="item-3">
				<AccordionTrigger>How do I close them?</AccordionTrigger>
				<AccordionContent>
					Simply click on the trigger again to close an open item.
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	{/snippet}
</Story>

<!-- FAQ Example -->
<Story name="FAQ">
	{#snippet template()}
		<div class="w-full max-w-[500px]">
			<h2 class="mb-4 text-xl font-semibold">Frequently Asked Questions</h2>
			<Accordion type="single">
				<AccordionItem value="q1">
					<AccordionTrigger>What payment methods do you accept?</AccordionTrigger>
					<AccordionContent>
						We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank
						transfers. For enterprise customers, we also offer invoice-based payment.
					</AccordionContent>
				</AccordionItem>
				<AccordionItem value="q2">
					<AccordionTrigger>How do I cancel my subscription?</AccordionTrigger>
					<AccordionContent>
						You can cancel your subscription at any time from your account settings. Navigate to
						Settings &gt; Billing &gt; Cancel Subscription. Your access will continue until the end
						of your current billing period.
					</AccordionContent>
				</AccordionItem>
				<AccordionItem value="q3">
					<AccordionTrigger>Do you offer refunds?</AccordionTrigger>
					<AccordionContent>
						Yes, we offer a 30-day money-back guarantee for all new subscriptions. If you're not
						satisfied with our service, contact our support team within 30 days of your purchase for
						a full refund.
					</AccordionContent>
				</AccordionItem>
				<AccordionItem value="q4">
					<AccordionTrigger>How do I contact support?</AccordionTrigger>
					<AccordionContent>
						You can reach our support team via email at support@example.com, through our live chat
						feature available 24/7, or by calling our toll-free number 1-800-EXAMPLE.
					</AccordionContent>
				</AccordionItem>
			</Accordion>
		</div>
	{/snippet}
</Story>

<!-- With Rich Content -->
<Story name="With Rich Content">
	{#snippet template()}
		<Accordion type="single" class="w-full max-w-[500px]">
			<AccordionItem value="features">
				<AccordionTrigger>Features</AccordionTrigger>
				<AccordionContent>
					<ul class="list-disc space-y-2 pl-4">
						<li>Fully accessible with keyboard navigation</li>
						<li>Smooth animations and transitions</li>
						<li>Customizable styling with Tailwind CSS</li>
						<li>TypeScript support out of the box</li>
					</ul>
				</AccordionContent>
			</AccordionItem>
			<AccordionItem value="installation">
				<AccordionTrigger>Installation</AccordionTrigger>
				<AccordionContent>
					<p class="mb-2">Install the package using your preferred package manager:</p>
					<code class="block rounded bg-muted p-2 text-sm">npm install @ujl/ui</code>
				</AccordionContent>
			</AccordionItem>
			<AccordionItem value="usage">
				<AccordionTrigger>Usage</AccordionTrigger>
				<AccordionContent>
					<p class="mb-2">Import the components and use them in your application:</p>
					<pre class="overflow-x-auto rounded bg-muted p-2 text-sm"><code
							>{`<Accordion>
  <AccordionItem value="item-1">
    <AccordionTrigger>Title</AccordionTrigger>
    <AccordionContent>Content</AccordionContent>
  </AccordionItem>
</Accordion>`}</code
						></pre>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	{/snippet}
</Story>

<!-- Disabled -->
<Story name="Disabled">
	{#snippet template()}
		<Accordion type="single" disabled class="w-full max-w-[450px]">
			<AccordionItem value="item-1">
				<AccordionTrigger>Disabled Item 1</AccordionTrigger>
				<AccordionContent>
					This content is not accessible because the accordion is disabled.
				</AccordionContent>
			</AccordionItem>
			<AccordionItem value="item-2">
				<AccordionTrigger>Disabled Item 2</AccordionTrigger>
				<AccordionContent>This content is also not accessible.</AccordionContent>
			</AccordionItem>
		</Accordion>
	{/snippet}
</Story>

<!-- With Default Open -->
<Story name="Default Open">
	{#snippet template()}
		<Accordion type="single" value="item-2" class="w-full max-w-[450px]">
			<AccordionItem value="item-1">
				<AccordionTrigger>First Item</AccordionTrigger>
				<AccordionContent>This item is closed by default.</AccordionContent>
			</AccordionItem>
			<AccordionItem value="item-2">
				<AccordionTrigger>Second Item (Open by Default)</AccordionTrigger>
				<AccordionContent>
					This item is open by default because its value matches the accordion's initial value.
				</AccordionContent>
			</AccordionItem>
			<AccordionItem value="item-3">
				<AccordionTrigger>Third Item</AccordionTrigger>
				<AccordionContent>This item is also closed by default.</AccordionContent>
			</AccordionItem>
		</Accordion>
	{/snippet}
</Story>

<!-- Playground -->
<Story name="Playground">
	{#snippet template(args)}
		<Accordion type={args.type} disabled={args.disabled} class="w-full max-w-[450px]">
			<AccordionItem value="item-1">
				<AccordionTrigger>Section 1</AccordionTrigger>
				<AccordionContent>
					Content for section 1. Adjust the controls to see how the accordion behaves with different
					settings.
				</AccordionContent>
			</AccordionItem>
			<AccordionItem value="item-2">
				<AccordionTrigger>Section 2</AccordionTrigger>
				<AccordionContent>
					Content for section 2. Try changing the type to "multiple" to allow multiple sections to
					be open.
				</AccordionContent>
			</AccordionItem>
			<AccordionItem value="item-3">
				<AccordionTrigger>Section 3</AccordionTrigger>
				<AccordionContent>
					Content for section 3. Toggle the "collapsible" option to see how it affects closing
					behavior.
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	{/snippet}
</Story>
