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
		Button,
		Dialog,
		DialogTrigger,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogDescription,
		DialogFooter,
		ScrollArea,
		ResizablePaneGroup,
		ResizablePane,
		ResizableHandle,
		Grid,
		GridItem
	} from '$lib/index.js';
	import { flavors } from '$lib/tokens/index.js';
</script>

{#each flavors as flavor (flavor)}
	<section class="flavor-{flavor} bg-flavor relative py-20">
		<Container>
			<Card>
				<CardContent>
					<Grid>
						<GridItem class="col-span-6">
							<Heading>{flavor}</Heading>
						</GridItem>
						<GridItem class="col-span-6">
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
						</GridItem>
						<GridItem>
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
						</GridItem>
						<GridItem>
							<Card>
								<CardHeader>
									<CardTitle>Dialog</CardTitle>
									<CardDescription>Beispiel für Dialog-Komponente</CardDescription>
								</CardHeader>
								<CardContent>
									<div class="flex gap-2">
										<Dialog>
											<DialogTrigger>
												<Button>Dialog öffnen</Button>
											</DialogTrigger>
											<DialogContent class="sm:max-w-[425px]">
												<DialogHeader>
													<DialogTitle>Profil bearbeiten</DialogTitle>
													<DialogDescription>
														Hier kannst du dein Profil bearbeiten. Klicke auf "Speichern", wenn du
														fertig bist.
													</DialogDescription>
												</DialogHeader>
												<div>
													<Text>The Dialog Body goes here.</Text>
												</div>
												<DialogFooter>
													<Text>The Dialog Footer goes here.</Text>
												</DialogFooter>
											</DialogContent>
										</Dialog>
									</div>
								</CardContent>
							</Card>
						</GridItem>
						<GridItem>
							<Card>
								<CardHeader>
									<CardTitle>Scroll Area</CardTitle>
									<CardDescription>Beispiel für Scroll-Area-Komponente</CardDescription>
								</CardHeader>
								<CardContent>
									<ScrollArea class="elevation h-32 w-full rounded-md">
										<div class="p-4">
											{#each Array(20), i (i)}
												<Text class="mb-1"
													>Zeile {i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Text
												>
											{/each}
										</div>
									</ScrollArea>
								</CardContent>
							</Card>
						</GridItem>
						<GridItem>
							<Card>
								<CardHeader>
									<CardTitle>Resizable</CardTitle>
									<CardDescription>Beispiel für Resizable-Komponente</CardDescription>
								</CardHeader>
								<CardContent>
									<div class="h-48 w-full">
										<ResizablePaneGroup
											direction="horizontal"
											class="elevation h-full w-full rounded-md"
										>
											<ResizablePane defaultSize={50} minSize={20}>
												<div class="p-6">
													<Heading class="mb-2" level={3}>Linke Pane</Heading>
													<Text>
														Diese Pane kann durch Ziehen des Handles in der Größe verändert werden.
													</Text>
												</div>
											</ResizablePane>
											<ResizableHandle withHandle />
											<ResizablePane defaultSize={50} minSize={20}>
												<div class="p-6">
													<Heading class="mb-2" level={3}>Rechte Pane</Heading>
													<Text>Ziehe das Handle, um die Größe der Panes zu ändern.</Text>
												</div>
											</ResizablePane>
										</ResizablePaneGroup>
									</div>
								</CardContent>
							</Card>
						</GridItem>
						<GridItem>
							<div class="elevation overflow-hidden rounded-xl">
								<Grid class="grid-cols-11 gap-0">
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
								</Grid>
							</div>
						</GridItem>
					</Grid>
				</CardContent>
			</Card>
		</Container>
	</section>
{/each}
