<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Image } from './index.js';

	const { Story } = defineMeta({
		title: 'Components/Base/Image',
		component: Image,
		tags: ['autodocs'],
		argTypes: {
			src: {
				control: 'text',
				description: 'Image source URL',
				table: { category: 'Content' }
			},
			alt: {
				control: 'text',
				description: 'Alternative text for accessibility',
				table: { category: 'Accessibility' }
			},
			width: {
				control: 'number',
				description: 'Image width',
				table: { category: 'Dimensions' }
			},
			height: {
				control: 'number',
				description: 'Image height',
				table: { category: 'Dimensions' }
			}
		}
	});
</script>

<!-- Default -->
<Story name="Default">
	{#snippet template(args)}
		<Image
			{...args}
			src={args.src ||
				'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400&h=300&fit=crop'}
			alt={args.alt || 'Sample landscape'}
			width={args.width || 400}
			height={args.height || 300}
		/>
	{/snippet}
</Story>

<!-- Different Sizes -->
<Story name="Different Sizes" asChild>
	<div class="flex flex-wrap items-end gap-4">
		<Image
			src="https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=100&h=100&fit=crop"
			alt="Small image"
			width={100}
			height={100}
		/>
		<Image
			src="https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=200&h=150&fit=crop"
			alt="Medium image"
			width={200}
			height={150}
		/>
		<Image
			src="https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=300&h=200&fit=crop"
			alt="Large image"
			width={300}
			height={200}
		/>
	</div>
</Story>

<!-- With Custom Styling -->
<Story name="With Custom Styling" asChild>
	<div class="flex gap-4">
		<Image
			src="https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=150&h=150&fit=crop"
			alt="Rounded image"
			class="rounded-full"
			width={150}
			height={150}
		/>
		<Image
			src="https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=150&h=150&fit=crop"
			alt="Square image"
			class="rounded-none"
			width={150}
			height={150}
		/>
	</div>
</Story>

<!-- Responsive -->
<Story name="Responsive" args={{ alt: 'Responsive image' }}>
	{#snippet template(args)}
		<div class="max-w-md">
			<Image
				src={args.src ||
					'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=600&h=400&fit=crop'}
				alt={args.alt}
				class="w-full"
			/>
		</div>
	{/snippet}
</Story>

<!-- Gallery Example -->
<Story name="Gallery Example" asChild>
	<div class="grid max-w-lg grid-cols-3 gap-2">
		<Image
			src="https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=200&h=200&fit=crop"
			alt="Gallery image 1"
		/>
		<Image
			src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop"
			alt="Gallery image 2"
		/>
		<Image
			src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=200&h=200&fit=crop"
			alt="Gallery image 3"
		/>
		<Image
			src="https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=200&h=200&fit=crop"
			alt="Gallery image 4"
		/>
		<Image
			src="https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=200&h=200&fit=crop"
			alt="Gallery image 5"
		/>
		<Image
			src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=200&h=200&fit=crop"
			alt="Gallery image 6"
		/>
	</div>
</Story>

<!-- Playground -->
<Story name="Playground">
	{#snippet template(args)}
		<Image
			{...args}
			src={args.src ||
				'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400&h=300&fit=crop'}
			alt={args.alt || 'Sample image'}
		/>
	{/snippet}
</Story>
