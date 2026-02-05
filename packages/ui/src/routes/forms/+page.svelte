<script lang="ts">
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle,
		Text,
		Button,
		Grid,
		GridItem,
		Select,
		SelectTrigger,
		SelectContent,
		SelectItem,
		SelectLabel,
		SelectGroup,
		SelectSeparator,
		Slider,
		Input,
		Textarea,
		ColorPicker,
		InputGroup,
		InputGroupAddon,
		InputGroupButton,
		InputGroupInput,
		InputGroupText,
		InputGroupTextarea,
		Switch,
		Label,
		Kbd,
		KbdGroup,
		Checkbox,
		Toggle,
		ToggleGroup,
		ToggleGroupItem,
		Command,
		CommandInput,
		CommandList,
		CommandEmpty,
		CommandGroup,
		CommandItem,
		CommandSeparator,
		CommandShortcut,
		Combobox,
		ComboboxTrigger,
		ComboboxContent,
		ComboboxCommand,
		ComboboxInput,
		ComboboxList,
		ComboboxEmpty,
		ComboboxGroup,
		ComboboxItem,
		ComboboxSeparator,
	} from "$lib/index.js";
	import { tick } from "svelte";
	import SearchIcon from "@lucide/svelte/icons/search";
	import MailIcon from "@lucide/svelte/icons/mail";
	import CheckIcon from "@lucide/svelte/icons/check";
	import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
	import PlusIcon from "@lucide/svelte/icons/plus";
	import InfoIcon from "@lucide/svelte/icons/info";
	import ItalicIcon from "@lucide/svelte/icons/italic";
	import BoldIcon from "@lucide/svelte/icons/bold";
	import UnderlineIcon from "@lucide/svelte/icons/underline";
	import AlignLeftIcon from "@lucide/svelte/icons/align-left";
	import AlignCenterIcon from "@lucide/svelte/icons/align-center";
	import AlignRightIcon from "@lucide/svelte/icons/align-right";
	import CalculatorIcon from "@lucide/svelte/icons/calculator";
	import CalendarIcon from "@lucide/svelte/icons/calendar";
	import CreditCardIcon from "@lucide/svelte/icons/credit-card";
	import SettingsIcon from "@lucide/svelte/icons/settings";
	import SmileIcon from "@lucide/svelte/icons/smile";
	import UserIcon from "@lucide/svelte/icons/user";

	// Form component state
	const selectOptions = [
		{ value: "option1", label: "Option 1" },
		{ value: "option2", label: "Option 2" },
		{ value: "option3", label: "Option 3" },
		{ value: "option4", label: "Option 4" },
		{ value: "option5", label: "Option 5" },
	];
	let selectValue = $state<string>("");
	const selectTriggerContent = $derived(
		selectOptions.find((opt) => opt.value === selectValue)?.label ?? "Select an option",
	);
	let sliderSingleValue = $state(50);
	let sliderRangeValue = $state<number[]>([25, 75]);
	let inputValue = $state<string>("");
	let textareaValue = $state<string>("");
	let colorValue = $state("#ff0000");
	let switchValue = $state(false);
	let checkboxValue = $state(false);
	let toggleValue = $state(false);
	let toggleGroupValue = $state<string>("");

	// Combobox state
	const comboboxOptions = [
		{ value: "option1", label: "Option 1" },
		{ value: "option2", label: "Option 2" },
		{ value: "option3", label: "Option 3" },
		{ value: "option4", label: "Option 4" },
		{ value: "option5", label: "Option 5" },
	];
	let comboboxOpen = $state(false);
	let comboboxValue = $state<string>("");
	let comboboxTriggerRef = $state<HTMLButtonElement | null>(null);

	const comboboxTriggerContent = $derived(
		comboboxOptions.find((opt) => opt.value === comboboxValue)?.label ?? "Select an option",
	);

	function closeAndFocusCombobox() {
		comboboxOpen = false;
		tick().then(() => {
			comboboxTriggerRef?.focus();
		});
	}
</script>

