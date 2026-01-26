<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { ScrollArea } from './index.ts';
	import { Separator } from '../separator/index.ts';

	const { Story } = defineMeta({
		title: 'Components/Layout/ScrollArea',
		component: ScrollArea,
		tags: ['autodocs'],
		argTypes: {
			orientation: {
				control: { type: 'select' },
				options: ['vertical', 'horizontal', 'both'],
				description: 'The scrollbar orientation to display',
				table: {
					category: 'Behavior',
					defaultValue: { summary: 'vertical' }
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
			orientation: 'vertical'
		}
	});

	const tags = Array.from({ length: 50 }).map((_, i, a) => `Tag ${a.length - i}`);

	const artworks = [
		{ title: 'The Starry Night', artist: 'Vincent van Gogh', year: '1889' },
		{ title: 'Mona Lisa', artist: 'Leonardo da Vinci', year: '1503-1519' },
		{ title: 'The Persistence of Memory', artist: 'Salvador Dalí', year: '1931' },
		{ title: 'The Scream', artist: 'Edvard Munch', year: '1893' },
		{ title: 'Girl with a Pearl Earring', artist: 'Johannes Vermeer', year: '1665' },
		{ title: 'The Birth of Venus', artist: 'Sandro Botticelli', year: '1485' },
		{ title: 'Guernica', artist: 'Pablo Picasso', year: '1937' },
		{ title: 'The Kiss', artist: 'Gustav Klimt', year: '1907-1908' },
		{ title: 'A Sunday on La Grande Jatte', artist: 'Georges Seurat', year: '1884-1886' },
		{ title: 'The Night Watch', artist: 'Rembrandt', year: '1642' }
	];
</script>

<!-- Default -->
<Story name="Default" args={{ orientation: 'vertical' }}>
	{#snippet template(args)}
		<ScrollArea {...args} class="h-72 w-48 rounded-md border">
			<div class="p-4">
				<h4 class="mb-4 text-sm leading-none font-medium">Tags</h4>
				{#each tags as tag, i (i)}
					<div class="text-sm">{tag}</div>
					<Separator class="my-2" />
				{/each}
			</div>
		</ScrollArea>
	{/snippet}
</Story>

<!-- Horizontal -->
<Story name="Horizontal" args={{ orientation: 'horizontal' }}>
	{#snippet template(args)}
		<ScrollArea {...args} class="w-96 rounded-md border whitespace-nowrap">
			<div class="flex w-max space-x-4 p-4">
				{#each artworks as artwork (artwork.title)}
					<figure class="shrink-0">
						<div class="overflow-hidden rounded-md">
							<div
								class="flex h-[150px] w-[200px] items-center justify-center bg-muted text-muted-foreground"
							>
								Artwork
							</div>
						</div>
						<figcaption class="pt-2 text-xs text-muted-foreground">
							<span class="font-semibold text-foreground">{artwork.title}</span>
							<br />
							{artwork.artist}
						</figcaption>
					</figure>
				{/each}
			</div>
		</ScrollArea>
	{/snippet}
</Story>

<!-- Both Directions -->
<Story name="Both Directions" args={{ orientation: 'both' }}>
	{#snippet template(args)}
		<ScrollArea {...args} class="h-72 w-96 rounded-md border">
			<div class="w-[600px] p-4">
				<h4 class="mb-4 text-sm leading-none font-medium">Wide Content with Many Rows</h4>
				<table class="w-full">
					<thead>
						<tr>
							<th class="border px-4 py-2 text-left">Column 1</th>
							<th class="border px-4 py-2 text-left">Column 2</th>
							<th class="border px-4 py-2 text-left">Column 3</th>
							<th class="border px-4 py-2 text-left">Column 4</th>
							<th class="border px-4 py-2 text-left">Column 5</th>
						</tr>
					</thead>
					<tbody>
						{#each [...Array(20).keys()] as i (i)}
							<tr>
								<td class="border px-4 py-2">Row {i + 1} - A</td>
								<td class="border px-4 py-2">Row {i + 1} - B</td>
								<td class="border px-4 py-2">Row {i + 1} - C</td>
								<td class="border px-4 py-2">Row {i + 1} - D</td>
								<td class="border px-4 py-2">Row {i + 1} - E</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</ScrollArea>
	{/snippet}
</Story>

<!-- Chat Messages -->
<Story name="Chat Messages" args={{ orientation: 'vertical' }}>
	{#snippet template(args)}
		<ScrollArea {...args} class="h-80 w-80 rounded-md border">
			<div class="flex flex-col gap-4 p-4">
				{#each [...Array(15).keys()] as i (i)}
					<div class={i % 2 === 0 ? 'self-start' : 'self-end'}>
						<div
							class={`max-w-[200px] rounded-lg px-3 py-2 text-sm ${i % 2 === 0 ? 'bg-muted' : 'bg-primary text-primary-foreground'}`}
						>
							{i % 2 === 0
								? 'This is a message from the other person.'
								: 'This is my reply to the message.'}
						</div>
						<p class="mt-1 text-xs text-muted-foreground">
							{i % 2 === 0 ? 'John' : 'You'} · {i + 1}m ago
						</p>
					</div>
				{/each}
			</div>
		</ScrollArea>
	{/snippet}
</Story>

<!-- File List -->
<Story name="File List" args={{ orientation: 'vertical' }}>
	{#snippet template(args)}
		<ScrollArea {...args} class="h-64 w-72 rounded-md border">
			<div class="p-2">
				{#each [...Array(20).keys()] as i (i)}
					<div class="flex items-center gap-2 rounded-sm px-2 py-1.5 hover:bg-muted">
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
							class="text-muted-foreground"
						>
							<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
							<path d="M14 2v4a2 2 0 0 0 2 2h4" />
						</svg>
						<span class="text-sm">document-{i + 1}.pdf</span>
					</div>
				{/each}
			</div>
		</ScrollArea>
	{/snippet}
</Story>

<!-- Code Block -->
<Story name="Code Block" args={{ orientation: 'both' }}>
	{#snippet template(args)}
		<ScrollArea {...args} class="h-64 w-96 rounded-md border bg-zinc-950">
			<pre class="p-4 text-sm text-zinc-100"><code
					>{`function fibonacci(n) {
  if (n <= 1) return n;

  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) {
    const temp = a + b;
    a = b;
    b = temp;
  }

  return b;
}

// Example usage with larger numbers
const results = [];
for (let i = 0; i < 50; i++) {
  results.push({
    index: i,
    value: fibonacci(i),
    isEven: fibonacci(i) % 2 === 0
  });
}

console.log(results);
console.log("Total items:", results.length);
console.log("Sum:", results.reduce((a, b) => a + b.value, 0));`}</code
				></pre>
		</ScrollArea>
	{/snippet}
</Story>

<!-- Notification List -->
<Story name="Notification List" args={{ orientation: 'vertical' }}>
	{#snippet template(args)}
		<ScrollArea {...args} class="h-80 w-80 rounded-md border">
			<div class="p-4">
				<h4 class="mb-4 font-medium">Notifications</h4>
				{#each [...Array(10).keys()] as i (i)}
					<div class="mb-4 last:mb-0">
						<div class="flex items-start gap-3">
							<div class="h-8 w-8 rounded-full bg-primary/20"></div>
							<div class="flex-1">
								<p class="text-sm font-medium">Notification {i + 1}</p>
								<p class="text-xs text-muted-foreground">
									This is the notification message content that might be a bit longer.
								</p>
								<p class="mt-1 text-xs text-muted-foreground">{i + 1} hour ago</p>
							</div>
						</div>
						{#if i < 9}
							<Separator class="mt-4" />
						{/if}
					</div>
				{/each}
			</div>
		</ScrollArea>
	{/snippet}
</Story>

<!-- Playground -->
<Story name="Playground">
	{#snippet template(args)}
		<ScrollArea {...args} class="h-72 w-48 rounded-md border">
			<div class="p-4">
				<h4 class="mb-4 text-sm leading-none font-medium">Items</h4>
				{#each tags.slice(0, 20) as tag, i (i)}
					<div class="text-sm">{tag}</div>
					<Separator class="my-2" />
				{/each}
			</div>
		</ScrollArea>
	{/snippet}
</Story>
