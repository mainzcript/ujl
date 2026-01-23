<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Slider } from './index.js';
	import { Label } from '../label/index.js';

	const { Story } = defineMeta({
		title: 'Components/Base/Slider',
		component: Slider,
		tags: ['autodocs'],
		argTypes: {
			value: {
				control: 'object',
				description: 'Current value(s) of the slider',
				table: { category: 'State' },
				defaultValue: { summary: '50' }
			},
			min: {
				control: 'number',
				description: 'Minimum value',
				table: {
					category: 'Behavior',
					defaultValue: { summary: '0' }
				}
			},
			max: {
				control: 'number',
				description: 'Maximum value',
				table: {
					category: 'Behavior',
					defaultValue: { summary: '100' }
				}
			},
			step: {
				control: 'number',
				description: 'Step increment',
				table: {
					category: 'Behavior',
					defaultValue: { summary: '1' }
				}
			},
			orientation: {
				control: { type: 'select' },
				options: ['horizontal', 'vertical'],
				description: 'Orientation of the slider',
				table: {
					category: 'Appearance',
					defaultValue: { summary: 'horizontal' }
				}
			},
			disabled: {
				control: 'boolean',
				description: 'Whether the slider is disabled',
				table: {
					category: 'State',
					defaultValue: { summary: 'false' }
				}
			}
		},
		args: {
			type: 'multiple' as const,
			value: [50],
			min: 0,
			max: 100,
			step: 1,
			orientation: 'horizontal' as const,
			disabled: false
		}
	});
</script>

<!-- Default -->
<Story name="Default"></Story>

<!-- With Label -->
<Story name="With Label">
	{#snippet template(args)}
		<div class="max-w-md space-y-2">
			<div class="flex justify-between">
				<Label for="volume">Volume</Label>
				<span class="text-sm text-muted-foreground"
					>{Array.isArray(args.value) ? args.value[0] : args.value}%</span
				>
			</div>
			<Slider {...args} />
		</div>
	{/snippet}
</Story>

<!-- Different Values -->
<Story name="Different Values" asChild>
	<div class="max-w-md space-y-6">
		<div class="space-y-2">
			<div class="flex justify-between text-sm">
				<span>0%</span>
			</div>
			<Slider type="multiple" value={[0]} max={100} />
		</div>
		<div class="space-y-2">
			<div class="flex justify-between text-sm">
				<span>25%</span>
			</div>
			<Slider type="multiple" value={[25]} max={100} />
		</div>
		<div class="space-y-2">
			<div class="flex justify-between text-sm">
				<span>50%</span>
			</div>
			<Slider type="multiple" value={[50]} max={100} />
		</div>
		<div class="space-y-2">
			<div class="flex justify-between text-sm">
				<span>75%</span>
			</div>
			<Slider type="multiple" value={[75]} max={100} />
		</div>
		<div class="space-y-2">
			<div class="flex justify-between text-sm">
				<span>100%</span>
			</div>
			<Slider type="multiple" value={[100]} max={100} />
		</div>
	</div>
</Story>

<!-- Range Slider -->
<Story name="Range Slider" asChild>
	<div class="max-w-md space-y-2">
		<div class="flex justify-between">
			<Label>Price Range</Label>
			<span class="text-sm text-muted-foreground">$25 - $75</span>
		</div>
		<Slider type="multiple" value={[25, 75]} max={100} step={1} />
	</div>
</Story>

<!-- With Steps -->
<Story name="With Steps" asChild>
	<div class="max-w-md space-y-2">
		<div class="flex justify-between">
			<Label>Quality</Label>
			<span class="text-sm text-muted-foreground">Medium</span>
		</div>
		<Slider type="multiple" value={[50]} max={100} step={25} />
		<div class="flex justify-between text-xs text-muted-foreground">
			<span>Low</span>
			<span>Medium</span>
			<span>High</span>
			<span>Ultra</span>
			<span>Max</span>
		</div>
	</div>
</Story>

<!-- Vertical -->
<Story name="Vertical" asChild>
	<div class="flex h-48 gap-8">
		<div class="flex flex-col items-center gap-2">
			<Slider type="multiple" orientation="vertical" value={[30]} max={100} />
			<span class="text-sm">30%</span>
		</div>
		<div class="flex flex-col items-center gap-2">
			<Slider type="multiple" orientation="vertical" value={[60]} max={100} />
			<span class="text-sm">60%</span>
		</div>
		<div class="flex flex-col items-center gap-2">
			<Slider type="multiple" orientation="vertical" value={[90]} max={100} />
			<span class="text-sm">90%</span>
		</div>
	</div>
</Story>

<!-- Disabled -->
<Story name="Disabled" asChild>
	<div class="max-w-md space-y-4">
		<div class="space-y-2">
			<Label class="opacity-50">Disabled Slider</Label>
			<Slider type="multiple" value={[50]} max={100} disabled />
		</div>
	</div>
</Story>

<!-- Audio Settings Example -->
<Story name="Audio Settings Example" asChild>
	<div class="max-w-sm space-y-6 rounded-lg border p-4">
		<h3 class="font-medium">Audio Settings</h3>
		<div class="space-y-4">
			<div class="space-y-2">
				<div class="flex justify-between">
					<Label>Master Volume</Label>
					<span class="text-sm text-muted-foreground">80%</span>
				</div>
				<Slider type="multiple" value={[80]} max={100} />
			</div>
			<div class="space-y-2">
				<div class="flex justify-between">
					<Label>Music</Label>
					<span class="text-sm text-muted-foreground">60%</span>
				</div>
				<Slider type="multiple" value={[60]} max={100} />
			</div>
			<div class="space-y-2">
				<div class="flex justify-between">
					<Label>Sound Effects</Label>
					<span class="text-sm text-muted-foreground">100%</span>
				</div>
				<Slider type="multiple" value={[100]} max={100} />
			</div>
			<div class="space-y-2">
				<div class="flex justify-between">
					<Label>Voice</Label>
					<span class="text-sm text-muted-foreground">70%</span>
				</div>
				<Slider type="multiple" value={[70]} max={100} />
			</div>
		</div>
	</div>
</Story>

<!-- Playground -->
<Story name="Playground">
	{#snippet template(args)}
		<div class={args.orientation === 'vertical' ? 'h-48' : 'max-w-md'}>
			<Slider {...args} />
		</div>
	{/snippet}
</Story>
