<script module lang="ts">
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger,
		SelectGroup,
		SelectGroupHeading,
		SelectSeparator,
	} from "./index.ts";
	import { Label } from "../label/index.ts";

	const { Story } = defineMeta({
		title: "Components/Forms/Select",
		component: Select,
		tags: ["autodocs"],
		argTypes: {
			disabled: {
				control: "boolean",
				description: "Whether the select is disabled",
				table: {
					category: "State",
					defaultValue: { summary: "false" },
				},
			},
		},
		args: {
			disabled: false,
		},
	});
</script>

<!-- Default -->
<Story name="Default">
	{#snippet template(args)}
		<Select {...args}>
			<SelectTrigger class="w-[200px]">
				<span data-slot="select-value" data-placeholder>Select a fruit</span>
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="apple">Apple</SelectItem>
				<SelectItem value="banana">Banana</SelectItem>
				<SelectItem value="orange">Orange</SelectItem>
				<SelectItem value="grape">Grape</SelectItem>
				<SelectItem value="mango">Mango</SelectItem>
			</SelectContent>
		</Select>
	{/snippet}
</Story>

<!-- With Label -->
<Story name="With Label">
	{#snippet template(args)}
		<div class="grid w-full max-w-sm gap-1.5">
			<Label for="fruit-select">Favorite Fruit</Label>
			<Select {...args}>
				<SelectTrigger id="fruit-select" class="w-full">
					<span data-slot="select-value" data-placeholder>Select a fruit</span>
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="apple">Apple</SelectItem>
					<SelectItem value="banana">Banana</SelectItem>
					<SelectItem value="orange">Orange</SelectItem>
				</SelectContent>
			</Select>
		</div>
	{/snippet}
</Story>

<!-- With Groups -->
<Story name="With Groups">
	{#snippet template(args)}
		<Select {...args}>
			<SelectTrigger class="w-[250px]">
				<span data-slot="select-value" data-placeholder>Select a timezone</span>
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectGroupHeading>North America</SelectGroupHeading>
					<SelectItem value="est">Eastern Standard Time (EST)</SelectItem>
					<SelectItem value="cst">Central Standard Time (CST)</SelectItem>
					<SelectItem value="mst">Mountain Standard Time (MST)</SelectItem>
					<SelectItem value="pst">Pacific Standard Time (PST)</SelectItem>
				</SelectGroup>
				<SelectSeparator />
				<SelectGroup>
					<SelectGroupHeading>Europe</SelectGroupHeading>
					<SelectItem value="gmt">Greenwich Mean Time (GMT)</SelectItem>
					<SelectItem value="cet">Central European Time (CET)</SelectItem>
					<SelectItem value="eet">Eastern European Time (EET)</SelectItem>
				</SelectGroup>
				<SelectSeparator />
				<SelectGroup>
					<SelectGroupHeading>Asia</SelectGroupHeading>
					<SelectItem value="jst">Japan Standard Time (JST)</SelectItem>
					<SelectItem value="cst-china">China Standard Time (CST)</SelectItem>
					<SelectItem value="ist">India Standard Time (IST)</SelectItem>
				</SelectGroup>
			</SelectContent>
		</Select>
	{/snippet}
</Story>

<!-- Disabled -->
<Story name="Disabled" args={{ disabled: true }}>
	{#snippet template(args)}
		<Select {...args}>
			<SelectTrigger class="w-[200px]">
				<span data-slot="select-value" data-placeholder>Disabled select</span>
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="option1">Option 1</SelectItem>
				<SelectItem value="option2">Option 2</SelectItem>
			</SelectContent>
		</Select>
	{/snippet}
</Story>

<!-- Disabled Items -->
<Story name="Disabled Items">
	{#snippet template(args)}
		<Select {...args}>
			<SelectTrigger class="w-[200px]">
				<span data-slot="select-value" data-placeholder>Select an option</span>
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="option1">Available option</SelectItem>
				<SelectItem value="option2" disabled>Disabled option</SelectItem>
				<SelectItem value="option3">Another option</SelectItem>
				<SelectItem value="option4" disabled>Also disabled</SelectItem>
			</SelectContent>
		</Select>
	{/snippet}
</Story>

<!-- With Icons -->
<Story name="With Icons">
	{#snippet template(args)}
		<Select {...args}>
			<SelectTrigger class="w-[200px]">
				<span data-slot="select-value" data-placeholder>Select status</span>
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="active">
					<span class="flex items-center gap-2">
						<span class="size-2 rounded-full bg-green-500"></span>
						Active
					</span>
				</SelectItem>
				<SelectItem value="pending">
					<span class="flex items-center gap-2">
						<span class="size-2 rounded-full bg-yellow-500"></span>
						Pending
					</span>
				</SelectItem>
				<SelectItem value="inactive">
					<span class="flex items-center gap-2">
						<span class="size-2 rounded-full bg-red-500"></span>
						Inactive
					</span>
				</SelectItem>
				<SelectItem value="archived">
					<span class="flex items-center gap-2">
						<span class="size-2 rounded-full bg-gray-500"></span>
						Archived
					</span>
				</SelectItem>
			</SelectContent>
		</Select>
	{/snippet}
</Story>

<!-- Size Variants -->
<Story name="Size Variants">
	{#snippet template(args)}
		<div class="flex items-center gap-4">
			<div class="space-y-1">
				<Label class="text-xs text-muted-foreground">Small</Label>
				<Select {...args}>
					<SelectTrigger class="w-[150px]" size="sm">
						<span data-slot="select-value" data-placeholder>Small</span>
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="option1">Option 1</SelectItem>
						<SelectItem value="option2">Option 2</SelectItem>
					</SelectContent>
				</Select>
			</div>
			<div class="space-y-1">
				<Label class="text-xs text-muted-foreground">Default</Label>
				<Select {...args}>
					<SelectTrigger class="w-[150px]">
						<span data-slot="select-value" data-placeholder>Default</span>
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="option1">Option 1</SelectItem>
						<SelectItem value="option2">Option 2</SelectItem>
					</SelectContent>
				</Select>
			</div>
		</div>
	{/snippet}
</Story>

<!-- Form Example -->
<Story name="Form Example">
	{#snippet template(args)}
		<form class="w-full max-w-sm space-y-4">
			<div class="space-y-2">
				<Label for="country">Country</Label>
				<Select {...args}>
					<SelectTrigger id="country" class="w-full">
						<span data-slot="select-value" data-placeholder>Select your country</span>
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="us">United States</SelectItem>
						<SelectItem value="uk">United Kingdom</SelectItem>
						<SelectItem value="de">Germany</SelectItem>
						<SelectItem value="fr">France</SelectItem>
						<SelectItem value="jp">Japan</SelectItem>
					</SelectContent>
				</Select>
			</div>
			<div class="space-y-2">
				<Label for="language">Language</Label>
				<Select {...args}>
					<SelectTrigger id="language" class="w-full">
						<span data-slot="select-value" data-placeholder>Select language</span>
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="en">English</SelectItem>
						<SelectItem value="de">German</SelectItem>
						<SelectItem value="fr">French</SelectItem>
						<SelectItem value="es">Spanish</SelectItem>
					</SelectContent>
				</Select>
			</div>
		</form>
	{/snippet}
</Story>

<!-- Playground -->
<Story name="Playground">
	{#snippet template(args)}
		<Select {...args}>
			<SelectTrigger class="w-[200px]">
				<span data-slot="select-value" data-placeholder>Select option</span>
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="option1">Option 1</SelectItem>
				<SelectItem value="option2">Option 2</SelectItem>
				<SelectItem value="option3">Option 3</SelectItem>
			</SelectContent>
		</Select>
	{/snippet}
</Story>
