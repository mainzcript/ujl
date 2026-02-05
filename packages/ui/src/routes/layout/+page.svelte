<script lang="ts">
	import {
		Card,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader,
		CardTitle,
		Text,
		Grid,
		GridItem,
		Breadcrumb,
		BreadcrumbList,
		BreadcrumbItem,
		BreadcrumbLink,
		BreadcrumbPage,
		BreadcrumbSeparator,
		BreadcrumbEllipsis,
		Tabs,
		TabsList,
		TabsTrigger,
		TabsContent,
		Accordion,
		AccordionItem,
		AccordionTrigger,
		AccordionContent,
		Collapsible,
		CollapsibleTriggerButton,
		CollapsibleContent,
		Skeleton,
		ScrollArea,
		ResizablePaneGroup,
		ResizablePane,
		ResizableHandle,
		Heading,
	} from "$lib/index.js";
	import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
</script>

<Grid>
	<GridItem>
		<Card>
			<CardHeader>
				<CardTitle>Breadcrumb</CardTitle>
			</CardHeader>
			<CardContent>
				<Breadcrumb>
					<BreadcrumbList>
						<BreadcrumbItem>
							<BreadcrumbLink href="/">Home</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbEllipsis />
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbLink href="/docs/components">Components</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbPage>Breadcrumb</BreadcrumbPage>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>
			</CardContent>
		</Card>
	</GridItem>
	<GridItem>
		<Card>
			<CardHeader>
				<CardTitle>Tabs</CardTitle>
			</CardHeader>
			<CardContent>
				<Tabs value="account">
					<TabsList>
						<TabsTrigger value="account">Account</TabsTrigger>
						<TabsTrigger value="password">Password</TabsTrigger>
						<TabsTrigger value="settings">Settings</TabsTrigger>
					</TabsList>
					<TabsContent value="account">
						<Card>
							<CardHeader>
								<CardTitle>Account</CardTitle>
								<CardDescription>
									Make changes to your account here. Click save when you're done.
								</CardDescription>
							</CardHeader>
							<CardContent class="space-y-4">
								<div class="space-y-2">
									<Skeleton class="h-4 w-16" />
									<Skeleton class="h-4 w-32" />
								</div>
								<div class="space-y-2">
									<Skeleton class="h-4 w-20" />
									<Skeleton class="h-4 w-24" />
								</div>
							</CardContent>
							<CardFooter>
								<Skeleton class="h-8 w-24" />
							</CardFooter>
						</Card>
					</TabsContent>
					<TabsContent value="password">
						<Card>
							<CardHeader>
								<CardTitle>Password</CardTitle>
								<CardDescription>
									Change your password here. After saving, you'll be logged out.
								</CardDescription>
							</CardHeader>
							<CardContent class="space-y-4">
								<div class="space-y-2">
									<Skeleton class="h-4 w-28" />
									<Skeleton class="h-4 w-32" />
								</div>
								<div class="space-y-2">
									<Skeleton class="h-4 w-24" />
									<Skeleton class="h-4 w-32" />
								</div>
							</CardContent>
							<CardFooter>
								<Skeleton class="h-8 w-28" />
							</CardFooter>
						</Card>
					</TabsContent>
					<TabsContent value="settings">
						<Card>
							<CardHeader>
								<CardTitle>Settings</CardTitle>
								<CardDescription>Manage your application settings and preferences.</CardDescription>
							</CardHeader>
							<CardContent class="space-y-4">
								<div class="space-y-2">
									<Skeleton class="h-4 w-16" />
									<Skeleton class="h-4 w-20" />
								</div>
								<div class="space-y-2">
									<Skeleton class="h-4 w-20" />
									<Skeleton class="h-4 w-16" />
								</div>
							</CardContent>
							<CardFooter>
								<Skeleton class="h-8 w-28" />
							</CardFooter>
						</Card>
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	</GridItem>
	<GridItem>
		<Card>
			<CardHeader>
				<CardTitle>Accordion</CardTitle>
			</CardHeader>
			<CardContent>
				<Accordion type="single" class="w-full" value="item-1">
					<AccordionItem value="item-1">
						<AccordionTrigger>Product Information</AccordionTrigger>
						<AccordionContent class="flex flex-col gap-4 text-balance">
							<Text size="sm">
								Our flagship product combines cutting-edge technology with sleek design. Built with
								premium materials, it offers unparalleled performance and reliability.
							</Text>
							<Text size="sm">
								Key features include advanced processing capabilities, and an intuitive user
								interface designed for both beginners and experts.
							</Text>
						</AccordionContent>
					</AccordionItem>
					<AccordionItem value="item-2">
						<AccordionTrigger>Shipping Details</AccordionTrigger>
						<AccordionContent class="flex flex-col gap-4 text-balance">
							<Text size="sm">
								We offer worldwide shipping through trusted courier partners. Standard delivery
								takes 3-5 business days, while express shipping ensures delivery within 1-2 business
								days.
							</Text>
							<Text size="sm">
								All orders are carefully packaged and fully insured. Track your shipment in
								real-time through our dedicated tracking portal.
							</Text>
						</AccordionContent>
					</AccordionItem>
					<AccordionItem value="item-3">
						<AccordionTrigger>Return Policy</AccordionTrigger>
						<AccordionContent class="flex flex-col gap-4 text-balance">
							<Text size="sm">
								We stand behind our products with a comprehensive 30-day return policy. If you're
								not completely satisfied, simply return the item in its original condition.
							</Text>
							<Text size="sm">
								Our hassle-free return process includes free return shipping and full refunds
								processed within 48 hours of receiving the returned item.
							</Text>
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</CardContent>
		</Card>
	</GridItem>
	<GridItem>
		<Card>
			<CardHeader>
				<CardTitle>Collapsible</CardTitle>
			</CardHeader>
			<CardContent>
				<Collapsible class="w-[350px] space-y-2">
					<div class="flex items-center justify-between space-x-4 px-4">
						<h4 class="text-sm font-semibold">@huntabyte starred 3 repositories</h4>
						<CollapsibleTriggerButton variant="ghost" size="sm" class="w-9 p-0">
							<ChevronsUpDownIcon />
							<span class="sr-only">Toggle</span>
						</CollapsibleTriggerButton>
					</div>
					<div class="rounded-md border px-4 py-3 font-mono text-sm">@huntabyte/bits-ui</div>
					<CollapsibleContent class="space-y-2">
						<div class="rounded-md border px-4 py-3 font-mono text-sm">@melt-ui/melt-ui</div>
						<div class="rounded-md border px-4 py-3 font-mono text-sm">@sveltejs/svelte</div>
					</CollapsibleContent>
				</Collapsible>
			</CardContent>
		</Card>
	</GridItem>
	<GridItem>
		<Card>
			<CardHeader>
				<CardTitle>Scroll Area</CardTitle>
			</CardHeader>
			<CardContent>
				<ScrollArea class="elevation h-32 w-full rounded-md">
					<div class="p-4">
						{#each Array(20), i (i)}
							<Text class="mb-1"
								>Line {i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Text
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
			</CardHeader>
			<CardContent>
				<div class="h-48 w-full">
					<ResizablePaneGroup direction="horizontal" class="elevation h-full w-full rounded-md">
						<ResizablePane defaultSize={50} minSize={20}>
							<div class="p-6">
								<Heading class="mb-2" level={3}>Left Pane</Heading>
								<Text>This pane can be resized by dragging the handle.</Text>
							</div>
						</ResizablePane>
						<ResizableHandle withHandle />
						<ResizablePane defaultSize={50} minSize={20}>
							<div class="p-6">
								<Heading class="mb-2" level={3}>Right Pane</Heading>
								<Text>Drag the handle to change the size of the panes.</Text>
							</div>
						</ResizablePane>
					</ResizablePaneGroup>
				</div>
			</CardContent>
		</Card>
	</GridItem>
</Grid>
