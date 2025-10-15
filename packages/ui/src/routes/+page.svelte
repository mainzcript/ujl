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
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogDescription,
		DialogBody,
		DialogFooter,
		DialogTriggerButton,
		DialogCloseButton,
		Drawer,
		DrawerContent,
		DrawerHeader,
		DrawerTitle,
		DrawerDescription,
		DrawerFooter,
		DrawerTriggerButton,
		DrawerCloseButton,
		ScrollArea,
		ResizablePaneGroup,
		ResizablePane,
		ResizableHandle,
		Grid,
		GridItem,
		Popover,
		PopoverContent,
		PopoverClose,
		PopoverTriggerButton,
		HoverCard,
		HoverCardTrigger,
		HoverCardContent,
		Tooltip,
		TooltipTrigger,
		TooltipContent,
		TooltipProvider,
		DropdownMenu,
		DropdownMenuTrigger,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuLabel,
		DropdownMenuSeparator,
		DropdownMenuGroup,
		DropdownMenuShortcut,
		DropdownMenuSub,
		DropdownMenuSubTrigger,
		DropdownMenuSubContent,
		ContextMenu,
		ContextMenuTrigger,
		ContextMenuContent,
		ContextMenuItem,
		ContextMenuLabel,
		ContextMenuSeparator,
		ContextMenuGroup,
		ContextMenuShortcut,
		ContextMenuCheckboxItem,
		ContextMenuRadioGroup,
		ContextMenuRadioItem,
		ContextMenuSub,
		ContextMenuSubTrigger,
		ContextMenuSubContent,
		Sheet,
		SheetContent,
		SheetHeader,
		SheetBody,
		SheetTitle,
		SheetDescription,
		SheetFooter,
		SheetTriggerButton,
		SheetCloseButton,
		Table,
		TableBody,
		TableCaption,
		TableCell,
		TableFooter,
		TableHead,
		TableHeader,
		TableRow,
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
		Alert,
		AlertTitle,
		AlertDescription,
		Badge,
		Progress,
		Skeleton,
		Toaster,
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
	import { flavors } from '$lib/tokens/index.js';
	import { toast } from 'svelte-sonner';
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
										<Button variant="muted" size="sm">Action</Button>
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
									<CardTitle>Color Shades</CardTitle>
									<CardDescription>This are all shades of the {flavor}-flavor.</CardDescription>
								</CardHeader>
								<CardContent>
									<div class="elevation border-flavor-500/25 overflow-hidden rounded-xl border">
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
									<CardTitle>Buttons</CardTitle>
								</CardHeader>
								<CardContent>
									<div class="flex gap-2">
										<Button>Default</Button>
										<Button variant="muted">Muted</Button>
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
									<CardTitle>Overlay Components</CardTitle>
								</CardHeader>
								<CardContent>
									<div class="flex items-center gap-2">
										<Dialog>
											<DialogTriggerButton>Dialog</DialogTriggerButton>
											<DialogContent class="sm:max-w-[425px]">
												<DialogHeader>
													<DialogTitle>Dialog Title</DialogTitle>
													<DialogDescription>This is the Dialog Description.</DialogDescription>
												</DialogHeader>
												<DialogBody>
													<Text>The Dialog Body goes here.</Text>
												</DialogBody>
												<DialogFooter>
													<DialogCloseButton size="sm" variant="muted">Close</DialogCloseButton>
												</DialogFooter>
											</DialogContent>
										</Dialog>
										<Drawer>
											<DrawerTriggerButton>Drawer</DrawerTriggerButton>
											<DrawerContent>
												<div class="mx-auto w-full max-w-sm">
													<DrawerHeader>
														<DrawerTitle>Drawer Title</DrawerTitle>
														<DrawerDescription>This is the Drawer Description.</DrawerDescription>
													</DrawerHeader>
													<div class="p-4 pb-0">
														<Text>
															This is the content of the drawer. It slides up from the bottom and is
															perfect for mobile interfaces.
														</Text>
													</div>
													<DrawerFooter>
														<Button>Submit</Button>
														<DrawerCloseButton variant="muted">Cancel</DrawerCloseButton>
													</DrawerFooter>
												</div>
											</DrawerContent>
										</Drawer>
										<Popover>
											<PopoverTriggerButton>Popover</PopoverTriggerButton>
											<PopoverContent>
												<div class="space-y-2">
													<Text size="sm">
														This is the content of the popover. It appears over other elements.
													</Text>
													<div class="flex justify-end">
														<PopoverClose>
															<Button variant="muted" size="sm">Close</Button>
														</PopoverClose>
													</div>
												</div>
											</PopoverContent>
										</Popover>
										<DropdownMenu>
											<DropdownMenuTrigger>
												{#snippet child({ props }: { props: Record<string, unknown> })}
													<Button {...props}>Dropdown Menu</Button>
												{/snippet}
											</DropdownMenuTrigger>
											<DropdownMenuContent class="w-56" align="start">
												<DropdownMenuLabel>My Account</DropdownMenuLabel>
												<DropdownMenuSeparator />
												<DropdownMenuGroup>
													<DropdownMenuItem>
														Profile
														<DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
													</DropdownMenuItem>
													<DropdownMenuItem>
														Billing
														<DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
													</DropdownMenuItem>
													<DropdownMenuItem>
														Settings
														<DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
													</DropdownMenuItem>
												</DropdownMenuGroup>
												<DropdownMenuSeparator />
												<DropdownMenuSub>
													<DropdownMenuSubTrigger>Team</DropdownMenuSubTrigger>
													<DropdownMenuSubContent>
														<DropdownMenuItem>Invite users</DropdownMenuItem>
														<DropdownMenuItem>Email</DropdownMenuItem>
														<DropdownMenuItem>Message</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem>More...</DropdownMenuItem>
													</DropdownMenuSubContent>
												</DropdownMenuSub>
												<DropdownMenuItem>New Team</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem>GitHub</DropdownMenuItem>
												<DropdownMenuItem>Support</DropdownMenuItem>
												<DropdownMenuItem disabled>API</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem>
													Log out
													<DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
										<Sheet>
											<SheetTriggerButton>Sheet</SheetTriggerButton>
											<SheetContent side="right">
												<SheetHeader>
													<SheetTitle>Sheet Title</SheetTitle>
													<SheetDescription>This is the Sheet Description.</SheetDescription>
												</SheetHeader>
												<SheetBody>
													<Text>
														Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
														eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam
														voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet
														clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit
														amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
														nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
														sed diam voluptua. At vero eos et accusam et justo duo dolores et ea
														rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem
														ipsum dolor sit amet.
													</Text>
												</SheetBody>
												<SheetFooter>
													<SheetCloseButton variant="muted">Save changes</SheetCloseButton>
												</SheetFooter>
											</SheetContent>
										</Sheet>
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger>
													<Text class="p-2 underline">Tooltip</Text>
												</TooltipTrigger>
												<TooltipContent>This is a tooltip.</TooltipContent>
											</Tooltip>
										</TooltipProvider>
										<HoverCard>
											<HoverCardTrigger>
												<Text class="p-2 underline">@hover-card</Text>
											</HoverCardTrigger>
											<HoverCardContent>
												<div class="space-y-2">
													<Text size="sm">This is the content of the hover card.</Text>
												</div>
											</HoverCardContent>
										</HoverCard>
										<ContextMenu>
											<ContextMenuTrigger
												class="border-foreground rounded-md border border-dashed p-2"
											>
												<Text size="sm">Right click here</Text>
											</ContextMenuTrigger>
											<ContextMenuContent class="w-52">
												<ContextMenuItem inset>
													Back
													<ContextMenuShortcut>⌘[</ContextMenuShortcut>
												</ContextMenuItem>
												<ContextMenuItem inset disabled>
													Forward
													<ContextMenuShortcut>⌘]</ContextMenuShortcut>
												</ContextMenuItem>
												<ContextMenuItem inset>
													Reload
													<ContextMenuShortcut>⌘R</ContextMenuShortcut>
												</ContextMenuItem>
												<ContextMenuSub>
													<ContextMenuSubTrigger inset>More Tools</ContextMenuSubTrigger>
													<ContextMenuSubContent class="w-48">
														<ContextMenuItem>
															Save Page As...
															<ContextMenuShortcut>⇧⌘S</ContextMenuShortcut>
														</ContextMenuItem>
														<ContextMenuItem>Create Shortcut...</ContextMenuItem>
														<ContextMenuItem>Name Window...</ContextMenuItem>
														<ContextMenuSeparator />
														<ContextMenuItem>Developer Tools</ContextMenuItem>
													</ContextMenuSubContent>
												</ContextMenuSub>
												<ContextMenuSeparator />
												<ContextMenuCheckboxItem>Show Bookmarks</ContextMenuCheckboxItem>
												<ContextMenuCheckboxItem>Show Full URLs</ContextMenuCheckboxItem>
												<ContextMenuSeparator />
												<ContextMenuRadioGroup>
													<ContextMenuGroup>
														<ContextMenuLabel inset>People</ContextMenuLabel>
														<ContextMenuRadioItem value="pedro">Pedro Duarte</ContextMenuRadioItem>
														<ContextMenuRadioItem value="colm">Colm Tuite</ContextMenuRadioItem>
													</ContextMenuGroup>
												</ContextMenuRadioGroup>
											</ContextMenuContent>
										</ContextMenu>
									</div>
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
										<ResizablePaneGroup
											direction="horizontal"
											class="elevation h-full w-full rounded-md"
										>
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
						<GridItem>
							<Card>
								<CardHeader>
									<CardTitle>Table</CardTitle>
								</CardHeader>
								<CardContent>
									<Table>
										<TableCaption>This is the table caption.</TableCaption>
										<TableHeader>
											<TableRow>
												<TableHead class="w-[100px]">Invoice</TableHead>
												<TableHead>Status</TableHead>
												<TableHead>Method</TableHead>
												<TableHead class="text-right">Amount</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											<TableRow>
												<TableCell class="font-medium">INV001</TableCell>
												<TableCell>Paid</TableCell>
												<TableCell>Credit Card</TableCell>
												<TableCell class="text-right">$250.00</TableCell>
											</TableRow>
											<TableRow>
												<TableCell class="font-medium">INV002</TableCell>
												<TableCell>Pending</TableCell>
												<TableCell>PayPal</TableCell>
												<TableCell class="text-right">$150.00</TableCell>
											</TableRow>
											<TableRow>
												<TableCell class="font-medium">INV003</TableCell>
												<TableCell>Unpaid</TableCell>
												<TableCell>Bank Transfer</TableCell>
												<TableCell class="text-right">$350.00</TableCell>
											</TableRow>
											<TableRow>
												<TableCell class="font-medium">INV004</TableCell>
												<TableCell>Paid</TableCell>
												<TableCell>Credit Card</TableCell>
												<TableCell class="text-right">$450.00</TableCell>
											</TableRow>
											<TableRow>
												<TableCell class="font-medium">INV005</TableCell>
												<TableCell>Paid</TableCell>
												<TableCell>PayPal</TableCell>
												<TableCell class="text-right">$550.00</TableCell>
											</TableRow>
											<TableRow>
												<TableCell class="font-medium">INV006</TableCell>
												<TableCell>Pending</TableCell>
												<TableCell>Bank Transfer</TableCell>
												<TableCell class="text-right">$200.00</TableCell>
											</TableRow>
											<TableRow>
												<TableCell class="font-medium">INV007</TableCell>
												<TableCell>Unpaid</TableCell>
												<TableCell>Credit Card</TableCell>
												<TableCell class="text-right">$300.00</TableCell>
											</TableRow>
										</TableBody>
										<TableFooter>
											<TableRow>
												<TableCell colspan={3}>Total</TableCell>
												<TableCell class="text-right">$2,500.00</TableCell>
											</TableRow>
										</TableFooter>
									</Table>
								</CardContent>
							</Card>
						</GridItem>
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
													<CardDescription>
														Manage your application settings and preferences.
													</CardDescription>
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
													Our flagship product combines cutting-edge technology with sleek design.
													Built with premium materials, it offers unparalleled performance and
													reliability.
												</Text>
												<Text size="sm">
													Key features include advanced processing capabilities, and an intuitive
													user interface designed for both beginners and experts.
												</Text>
											</AccordionContent>
										</AccordionItem>
										<AccordionItem value="item-2">
											<AccordionTrigger>Shipping Details</AccordionTrigger>
											<AccordionContent class="flex flex-col gap-4 text-balance">
												<Text size="sm">
													We offer worldwide shipping through trusted courier partners. Standard
													delivery takes 3-5 business days, while express shipping ensures delivery
													within 1-2 business days.
												</Text>
												<Text size="sm">
													All orders are carefully packaged and fully insured. Track your shipment
													in real-time through our dedicated tracking portal.
												</Text>
											</AccordionContent>
										</AccordionItem>
										<AccordionItem value="item-3">
											<AccordionTrigger>Return Policy</AccordionTrigger>
											<AccordionContent class="flex flex-col gap-4 text-balance">
												<Text size="sm">
													We stand behind our products with a comprehensive 30-day return policy. If
													you're not completely satisfied, simply return the item in its original
													condition.
												</Text>
												<Text size="sm">
													Our hassle-free return process includes free return shipping and full
													refunds processed within 48 hours of receiving the returned item.
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
									<CardTitle>Feedback</CardTitle>
								</CardHeader>
								<CardContent class="space-y-6">
									<!-- Alert Examples -->
									<div class="space-y-3">
										<Text size="sm" class="font-medium">Alerts:</Text>
										<div class="space-y-2">
											<Alert>
												<AlertTitle>Default Alert</AlertTitle>
												<AlertDescription>
													This is an default alert with title and description.
												</AlertDescription>
											</Alert>
											{#each flavors as alert_flavor (alert_flavor)}
												<Alert flavor={alert_flavor}>
													<AlertTitle>{alert_flavor} Alert</AlertTitle>
													<AlertDescription>
														This is an {alert_flavor} alert with title and description.
													</AlertDescription>
												</Alert>
											{/each}
										</div>
									</div>

									<!-- Badge Examples -->
									<div class="space-y-3">
										<Text size="sm" class="font-medium">Badges:</Text>
										<div class="flex flex-wrap gap-2">
											<Badge>Default</Badge>
											{#each flavors as badge_flavor (badge_flavor)}
												<Badge flavor={badge_flavor}>{badge_flavor}</Badge>
											{/each}
											<Badge variant="outline">Outline</Badge>
											<Badge class="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums">8</Badge>
											<Badge class="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums">99</Badge>
										</div>
									</div>

									<!-- Progress Examples -->
									<div class="space-y-3">
										<Text size="sm" class="font-medium">Progress:</Text>
										<div class="space-y-2">
											<Progress value={33} class="w-full" />
											<Progress value={66} class="w-full" />
											<Progress value={100} class="w-full" />
										</div>
									</div>

									<!-- Skeleton Examples -->
									<div class="space-y-3">
										<Text size="sm" class="font-medium">Skeleton:</Text>
										<div class="flex items-center space-x-4">
											<Skeleton class="size-12 rounded-full" />
											<div class="space-y-2">
												<Skeleton class="h-4 w-[250px]" />
												<Skeleton class="h-4 w-[200px]" />
											</div>
										</div>
									</div>

									<!-- Sonner/Toaster Examples -->
									<div class="space-y-3">
										<Text size="sm" class="font-medium">Sonner (Toaster):</Text>
										<div class="flex flex-wrap gap-2">
											<Button
												size="sm"
												onclick={() => toast.success('Success! Your changes have been saved.')}
											>
												Success Toast
											</Button>
											<Button
												size="sm"
												flavor="destructive"
												onclick={() => toast.error('Error! Something went wrong.')}
											>
												Error Toast
											</Button>
											<Button
												size="sm"
												variant="outline"
												onclick={() => toast.info('Info: Here is some information.')}
											>
												Info Toast
											</Button>
											<Button
												size="sm"
												variant="muted"
												onclick={() => toast.warning('Warning: Please check your input.')}
											>
												Warning Toast
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>
						</GridItem>
						<GridItem>
							<Card>
								<CardContent>
									<Grid>
										<GridItem>
											<Card>
												<CardHeader>
													<CardTitle>Media</CardTitle>
													<CardDescription
														>Avatar components for user profiles and media display.</CardDescription
													>
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
															<Avatar class="border-background border-2">
																<AvatarImage src="https://github.com/shadcn.png" alt="User 1" />
																<AvatarFallback>U1</AvatarFallback>
															</Avatar>
															<Avatar class="border-background border-2">
																<AvatarImage src="https://github.com/shadcn.png" alt="User 2" />
																<AvatarFallback>U2</AvatarFallback>
															</Avatar>
															<Avatar class="border-background border-2">
																<AvatarImage src="https://github.com/shadcn.png" alt="User 3" />
																<AvatarFallback>U3</AvatarFallback>
															</Avatar>
															<Avatar class="border-background border-2">
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
																			<CardContent
																				class="flex aspect-square items-center justify-center p-6"
																			>
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
								</CardContent>
							</Card>
						</GridItem>
					</Grid>
				</CardContent>
			</Card>
		</Container>
	</section>
{/each}

<!-- Toaster for toast notifications -->
<Toaster />
