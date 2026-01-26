<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import {
		Table,
		TableBody,
		TableCaption,
		TableCell,
		TableHead,
		TableHeader,
		TableRow,
		TableFooter
	} from './index.ts';
	import { Badge } from '../badge/index.ts';
	import { Checkbox } from '../checkbox/index.ts';

	const { Story } = defineMeta({
		title: 'Components/Complex/Table',
		component: Table,
		tags: ['autodocs'],
		argTypes: {},
		args: {}
	});

	const invoices = [
		{ invoice: 'INV001', status: 'Paid', method: 'Credit Card', amount: '$250.00' },
		{ invoice: 'INV002', status: 'Pending', method: 'PayPal', amount: '$150.00' },
		{ invoice: 'INV003', status: 'Unpaid', method: 'Bank Transfer', amount: '$350.00' },
		{ invoice: 'INV004', status: 'Paid', method: 'Credit Card', amount: '$450.00' },
		{ invoice: 'INV005', status: 'Paid', method: 'PayPal', amount: '$550.00' },
		{ invoice: 'INV006', status: 'Pending', method: 'Bank Transfer', amount: '$200.00' },
		{ invoice: 'INV007', status: 'Unpaid', method: 'Credit Card', amount: '$300.00' }
	];

	const users = [
		{ name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
		{ name: 'Jane Smith', email: 'jane@example.com', role: 'Editor', status: 'Active' },
		{ name: 'Bob Johnson', email: 'bob@example.com', role: 'Viewer', status: 'Inactive' },
		{ name: 'Alice Brown', email: 'alice@example.com', role: 'Editor', status: 'Active' },
		{ name: 'Charlie Wilson', email: 'charlie@example.com', role: 'Viewer', status: 'Pending' }
	];
</script>

<!-- Default -->
<Story name="Default">
	{#snippet template()}
		<Table>
			<TableCaption>A list of your recent invoices.</TableCaption>
			<TableHeader>
				<TableRow>
					<TableHead class="w-[100px]">Invoice</TableHead>
					<TableHead>Status</TableHead>
					<TableHead>Method</TableHead>
					<TableHead class="text-right">Amount</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#each invoices as invoice (invoice.invoice)}
					<TableRow>
						<TableCell class="font-medium">{invoice.invoice}</TableCell>
						<TableCell>{invoice.status}</TableCell>
						<TableCell>{invoice.method}</TableCell>
						<TableCell class="text-right">{invoice.amount}</TableCell>
					</TableRow>
				{/each}
			</TableBody>
		</Table>
	{/snippet}
</Story>

<!-- With Footer -->
<Story name="With Footer">
	{#snippet template()}
		<Table>
			<TableCaption>A list of your recent invoices.</TableCaption>
			<TableHeader>
				<TableRow>
					<TableHead class="w-[100px]">Invoice</TableHead>
					<TableHead>Status</TableHead>
					<TableHead>Method</TableHead>
					<TableHead class="text-right">Amount</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#each invoices.slice(0, 5) as invoice (invoice.invoice)}
					<TableRow>
						<TableCell class="font-medium">{invoice.invoice}</TableCell>
						<TableCell>{invoice.status}</TableCell>
						<TableCell>{invoice.method}</TableCell>
						<TableCell class="text-right">{invoice.amount}</TableCell>
					</TableRow>
				{/each}
			</TableBody>
			<TableFooter>
				<TableRow>
					<TableCell colspan={3}>Total</TableCell>
					<TableCell class="text-right">$1,750.00</TableCell>
				</TableRow>
			</TableFooter>
		</Table>
	{/snippet}
</Story>

<!-- With Badges -->
<Story name="With Badges">
	{#snippet template()}
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Invoice</TableHead>
					<TableHead>Status</TableHead>
					<TableHead>Method</TableHead>
					<TableHead class="text-right">Amount</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#each invoices as invoice (invoice.invoice)}
					<TableRow>
						<TableCell class="font-medium">{invoice.invoice}</TableCell>
						<TableCell>
							<Badge
								variant={invoice.status === 'Paid'
									? 'success'
									: invoice.status === 'Pending'
										? 'warning'
										: 'destructive'}
							>
								{invoice.status}
							</Badge>
						</TableCell>
						<TableCell>{invoice.method}</TableCell>
						<TableCell class="text-right">{invoice.amount}</TableCell>
					</TableRow>
				{/each}
			</TableBody>
		</Table>
	{/snippet}
</Story>

<!-- With Checkboxes -->
<Story name="With Checkboxes">
	{#snippet template()}
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead class="w-[40px]">
						<Checkbox />
					</TableHead>
					<TableHead>Name</TableHead>
					<TableHead>Email</TableHead>
					<TableHead>Role</TableHead>
					<TableHead>Status</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#each users as user, i (user.email)}
					<TableRow>
						<TableCell>
							<Checkbox checked={i === 0 || i === 2} />
						</TableCell>
						<TableCell class="font-medium">{user.name}</TableCell>
						<TableCell>{user.email}</TableCell>
						<TableCell>{user.role}</TableCell>
						<TableCell>
							<Badge
								variant={user.status === 'Active'
									? 'success'
									: user.status === 'Pending'
										? 'warning'
										: 'default'}
							>
								{user.status}
							</Badge>
						</TableCell>
					</TableRow>
				{/each}
			</TableBody>
		</Table>
	{/snippet}
</Story>

<!-- Striped Rows -->
<Story name="Striped Rows">
	{#snippet template()}
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Invoice</TableHead>
					<TableHead>Status</TableHead>
					<TableHead>Method</TableHead>
					<TableHead class="text-right">Amount</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#each invoices as invoice, i (invoice.invoice)}
					<TableRow class={i % 2 === 0 ? 'bg-muted/50' : ''}>
						<TableCell class="font-medium">{invoice.invoice}</TableCell>
						<TableCell>{invoice.status}</TableCell>
						<TableCell>{invoice.method}</TableCell>
						<TableCell class="text-right">{invoice.amount}</TableCell>
					</TableRow>
				{/each}
			</TableBody>
		</Table>
	{/snippet}
</Story>

<!-- User Management Table -->
<Story name="User Management Table">
	{#snippet template()}
		<div class="rounded-md border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead class="w-[200px]">User</TableHead>
						<TableHead>Role</TableHead>
						<TableHead>Status</TableHead>
						<TableHead class="text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{#each users as user (user.email)}
						<TableRow>
							<TableCell>
								<div class="flex flex-col">
									<span class="font-medium">{user.name}</span>
									<span class="text-xs text-muted-foreground">{user.email}</span>
								</div>
							</TableCell>
							<TableCell>
								<Badge variant="outline">{user.role}</Badge>
							</TableCell>
							<TableCell>
								<div class="flex items-center gap-2">
									<span
										class="size-2 rounded-full {user.status === 'Active'
											? 'bg-green-500'
											: user.status === 'Pending'
												? 'bg-yellow-500'
												: 'bg-gray-500'}"
									></span>
									<span class="text-sm">{user.status}</span>
								</div>
							</TableCell>
							<TableCell class="text-right">
								<button class="text-sm text-primary hover:underline">Edit</button>
							</TableCell>
						</TableRow>
					{/each}
				</TableBody>
			</Table>
		</div>
	{/snippet}
</Story>

<!-- Compact Table -->
<Story name="Compact Table">
	{#snippet template()}
		<Table class="text-xs">
			<TableHeader>
				<TableRow>
					<TableHead class="h-8 px-2">ID</TableHead>
					<TableHead class="h-8 px-2">Product</TableHead>
					<TableHead class="h-8 px-2">Qty</TableHead>
					<TableHead class="h-8 px-2 text-right">Price</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#each [{ id: '001', product: 'Widget A', qty: 10, price: '$9.99' }, { id: '002', product: 'Widget B', qty: 5, price: '$14.99' }, { id: '003', product: 'Widget C', qty: 20, price: '$4.99' }, { id: '004', product: 'Widget D', qty: 8, price: '$19.99' }, { id: '005', product: 'Widget E', qty: 15, price: '$7.99' }] as item (item.id)}
					<TableRow>
						<TableCell class="h-8 px-2">{item.id}</TableCell>
						<TableCell class="h-8 px-2">{item.product}</TableCell>
						<TableCell class="h-8 px-2">{item.qty}</TableCell>
						<TableCell class="h-8 px-2 text-right">{item.price}</TableCell>
					</TableRow>
				{/each}
			</TableBody>
		</Table>
	{/snippet}
</Story>

<!-- Empty State -->
<Story name="Empty State">
	{#snippet template()}
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Invoice</TableHead>
					<TableHead>Status</TableHead>
					<TableHead>Method</TableHead>
					<TableHead class="text-right">Amount</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				<TableRow>
					<TableCell colspan={4} class="h-24 text-center">
						<div class="flex flex-col items-center gap-2 text-muted-foreground">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="32"
								height="32"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path
									d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"
								/>
								<path d="M12 10v6" />
								<path d="m15 13-3 3-3-3" />
							</svg>
							<span>No invoices found</span>
						</div>
					</TableCell>
				</TableRow>
			</TableBody>
		</Table>
	{/snippet}
</Story>

<!-- Playground -->
<Story name="Playground">
	{#snippet template()}
		<Table>
			<TableCaption>Sample data table</TableCaption>
			<TableHeader>
				<TableRow>
					<TableHead>Column 1</TableHead>
					<TableHead>Column 2</TableHead>
					<TableHead>Column 3</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#each Array.from({ length: 3 }, (_, i) => i) as i (i)}
					<TableRow>
						<TableCell>Row {i + 1}, Cell 1</TableCell>
						<TableCell>Row {i + 1}, Cell 2</TableCell>
						<TableCell>Row {i + 1}, Cell 3</TableCell>
					</TableRow>
				{/each}
			</TableBody>
		</Table>
	{/snippet}
</Story>
