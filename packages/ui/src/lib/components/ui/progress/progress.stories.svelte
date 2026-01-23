<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Progress } from './index.js';

	const { Story } = defineMeta({
		title: 'Components/Base/Progress',
		component: Progress,
		tags: ['autodocs'],
		argTypes: {
			value: {
				control: { type: 'range', min: 0, max: 100, step: 1 },
				description: 'Current progress value',
				table: {
					category: 'State',
					defaultValue: { summary: '0' }
				}
			},
			max: {
				control: 'number',
				description: 'Maximum progress value',
				table: {
					category: 'Behavior',
					defaultValue: { summary: '100' }
				}
			}
		},
		args: {
			value: 33,
			max: 100
		}
	});
</script>

<!-- Default -->
<Story name="Default">
	{#snippet template(args)}
		<Progress {...args} class="w-[60%]" />
	{/snippet}
</Story>

<!-- Different Values -->
<Story name="Different Values" asChild>
	<div class="max-w-md space-y-4">
		<div class="space-y-1">
			<div class="flex justify-between text-sm">
				<span>0%</span>
				<span>0/100</span>
			</div>
			<Progress value={0} />
		</div>
		<div class="space-y-1">
			<div class="flex justify-between text-sm">
				<span>25%</span>
				<span>25/100</span>
			</div>
			<Progress value={25} />
		</div>
		<div class="space-y-1">
			<div class="flex justify-between text-sm">
				<span>50%</span>
				<span>50/100</span>
			</div>
			<Progress value={50} />
		</div>
		<div class="space-y-1">
			<div class="flex justify-between text-sm">
				<span>75%</span>
				<span>75/100</span>
			</div>
			<Progress value={75} />
		</div>
		<div class="space-y-1">
			<div class="flex justify-between text-sm">
				<span>100%</span>
				<span>100/100</span>
			</div>
			<Progress value={100} />
		</div>
	</div>
</Story>

<!-- With Label -->
<Story name="With Label" asChild>
	<div class="max-w-md space-y-2">
		<div class="flex justify-between text-sm">
			<span class="font-medium">Uploading...</span>
			<span class="text-muted-foreground">66%</span>
		</div>
		<Progress value={66} />
	</div>
</Story>

<!-- Custom Max -->
<Story name="Custom Max" asChild>
	<div class="max-w-md space-y-2">
		<div class="flex justify-between text-sm">
			<span>Progress</span>
			<span>3 of 5 steps</span>
		</div>
		<Progress value={3} max={5} />
	</div>
</Story>

<!-- File Upload Example -->
<Story name="File Upload Example" asChild>
	<div class="max-w-md space-y-4 rounded-lg border p-4">
		<div class="flex items-center gap-3">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
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
			<div class="flex-1">
				<p class="text-sm font-medium">document.pdf</p>
				<p class="text-xs text-muted-foreground">2.4 MB</p>
			</div>
			<span class="text-sm text-muted-foreground">78%</span>
		</div>
		<Progress value={78} />
	</div>
</Story>

<!-- Playground -->
<Story name="Playground">
	{#snippet template(args)}
		<Progress {...args} class="max-w-md" />
	{/snippet}
</Story>
