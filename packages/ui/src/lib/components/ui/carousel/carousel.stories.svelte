<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import {
		Carousel,
		CarouselContent,
		CarouselItem,
		CarouselPrevious,
		CarouselNext,
		CarouselDots
	} from './index.ts';
	import { Card, CardContent } from '../card/index.ts';

	const { Story } = defineMeta({
		title: 'Components/Complex/Carousel',
		component: Carousel,
		tags: ['autodocs'],
		argTypes: {},
		args: {}
	});
</script>

<!-- Default -->
<Story name="Default">
	{#snippet template()}
		<div class="w-full max-w-lg">
			<Carousel>
				<CarouselContent>
					{#each Array.from({ length: 5 }, (_, i) => i) as i (i)}
						<CarouselItem>
							<Card>
								<CardContent class="flex aspect-square items-center justify-center bg-muted/50 p-6">
									<span class="text-4xl font-semibold">{i + 1}</span>
								</CardContent>
							</Card>
						</CarouselItem>
					{/each}
				</CarouselContent>
				<div class="mt-4 flex items-center justify-center gap-2">
					<CarouselPrevious />
					<CarouselNext />
				</div>
			</Carousel>
		</div>
	{/snippet}
</Story>

<!-- With Dots -->
<Story name="With Dots">
	{#snippet template()}
		<div class="w-full max-w-lg">
			<Carousel>
				<CarouselContent>
					{#each Array.from({ length: 5 }, (_, i) => i) as i (i)}
						<CarouselItem>
							<Card>
								<CardContent class="flex aspect-square items-center justify-center bg-muted/50 p-6">
									<span class="text-4xl font-semibold">{i + 1}</span>
								</CardContent>
							</Card>
						</CarouselItem>
					{/each}
				</CarouselContent>
				<div class="mt-4 flex flex-col items-center gap-4">
					<CarouselDots />
					<div class="flex items-center gap-2">
						<CarouselPrevious />
						<CarouselNext />
					</div>
				</div>
			</Carousel>
		</div>
	{/snippet}
</Story>

<!-- Image Gallery -->
<Story name="Image Gallery">
	{#snippet template()}
		<div class="w-full max-w-2xl">
			<Carousel>
				<CarouselContent>
					{#each ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'] as color, i (color)}
						<CarouselItem>
							<div class={`${color} flex aspect-video items-center justify-center rounded-lg`}>
								<span class="text-2xl font-semibold text-white">Image {i + 1}</span>
							</div>
						</CarouselItem>
					{/each}
				</CarouselContent>
				<div class="mt-4 flex items-center justify-center gap-2">
					<CarouselPrevious />
					<CarouselDots />
					<CarouselNext />
				</div>
			</Carousel>
		</div>
	{/snippet}
</Story>

<!-- Card Carousel -->
<Story name="Card Carousel">
	{#snippet template()}
		<div class="w-full max-w-3xl">
			<Carousel>
				<CarouselContent class="-ml-2 md:-ml-4">
					{#each [{ title: 'Getting Started', desc: 'Learn the basics of our platform' }, { title: 'Components', desc: 'Explore our component library' }, { title: 'Theming', desc: 'Customize colors and styles' }, { title: 'Plugins', desc: 'Extend functionality with plugins' }, { title: 'Deployment', desc: 'Deploy your application' }] as item, i (item.title)}
						<CarouselItem class="basis-full pl-2 md:basis-1/2 md:pl-4 lg:basis-1/3">
							<Card>
								<CardContent class="p-6">
									<div class="flex flex-col gap-2">
										<span class="text-xs text-muted-foreground">Step {i + 1}</span>
										<h3 class="font-semibold">{item.title}</h3>
										<p class="text-sm text-muted-foreground">{item.desc}</p>
									</div>
								</CardContent>
							</Card>
						</CarouselItem>
					{/each}
				</CarouselContent>
				<div class="mt-4 flex items-center justify-center gap-2">
					<CarouselPrevious />
					<CarouselNext />
				</div>
			</Carousel>
		</div>
	{/snippet}
</Story>

<!-- Testimonials -->
<Story name="Testimonials">
	{#snippet template()}
		<div class="w-full max-w-xl">
			<Carousel>
				<CarouselContent>
					{#each [{ name: 'Alice Johnson', role: 'CEO', quote: 'This product has transformed our workflow completely.' }, { name: 'Bob Smith', role: 'Developer', quote: 'The best developer experience I have ever had.' }, { name: 'Carol Williams', role: 'Designer', quote: 'Beautiful components that are easy to customize.' }] as testimonial (testimonial.name)}
						<CarouselItem>
							<Card>
								<CardContent class="p-8 text-center">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="32"
										height="32"
										viewBox="0 0 24 24"
										fill="currentColor"
										class="mx-auto mb-4 text-muted-foreground/30"
									>
										<path
											d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"
										/>
									</svg>
									<blockquote class="mb-4 text-lg">{testimonial.quote}</blockquote>
									<div class="flex flex-col">
										<span class="font-semibold">{testimonial.name}</span>
										<span class="text-sm text-muted-foreground">{testimonial.role}</span>
									</div>
								</CardContent>
							</Card>
						</CarouselItem>
					{/each}
				</CarouselContent>
				<div class="mt-4 flex items-center justify-center gap-4">
					<CarouselPrevious />
					<CarouselDots />
					<CarouselNext />
				</div>
			</Carousel>
		</div>
	{/snippet}
</Story>

<!-- Product Showcase -->
<Story name="Product Showcase">
	{#snippet template()}
		<div class="w-full max-w-lg">
			<Carousel>
				<CarouselContent>
					{#each [{ name: 'Product A', price: '$99', color: 'bg-gradient-to-br from-blue-400 to-blue-600' }, { name: 'Product B', price: '$149', color: 'bg-gradient-to-br from-purple-400 to-purple-600' }, { name: 'Product C', price: '$199', color: 'bg-gradient-to-br from-green-400 to-green-600' }, { name: 'Product D', price: '$249', color: 'bg-gradient-to-br from-orange-400 to-orange-600' }] as product (product.name)}
						<CarouselItem>
							<Card class="overflow-hidden">
								<div class={`${product.color} flex aspect-square items-center justify-center`}>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="64"
										height="64"
										viewBox="0 0 24 24"
										fill="none"
										stroke="white"
										stroke-width="1.5"
										stroke-linecap="round"
										stroke-linejoin="round"
									>
										<path
											d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"
										/>
										<path d="m3.3 7 8.7 5 8.7-5" />
										<path d="M12 22V12" />
									</svg>
								</div>
								<CardContent class="p-4">
									<div class="flex items-center justify-between">
										<span class="font-semibold">{product.name}</span>
										<span class="text-lg font-bold">{product.price}</span>
									</div>
								</CardContent>
							</Card>
						</CarouselItem>
					{/each}
				</CarouselContent>
				<div class="mt-4 flex items-center justify-center gap-2">
					<CarouselPrevious />
					<CarouselDots />
					<CarouselNext />
				</div>
			</Carousel>
		</div>
	{/snippet}
</Story>

<!-- Playground -->
<Story name="Playground">
	{#snippet template()}
		<div class="w-full max-w-lg">
			<Carousel>
				<CarouselContent>
					{#each Array.from({ length: 6 }, (_, i) => i) as i (i)}
						<CarouselItem>
							<Card>
								<CardContent class="flex aspect-video items-center justify-center bg-muted/50 p-6">
									<span class="text-3xl font-semibold">Slide {i + 1}</span>
								</CardContent>
							</Card>
						</CarouselItem>
					{/each}
				</CarouselContent>
				<div class="mt-4 flex items-center justify-center gap-2">
					<CarouselPrevious />
					<CarouselNext />
				</div>
			</Carousel>
		</div>
	{/snippet}
</Story>
