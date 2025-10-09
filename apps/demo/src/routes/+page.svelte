<script lang="ts">
	import {
		Card,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader,
		CardTitle,
		CardAction,
		Container,
		Text,
		Heading,
		Highlight,
		AspectRatio,
		Button
	} from '@ujl-framework/ui';
	import { flavors } from '@ujl-framework/ui/tokens';
</script>

{#each flavors as flavor (flavor)}
	<section class="flavor-{flavor} relative bg-flavor py-20">
		<Container>
			<Card>
				<CardContent>
					<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
						<div>
							<Heading>{flavor}</Heading>
						</div>
						<div>
							<Card>
								<CardHeader>
									<CardTitle>Title</CardTitle>
									<CardDescription>Description</CardDescription>
									<CardAction>
										<Button variant="ghost" size="sm">Action</Button>
									</CardAction>
								</CardHeader>
								<CardContent>
									<Text>
										Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod
										tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At
										vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren,
										no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit
										amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut
										labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam
										et justo duo dolores et ea rebum. <Highlight>Stet clita</Highlight> kasd gubergren,
										no sea takimata sanctus est Lorem ipsum dolor sit amet.
									</Text>
								</CardContent>
								<CardFooter>
									<Text>The Card Footer goes here.</Text>
								</CardFooter>
							</Card>
						</div>
						<div class="col-span-full">
							<Card>
								<CardHeader>
									<CardTitle>Buttons</CardTitle>
								</CardHeader>
								<CardContent>
									<div class="flex gap-2">
										<Button>Default</Button>
										<Button variant="outline">Outline</Button>
										<Button variant="ghost">Ghost</Button>
										{#each flavors as btn_flavor (btn_flavor)}
											<Button flavor={btn_flavor}>{btn_flavor}</Button>
										{/each}
									</div>
								</CardContent>
							</Card>
						</div>
						<div class="col-span-full">
							<div class="elevation overflow-hidden rounded-xl">
								<div class="grid grid-cols-11">
									<AspectRatio class="bg-flavor-50" />
									<AspectRatio class="bg-flavor-100" />
									<AspectRatio class="bg-flavor-200" />
									<AspectRatio class="bg-flavor-300" />
									<AspectRatio class="bg-flavor-400" />
									<AspectRatio class="bg-flavor-500" />
									<AspectRatio class="bg-flavor-600" />
									<AspectRatio class="bg-flavor-700" />
									<AspectRatio class="bg-flavor-800" />
									<AspectRatio class="bg-flavor-900" />
									<AspectRatio class="bg-flavor-950" />
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</Container>
	</section>
{/each}
