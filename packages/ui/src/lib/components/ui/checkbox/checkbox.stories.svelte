<script module lang="ts">
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import { Checkbox } from "./index.ts";
	import { Label } from "../label/index.ts";

	const { Story } = defineMeta({
		title: "Components/Forms/Checkbox",
		component: Checkbox,
		tags: ["autodocs"],
		argTypes: {
			checked: {
				control: "boolean",
				description: "Whether the checkbox is checked",
				table: {
					category: "State",
					defaultValue: { summary: "false" },
				},
			},
			indeterminate: {
				control: "boolean",
				description: "Whether the checkbox is in an indeterminate state",
				table: {
					category: "State",
					defaultValue: { summary: "false" },
				},
			},
			disabled: {
				control: "boolean",
				description: "Whether the checkbox is disabled",
				table: {
					category: "State",
					defaultValue: { summary: "false" },
				},
			},
		},
		args: {
			checked: false,
			indeterminate: false,
			disabled: false,
		},
	});
</script>

<!-- Default -->
<Story name="Default">
	{#snippet template(args)}
		<div class="flex items-center space-x-2">
			<Checkbox id="default" {...args} />
			<Label for="default">Accept terms and conditions</Label>
		</div>
	{/snippet}
</Story>

<!-- Checked -->
<Story name="Checked" args={{ checked: true }}>
	{#snippet template(args)}
		<div class="flex items-center space-x-2">
			<Checkbox id="checked" {...args} />
			<Label for="checked">This checkbox is checked</Label>
		</div>
	{/snippet}
</Story>

<!-- Indeterminate -->
<Story name="Indeterminate" args={{ indeterminate: true }}>
	{#snippet template(args)}
		<div class="flex items-center space-x-2">
			<Checkbox id="indeterminate" {...args} />
			<Label for="indeterminate">This checkbox is indeterminate</Label>
		</div>
	{/snippet}
</Story>

<!-- Disabled States -->
<Story name="Disabled States" asChild>
	<div class="flex flex-col gap-4">
		<div class="flex items-center space-x-2">
			<Checkbox id="disabled-unchecked" disabled />
			<Label for="disabled-unchecked" class="text-muted-foreground">Disabled unchecked</Label>
		</div>
		<div class="flex items-center space-x-2">
			<Checkbox id="disabled-checked" disabled checked={true} />
			<Label for="disabled-checked" class="text-muted-foreground">Disabled checked</Label>
		</div>
		<div class="flex items-center space-x-2">
			<Checkbox id="disabled-indeterminate" disabled indeterminate={true} />
			<Label for="disabled-indeterminate" class="text-muted-foreground"
				>Disabled indeterminate</Label
			>
		</div>
	</div>
</Story>

<!-- With Description -->
<Story name="With Description">
	{#snippet template(args)}
		<div class="items-top flex space-x-2">
			<Checkbox id="terms" {...args} />
			<div class="grid gap-1.5 leading-none">
				<Label for="terms">Accept terms and conditions</Label>
				<p class="text-sm text-muted-foreground">
					You agree to our Terms of Service and Privacy Policy.
				</p>
			</div>
		</div>
	{/snippet}
</Story>

<!-- Checkbox Group -->
<Story name="Checkbox Group">
	{#snippet template()}
		<div class="flex flex-col gap-4">
			<Label class="text-base font-medium">Select your interests</Label>
			<div class="flex flex-col gap-3">
				<div class="flex items-center space-x-2">
					<Checkbox id="music" checked={true} />
					<Label for="music">Music</Label>
				</div>
				<div class="flex items-center space-x-2">
					<Checkbox id="movies" />
					<Label for="movies">Movies</Label>
				</div>
				<div class="flex items-center space-x-2">
					<Checkbox id="sports" checked={true} />
					<Label for="sports">Sports</Label>
				</div>
				<div class="flex items-center space-x-2">
					<Checkbox id="gaming" />
					<Label for="gaming">Gaming</Label>
				</div>
			</div>
		</div>
	{/snippet}
</Story>

<!-- Form Example -->
<Story name="Form Example">
	{#snippet template()}
		<form class="w-full max-w-sm space-y-4">
			<div class="space-y-2">
				<Label class="text-base">Notification Preferences</Label>
				<div class="flex flex-col gap-3 rounded-md border p-4">
					<div class="flex items-center space-x-2">
						<Checkbox id="email-notifications" checked={true} />
						<Label for="email-notifications">Email notifications</Label>
					</div>
					<div class="flex items-center space-x-2">
						<Checkbox id="sms-notifications" />
						<Label for="sms-notifications">SMS notifications</Label>
					</div>
					<div class="flex items-center space-x-2">
						<Checkbox id="push-notifications" checked={true} />
						<Label for="push-notifications">Push notifications</Label>
					</div>
				</div>
			</div>
			<div class="flex items-center space-x-2">
				<Checkbox id="marketing" />
				<Label for="marketing" class="text-sm">Receive marketing emails from us</Label>
			</div>
		</form>
	{/snippet}
</Story>

<!-- Playground -->
<Story name="Playground">
	{#snippet template(args)}
		<div class="flex items-center space-x-2">
			<Checkbox id="playground" {...args} />
			<Label for="playground">Playground checkbox</Label>
		</div>
	{/snippet}
</Story>
