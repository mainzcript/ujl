<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Skeleton } from './index.js';

	const { Story } = defineMeta({
		title: 'Components/Base/Skeleton',
		component: Skeleton,
		tags: ['autodocs'],
		argTypes: {
			class: {
				control: 'text',
				description: 'Additional CSS classes for sizing and styling',
				table: { category: 'Appearance' }
			}
		}
	});
</script>

<!-- Default -->
<Story name="Default">
	{#snippet template(args)}
		<Skeleton {...args} class={args.class || 'h-4 w-[250px]'} />
	{/snippet}
</Story>

<!-- Various Shapes -->
<Story name="Various Shapes" asChild>
	<div class="flex flex-col gap-4">
		<Skeleton class="h-4 w-full" />
		<Skeleton class="h-4 w-3/4" />
		<Skeleton class="h-4 w-1/2" />
		<Skeleton class="h-12 w-12 rounded-full" />
		<Skeleton class="h-24 w-24 rounded-lg" />
	</div>
</Story>

<!-- Card Loading -->
<Story name="Card Loading" asChild>
	<div class="flex items-center space-x-4">
		<Skeleton class="h-12 w-12 rounded-full" />
		<div class="space-y-2">
			<Skeleton class="h-4 w-[250px]" />
			<Skeleton class="h-4 w-[200px]" />
		</div>
	</div>
</Story>

<!-- Article Loading -->
<Story name="Article Loading" asChild>
	<div class="max-w-md space-y-4">
		<Skeleton class="h-48 w-full rounded-lg" />
		<div class="space-y-2">
			<Skeleton class="h-6 w-3/4" />
			<Skeleton class="h-4 w-full" />
			<Skeleton class="h-4 w-full" />
			<Skeleton class="h-4 w-2/3" />
		</div>
	</div>
</Story>

<!-- List Loading -->
<Story name="List Loading" asChild>
	<div class="max-w-sm space-y-3">
		{#each [0, 1, 2, 3, 4] as i (i)}
			<div class="flex items-center space-x-3">
				<Skeleton class="h-10 w-10 rounded-full" />
				<div class="flex-1 space-y-1">
					<Skeleton class="h-4 w-full" />
					<Skeleton class="h-3 w-2/3" />
				</div>
			</div>
		{/each}
	</div>
</Story>

<!-- Table Loading -->
<Story name="Table Loading" asChild>
	<div class="max-w-lg space-y-2">
		<div class="flex gap-4">
			<Skeleton class="h-8 w-1/4" />
			<Skeleton class="h-8 w-1/4" />
			<Skeleton class="h-8 w-1/4" />
			<Skeleton class="h-8 w-1/4" />
		</div>
		{#each [0, 1, 2, 3] as i (i)}
			<div class="flex gap-4">
				<Skeleton class="h-6 w-1/4" />
				<Skeleton class="h-6 w-1/4" />
				<Skeleton class="h-6 w-1/4" />
				<Skeleton class="h-6 w-1/4" />
			</div>
		{/each}
	</div>
</Story>

<!-- Dashboard Loading -->
<Story name="Dashboard Loading" asChild>
	<div class="grid max-w-2xl grid-cols-3 gap-4">
		{#each [0, 1, 2] as i (i)}
			<div class="space-y-2 rounded-lg border p-4">
				<Skeleton class="h-4 w-1/2" />
				<Skeleton class="h-8 w-full" />
				<Skeleton class="h-3 w-2/3" />
			</div>
		{/each}
	</div>
</Story>

<!-- Playground -->
<Story name="Playground">
	{#snippet template(args)}
		<Skeleton {...args} class={args.class || 'h-4 w-[250px]'} />
	{/snippet}
</Story>
