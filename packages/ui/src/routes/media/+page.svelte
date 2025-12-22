<script lang="ts">
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle,
		Text,
		Grid,
		GridItem,
		Avatar,
		AvatarImage,
		AvatarFallback,
		Carousel,
		CarouselContent,
		CarouselItem,
		CarouselPrevious,
		CarouselNext,
		CarouselDots,
		Image
	} from '$lib/index.js';
</script>

<Grid>
	<GridItem>
		<Card>
			<CardHeader>
				<CardTitle>Media</CardTitle>
				<CardDescription>Avatar components for user profiles and media display.</CardDescription>
			</CardHeader>
			<CardContent class="space-y-6">
				<!-- Avatar Examples -->
				<div class="space-y-3">
					<Text size="sm" class="font-medium">Avatars:</Text>
					<div class="flex flex-wrap gap-4">
						<!-- Avatar with Fallback -->
						<Avatar>
							<AvatarImage src="https://broken-link.png" alt="User" />
							<AvatarFallback>JD</AvatarFallback>
						</Avatar>

						<!-- Basic Avatar -->
						<Avatar>
							<AvatarImage src="https://github.com/shadcn.png" alt="User" />
							<AvatarFallback>CN</AvatarFallback>
						</Avatar>

						<!-- Different Sizes -->
						<Avatar class="size-12">
							<AvatarImage src="https://github.com/shadcn.png" alt="User" />
							<AvatarFallback>LG</AvatarFallback>
						</Avatar>

						<Avatar class="size-16">
							<AvatarImage src="https://github.com/shadcn.png" alt="User" />
							<AvatarFallback>XL</AvatarFallback>
						</Avatar>
					</div>
				</div>

				<!-- Avatar Group -->
				<div class="space-y-3">
					<Text size="sm" class="font-medium">Avatar Group:</Text>
					<div class="flex -space-x-2">
						<Avatar class="border-2 border-background">
							<AvatarImage src="https://github.com/shadcn.png" alt="User 1" />
							<AvatarFallback>U1</AvatarFallback>
						</Avatar>
						<Avatar class="border-2 border-background">
							<AvatarImage src="https://github.com/shadcn.png" alt="User 2" />
							<AvatarFallback>U2</AvatarFallback>
						</Avatar>
						<Avatar class="border-2 border-background">
							<AvatarImage src="https://github.com/shadcn.png" alt="User 3" />
							<AvatarFallback>U3</AvatarFallback>
						</Avatar>
						<Avatar class="border-2 border-background">
							<AvatarFallback>+5</AvatarFallback>
						</Avatar>
					</div>
				</div>

				<!-- Image Example -->
				<div class="space-y-3">
					<Text size="sm" class="font-medium">Image:</Text>
					<Image
						src="https://picsum.photos/400/300?random=1"
						alt="Random image"
						class="aspect-4/3 max-w-lg"
					/>
				</div>

				<!-- Carousel Examples -->
				<div class="space-y-3">
					<Text size="sm" class="font-medium">Carousel:</Text>
					<Carousel>
						<CarouselContent class="py-4">
							{#each Array(7), i (i)}
								<CarouselItem>
									<Card>
										<CardContent class="flex aspect-square items-center justify-center p-6">
											<div class="text-center">
												<Text size="3xl" class="font-semibold">{i + 1}</Text>
												<Text size="sm" intensity="muted">Slide {i + 1}</Text>
											</div>
										</CardContent>
									</Card>
								</CarouselItem>
							{/each}
						</CarouselContent>
						<div class="flex w-full items-center justify-center gap-2">
							<CarouselPrevious />
							<CarouselDots />
							<CarouselNext />
						</div>
					</Carousel>
				</div>
			</CardContent>
		</Card>
	</GridItem>
</Grid>