<Grid>
	<GridItem>
		<Card>
			<CardHeader>
				<CardTitle>Form Components</CardTitle>
				<CardDescription>Input, Select and Slider components</CardDescription>
			</CardHeader>
			<CardContent class="space-y-6">
				<!-- Input Examples -->
				<div class="space-y-3">
					<Text size="sm" class="font-medium">Input:</Text>
					<div class="space-y-2">
						<Input bind:value={inputValue} placeholder="Enter something..." />
						{#if inputValue}
							<Text size="sm" intensity="muted">Entered value: {inputValue}</Text>
						{/if}
						<Input type="email" placeholder="Email address" />
						<Input type="password" placeholder="Password" />
						<Input type="number" placeholder="Number" />
					</div>
				</div>

				<!-- Select Examples -->
				<div class="space-y-3">
					<Text size="sm" class="font-medium">Select:</Text>
					<div class="space-y-2">
						<Select type="single" bind:value={selectValue}>
							<SelectTrigger class="w-[180px]">
								{selectTriggerContent}
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectLabel>Options</SelectLabel>
									{#each selectOptions.slice(0, 3) as option (option.value)}
										<SelectItem value={option.value} label={option.label}>
											{option.label}
										</SelectItem>
									{/each}
								</SelectGroup>
								<SelectSeparator />
								<SelectGroup>
									<SelectLabel>More options</SelectLabel>
									{#each selectOptions.slice(3) as option (option.value)}
										<SelectItem value={option.value} label={option.label}>
											{option.label}
										</SelectItem>
									{/each}
								</SelectGroup>
							</SelectContent>
						</Select>
						{#if selectValue}
							<Text size="sm" intensity="muted">Selected value: {selectValue}</Text>
						{/if}
					</div>
				</div>

				<!-- Combobox Examples -->
				<div class="space-y-3">
					<Text size="sm" class="font-medium">Combobox:</Text>
					<div class="space-y-2">
						<Combobox bind:open={comboboxOpen} bind:value={comboboxValue}>
							<ComboboxTrigger bind:ref={comboboxTriggerRef} class="w-[180px]">
								{comboboxTriggerContent}
							</ComboboxTrigger>
							<ComboboxContent class="w-[180px] p-0">
								<ComboboxCommand>
									<ComboboxInput placeholder="Search..." />
									<ComboboxList>
										<ComboboxEmpty>No results found.</ComboboxEmpty>
										<ComboboxGroup>
											{#each comboboxOptions.slice(0, 3) as option (option.value)}
												<ComboboxItem
													value={option.value}
													label={option.label}
													onSelect={() => {
														comboboxValue = option.value;
														closeAndFocusCombobox();
													}}
												>
													{option.label}
												</ComboboxItem>
											{/each}
										</ComboboxGroup>
										<ComboboxSeparator />
										<ComboboxGroup>
											{#each comboboxOptions.slice(3) as option (option.value)}
												<ComboboxItem
													value={option.value}
													label={option.label}
													onSelect={() => {
														comboboxValue = option.value;
														closeAndFocusCombobox();
													}}
												>
													{option.label}
												</ComboboxItem>
											{/each}
										</ComboboxGroup>
									</ComboboxList>
								</ComboboxCommand>
							</ComboboxContent>
						</Combobox>
						{#if comboboxValue}
							<Text size="sm" intensity="muted">Selected value: {comboboxValue}</Text>
						{/if}
					</div>
				</div>

				<!-- Slider Examples -->
				<div class="space-y-3">
					<Text size="sm" class="font-medium">Slider:</Text>
					<div class="space-y-4">
						<div class="space-y-2">
							<Slider
								type="single"
								bind:value={sliderSingleValue}
								max={100}
								step={1}
								class="w-full"
							/>
							<Text size="sm" intensity="muted">Value: {sliderSingleValue}</Text>
						</div>
						<div class="space-y-2">
							<Slider
								type="multiple"
								bind:value={sliderRangeValue}
								max={100}
								step={1}
								class="w-full"
							/>
							<Text size="sm" intensity="muted"
								>Range: {sliderRangeValue[0]} - {sliderRangeValue[1]}</Text
							>
						</div>
					</div>
				</div>

				<!-- Textarea Examples -->
				<div class="space-y-3">
					<Text size="sm" class="font-medium">Textarea:</Text>
					<div class="space-y-2">
						<Textarea bind:value={textareaValue} placeholder="Enter your message..." />
						{#if textareaValue}
							<Text size="sm" intensity="muted">Entered value: {textareaValue}</Text>
						{/if}
					</div>
				</div>

				<!-- Color Picker Examples -->
				<div class="space-y-3">
					<Text size="sm" class="font-medium">Color Picker:</Text>
					<div class="space-y-2">
						<ColorPicker bind:value={colorValue} />
						<Text size="sm" intensity="muted">Selected color: {colorValue}</Text>
					</div>
				</div>

				<!-- Switch Examples -->
				<div class="space-y-3">
					<Text size="sm" class="font-medium">Switch:</Text>
					<div class="space-y-4">
						<div class="flex items-center space-x-2">
							<Switch id="airplane-mode" bind:checked={switchValue} />
							<Label for="airplane-mode">Airplane Mode</Label>
						</div>
						<div class="flex items-center space-x-2">
							<Switch id="notifications" />
							<Label for="notifications">Enable Notifications</Label>
						</div>
						<div class="flex items-center space-x-2">
							<Switch id="disabled-switch" disabled />
							<Label for="disabled-switch">Disabled Switch</Label>
						</div>
						{#if switchValue !== undefined}
							<Text size="sm" intensity="muted">Airplane Mode: {switchValue ? "On" : "Off"}</Text>
						{/if}
					</div>
				</div>

				<!-- Kbd Examples -->
				<div class="space-y-3">
					<Text size="sm" class="font-medium">Kbd:</Text>
					<div class="space-y-4">
						<div class="space-y-2">
							<Text size="xs" intensity="muted">Basic</Text>
							<div class="flex flex-col items-center gap-4">
								<KbdGroup>
									<Kbd>⌘</Kbd>
									<Kbd>⇧</Kbd>
									<Kbd>⌥</Kbd>
									<Kbd>⌃</Kbd>
								</KbdGroup>
								<KbdGroup>
									<Kbd>Ctrl</Kbd>
									<span>+</span>
									<Kbd>B</Kbd>
								</KbdGroup>
							</div>
						</div>
						<div class="space-y-2">
							<Text size="xs" intensity="muted">In text</Text>
							<p class="text-sm text-muted-foreground">
								Use
								<KbdGroup>
									<Kbd>Ctrl + B</Kbd>
									<Kbd>Ctrl + K</Kbd>
								</KbdGroup>
								to open the command palette
							</p>
						</div>
						<div class="space-y-2">
							<Text size="xs" intensity="muted">In button</Text>
							<div class="flex flex-wrap items-center gap-4">
								<Button variant="outline" size="sm" class="pe-2">
									Accept <Kbd>⏎</Kbd>
								</Button>
								<Button variant="outline" size="sm" class="pe-2">
									Cancel <Kbd>Esc</Kbd>
								</Button>
							</div>
						</div>
						<div class="space-y-2">
							<Text size="xs" intensity="muted">In input group</Text>
							<InputGroup>
								<InputGroupInput placeholder="Search..." />
								<InputGroupAddon>
									<SearchIcon />
								</InputGroupAddon>
								<InputGroupAddon align="inline-end">
									<Kbd>⌘</Kbd>
									<Kbd>K</Kbd>
								</InputGroupAddon>
							</InputGroup>
						</div>
					</div>
				</div>

				<!-- Checkbox Examples -->
				<div class="space-y-3">
					<Text size="sm" class="font-medium">Checkbox:</Text>
					<div class="space-y-4">
						<div class="flex items-center space-x-2">
							<Checkbox id="terms" bind:checked={checkboxValue} />
							<Label for="terms">Accept terms and conditions</Label>
						</div>
						<div class="flex items-center space-x-2">
							<Checkbox id="marketing" />
							<Label for="marketing">Subscribe to marketing emails</Label>
						</div>
						<div class="flex items-center space-x-2">
							<Checkbox id="disabled" disabled />
							<Label for="disabled">Disabled checkbox</Label>
						</div>
						{#if checkboxValue !== undefined}
							<Text size="sm" intensity="muted">Checked: {checkboxValue ? "Yes" : "No"}</Text>
						{/if}
					</div>
				</div>

				<!-- Toggle Examples -->
				<div class="space-y-3">
					<Text size="sm" class="font-medium">Toggle:</Text>
					<div class="space-y-4">
						<div class="flex items-center gap-4">
							<Toggle bind:pressed={toggleValue} aria-label="Toggle italic">
								<ItalicIcon />
								<span class="sr-only">Italic</span>
							</Toggle>
							<Toggle aria-label="Toggle bold">
								<BoldIcon />
								<span class="sr-only">Bold</span>
							</Toggle>
							<Toggle disabled aria-label="Toggle underline">
								<UnderlineIcon />
								<span class="sr-only">Underline</span>
							</Toggle>
						</div>
						{#if toggleValue !== undefined}
							<Text size="sm" intensity="muted">Pressed: {toggleValue ? "Yes" : "No"}</Text>
						{/if}
					</div>
				</div>

				<!-- Toggle Group Examples -->
				<div class="space-y-3">
					<Text size="sm" class="font-medium">Toggle Group:</Text>
					<div class="space-y-4">
						<div class="space-y-2">
							<Text size="xs" intensity="muted">Single selection</Text>
							<ToggleGroup type="single" bind:value={toggleGroupValue}>
								<ToggleGroupItem value="left" aria-label="Align left">
									<AlignLeftIcon />
									<span class="sr-only">Left</span>
								</ToggleGroupItem>
								<ToggleGroupItem value="center" aria-label="Align center">
									<AlignCenterIcon />
									<span class="sr-only">Center</span>
								</ToggleGroupItem>
								<ToggleGroupItem value="right" aria-label="Align right">
									<AlignRightIcon />
									<span class="sr-only">Right</span>
								</ToggleGroupItem>
							</ToggleGroup>
							{#if toggleGroupValue}
								<Text size="sm" intensity="muted">Selected: {toggleGroupValue}</Text>
							{/if}
						</div>
					</div>
				</div>

				<!-- Input Group Examples -->
				<div class="space-y-3">
					<Text size="sm" class="font-medium">Input Group:</Text>
					<div class="space-y-4">
						<div class="space-y-2">
							<Text size="xs" intensity="muted">With icon</Text>
							<InputGroup>
								<InputGroupInput placeholder="Search..." />
								<InputGroupAddon align="inline-end">
									<SearchIcon />
								</InputGroupAddon>
							</InputGroup>
						</div>
						<div class="space-y-2">
							<Text size="xs" intensity="muted">With icons</Text>
							<InputGroup>
								<InputGroupInput type="email" placeholder="Enter your email" />
								<InputGroupAddon>
									<MailIcon />
								</InputGroupAddon>
								<InputGroupAddon align="inline-end">
									<CheckIcon />
								</InputGroupAddon>
							</InputGroup>
						</div>
						<div class="space-y-2">
							<Text size="xs" intensity="muted">With text prefix and suffix</Text>
							<InputGroup>
								<InputGroupAddon>
									<InputGroupText>$</InputGroupText>
								</InputGroupAddon>
								<InputGroupInput placeholder="0.00" />
								<InputGroupAddon align="inline-end">
									<InputGroupText>USD</InputGroupText>
								</InputGroupAddon>
							</InputGroup>
						</div>
						<div class="space-y-2">
							<Text size="xs" intensity="muted">URL input</Text>
							<InputGroup>
								<InputGroupAddon>
									<InputGroupText>https://</InputGroupText>
								</InputGroupAddon>
								<InputGroupInput placeholder="example.com" class="pl-0.5!" />
							</InputGroup>
						</div>
						<div class="space-y-2">
							<Text size="xs" intensity="muted">With button</Text>
							<InputGroup>
								<InputGroupInput placeholder="Search..." />
								<InputGroupAddon align="inline-end">
									<InputGroupButton>Search</InputGroupButton>
								</InputGroupAddon>
							</InputGroup>
						</div>
						<div class="space-y-2">
							<Text size="xs" intensity="muted">With icon button</Text>
							<InputGroup>
								<InputGroupInput placeholder="Enter URL..." />
								<InputGroupAddon align="inline-end">
									<InputGroupButton size="icon-xs" variant="ghost">
										<InfoIcon />
									</InputGroupButton>
								</InputGroupAddon>
							</InputGroup>
						</div>
						<div class="space-y-2">
							<Text size="xs" intensity="muted">Textarea with buttons</Text>
							<InputGroup>
								<InputGroupTextarea placeholder="Ask, Search or Chat..." />
								<InputGroupAddon align="block-end" class="bg-input/15">
									<InputGroupButton variant="outline" size="icon-xs">
										<PlusIcon />
									</InputGroupButton>
									<InputGroupText class="ml-auto">52% used</InputGroupText>
									<InputGroupButton variant="default" size="icon-xs">
										<ArrowUpIcon class="text-background" />
										<span class="sr-only">Send</span>
									</InputGroupButton>
								</InputGroupAddon>
							</InputGroup>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	</GridItem>
	<GridItem>
		<Card>
			<CardHeader>
				<CardTitle>Command</CardTitle>
				<CardDescription>Fast, composable command menu component</CardDescription>
			</CardHeader>
			<CardContent class="space-y-6">
				<!-- Command Root Example -->
				<div class="space-y-3">
					<Text size="sm" class="font-medium">Command Menu:</Text>
					<Command class="rounded-lg border shadow-md md:min-w-[450px]">
						<CommandInput placeholder="Type a command or search..." />
						<CommandList>
							<CommandEmpty>No results found.</CommandEmpty>
							<CommandGroup heading="Suggestions">
								<CommandItem>
									<CalendarIcon />
									<span>Calendar</span>
								</CommandItem>
								<CommandItem>
									<SmileIcon />
									<span>Search Emoji</span>
								</CommandItem>
								<CommandItem disabled>
									<CalculatorIcon />
									<span>Calculator</span>
								</CommandItem>
							</CommandGroup>
							<CommandSeparator />
							<CommandGroup heading="Settings">
								<CommandItem>
									<UserIcon />
									<span>Profile</span>
									<CommandShortcut>P</CommandShortcut>
								</CommandItem>
								<CommandItem>
									<CreditCardIcon />
									<span>Billing</span>
									<CommandShortcut>B</CommandShortcut>
								</CommandItem>
								<CommandItem>
									<SettingsIcon />
									<span>Settings</span>
									<CommandShortcut>S</CommandShortcut>
								</CommandItem>
							</CommandGroup>
						</CommandList>
					</Command>
				</div>
			</CardContent>
		</Card>
	</GridItem>
</Grid>
