<script lang="ts">
	import {
		Card,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader,
		CardTitle,
		CardAction,
		Text,
		Heading,
		Highlight,
		AspectRatio,
		Button,
		ButtonGroup,
		ButtonGroupSeparator,
		ButtonGroupText,
		Grid,
		GridItem,
		Badge,
	} from "$lib/index.js";
	import { flavors } from "@ujl-framework/types";
	import { getContext } from "svelte";
	import Star from "@lucide/svelte/icons/star";

	// Get selectedFlavor from layout context
	const flavorContext = getContext<{ value: string }>("selectedFlavor");
	const selectedFlavor = $derived.by(() => flavorContext.value);
</script>

<Card>
	<CardContent>
		<Grid>
			<GridItem class="col-span-6">
				<Heading>{selectedFlavor}</Heading>
			</GridItem>
			<GridItem class="col-span-6">
				<Card>
					<CardHeader>
						<CardTitle>Title</CardTitle>
						<CardDescription>Description</CardDescription>
						<CardAction>
							<Button variant="muted" size="sm">Action</Button>
						</CardAction>
					</CardHeader>
					<CardContent>
						<Text>
							Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
							invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et
							accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata
							sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur
							sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna
							aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea
							rebum. <Highlight>Stet clita</Highlight> kasd gubergren, no sea takimata sanctus est Lorem
							ipsum dolor sit amet.
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
						<CardTitle>Color Shades</CardTitle>
						<CardDescription>This are all shades of the {selectedFlavor}-flavor.</CardDescription>
					</CardHeader>
					<CardContent>
						<div class="elevation overflow-hidden rounded-xl border border-flavor-500/25">
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
					</CardContent>
				</Card>
			</GridItem>
			<GridItem>
				<Card>
					<CardHeader>
						<CardTitle>Text Colors</CardTitle>
						<CardDescription>Text colors optimized for light and dark backgrounds.</CardDescription>
					</CardHeader>
					<CardContent>
						<div class="grid grid-cols-2 gap-5">
							<Text class="text-flavor-foreground-primary">
								This paragraph uses <Badge variant="primary">primary</Badge> Text optimized to be displayed
								on {selectedFlavor} background.
							</Text>
							<Text class="text-flavor-foreground-secondary">
								This paragraph uses <Badge variant="secondary">secondary</Badge> Text optimized to be
								displayed on {selectedFlavor} background.
							</Text>
							<Text class="text-flavor-foreground-accent">
								This paragraph uses <Badge variant="accent">accent</Badge> Text optimized to be displayed
								on {selectedFlavor} background.
							</Text>
							<Text class="text-flavor-foreground-success">
								This paragraph uses <Badge variant="success">success</Badge> Text optimized to be displayed
								on {selectedFlavor} background.
							</Text>
							<Text class="text-flavor-foreground-warning">
								This paragraph uses <Badge variant="warning">warning</Badge> Text optimized to be displayed
								on {selectedFlavor} background.
							</Text>
							<Text class="text-flavor-foreground-destructive">
								This paragraph uses <Badge variant="destructive">destructive</Badge> Text optimized to
								be displayed on {selectedFlavor} background.
							</Text>
							<Text class="text-flavor-foreground-info">
								This paragraph uses <Badge variant="info">info</Badge> Text optimized to be displayed
								on {selectedFlavor} background.
							</Text>
						</div>
					</CardContent>
				</Card>
			</GridItem>
			<GridItem>
				<Card>
					<CardHeader>
						<CardTitle>Buttons</CardTitle>
					</CardHeader>
					<CardContent class="flex flex-col gap-4 overflow-x-auto">
						<div class="flex flex-nowrap gap-2">
							<Button>Default</Button>
							<Button variant="muted">Muted</Button>
							<Button variant="outline">Outline</Button>
							<Button variant="ghost">Ghost</Button>
							{#each flavors as btn_flavor (btn_flavor)}
								<Button variant={btn_flavor}>{btn_flavor}</Button>
							{/each}
						</div>
						<div class="flex flex-nowrap items-center gap-2">
							<Button size="xs">XS</Button>
							<Button size="sm">Small</Button>
							<Button size="default">Default</Button>
							<Button size="lg">Large</Button>
							<Button size="icon-xs"><Star /></Button>
							<Button size="icon-sm"><Star /></Button>
							<Button size="icon"><Star /></Button>
							<Button size="icon-lg"><Star /></Button>
						</div>
					</CardContent>
				</Card>
			</GridItem>
			<GridItem>
				<Card>
					<CardHeader>
						<CardTitle>Button Group</CardTitle>
					</CardHeader>
					<CardContent class="flex flex-col gap-4 overflow-x-auto">
						<ButtonGroup>
							<Button>Default</Button>
							<Button variant="muted" size="sm">Muted</Button>
							<Button variant="outline">Outline</Button>
							<Button variant="ghost">Ghost</Button>
						</ButtonGroup>
						<ButtonGroup>
							{#each flavors as btn_flavor, i (btn_flavor)}
								{#if i > 0}
									<ButtonGroupSeparator />
								{/if}
								<Button variant={btn_flavor}>{btn_flavor}</Button>
							{/each}
						</ButtonGroup>
						<ButtonGroup>
							<ButtonGroup>
								<Button variant="outline">-</Button>
								<ButtonGroupText variant="outline">Text Element</ButtonGroupText>
								<Button variant="outline">+</Button>
							</ButtonGroup>
							<ButtonGroup>
								<Button variant="outline">Left</Button>
								<Button variant="outline">Middle</Button>
								<Button variant="outline">Right</Button>
							</ButtonGroup>
						</ButtonGroup>
						<ButtonGroup>
							<Button variant="outline" size="xs">XS</Button>
							<Button variant="outline" size="sm">Small</Button>
							<Button variant="outline" size="default">Default</Button>
							<Button variant="outline" size="lg">Large</Button>
							<Button variant="outline" size="icon-xs"><Star /></Button>
							<Button variant="outline" size="icon-sm"><Star /></Button>
							<Button variant="outline" size="icon"><Star /></Button>
							<Button variant="outline" size="icon-lg"><Star /></Button>
						</ButtonGroup>
						<ButtonGroup orientation="vertical">
							<Button variant="outline">Top</Button>
							<Button variant="outline">Middle</Button>
							<Button variant="outline">Bottom</Button>
						</ButtonGroup>
					</CardContent>
				</Card>
			</GridItem>
		</Grid>
	</CardContent>
</Card>
