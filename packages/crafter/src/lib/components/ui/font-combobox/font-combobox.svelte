<!--
	Font selection combobox component.
	Encapsulates the font selection pattern with internal state management for open/close and focus handling.
-->
<script lang="ts">
	import { tick } from "svelte";
	import {
		Combobox,
		ComboboxTrigger,
		ComboboxContent,
		ComboboxCommand,
		ComboboxInput,
		ComboboxList,
		ComboboxEmpty,
		ComboboxGroup,
		ComboboxItem,
		Label,
	} from "@ujl-framework/ui";

	const defaultFontOptions = [
		{ value: "Inter Variable", label: "Inter" },
		{ value: "Open Sans Variable", label: "Open Sans" },
		{ value: "Roboto Variable", label: "Roboto" },
		{ value: "Montserrat Variable", label: "Montserrat" },
		{ value: "Oswald Variable", label: "Oswald" },
		{ value: "Raleway Variable", label: "Raleway" },
		{ value: "Merriweather Variable", label: "Merriweather" },
		{ value: "Noto Sans Variable", label: "Noto Sans" },
		{ value: "Nunito Sans Variable", label: "Nunito Sans" },
		{ value: "JetBrains Mono Variable", label: "JetBrains Mono" },
	];

	let {
		id,
		label = "Font",
		value = $bindable<string>(),
		options = defaultFontOptions,
		onchange,
	}: {
		id: string;
		label?: string;
		value?: string;
		options?: Array<{ value: string; label: string }>;
		onchange?: (value: string) => void;
	} = $props();

	// State for combobox open/close management
	let open = $state(false);
	let triggerRef = $state<HTMLButtonElement | null>(null);

	// Derived value for displaying selected font in trigger
	const triggerContent = $derived(
		options.find((opt) => opt.value === value)?.label ?? "Select font",
	);

	// Helper function to close and focus combobox
	function closeAndFocus() {
		open = false;
		tick().then(() => {
			triggerRef?.focus();
		});
	}
</script>

<div class="space-y-2">
	<Label for={id} class="text-xs">{label}</Label>
	<Combobox bind:open bind:value>
		<ComboboxTrigger bind:ref={triggerRef} {id} class="w-full">
			{triggerContent}
		</ComboboxTrigger>
		<ComboboxContent class="max-w-52">
			<ComboboxCommand>
				<ComboboxInput placeholder="Search fonts..." />
				<ComboboxList>
					<ComboboxEmpty>No fonts found.</ComboboxEmpty>
					<ComboboxGroup>
						{#each options as font (font.value)}
							<ComboboxItem
								value={font.value}
								label={font.label}
								onSelect={() => {
									value = font.value;
									onchange?.(font.value);
									closeAndFocus();
								}}
							>
								{font.label}
							</ComboboxItem>
						{/each}
					</ComboboxGroup>
				</ComboboxList>
			</ComboboxCommand>
		</ComboboxContent>
	</Combobox>
</div>
